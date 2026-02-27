import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if user has access (Enrolled or is Admin/Creator)
        // For simplicity, we prioritize enrollment check
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId: courseId,
                    studentEmail: session.user.email,
                },
            },
        });

        // Also allow the course creator to view it
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    where: { isPublished: true },
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: { isPublished: true },
                            orderBy: { order: 'asc' },
                            include: {
                                quizzes: {
                                    where: { isPublished: true },
                                    select: {
                                        id: true,
                                        title: true,
                                        passingScore: true,
                                        timeLimit: true,
                                        questions: true, // Only if taking quiz, maybe hide answers?
                                        // Ideally, we shouldn't send correct answers here.
                                        // We'll strip them in the response.
                                    }
                                }
                            }
                        }
                    }
                },
                certificates: {
                    where: { studentEmail: session.user.email }
                },
                user: {
                    select: {
                        brandColor: true,
                        name: true,
                        username: true
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse('Course not found', { status: 404 });
        }

        // Access Check: Creator or Enrolled
        const isCreator = course.userId === session.user.id;
        if (!enrollment && !isCreator && (session.user as any).role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Sanitize Quiz Questions (Remove correct answers)
        const sanitizedModules = course.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => ({
                ...lesson,
                quizzes: lesson.quizzes.map(quiz => {
                    const questions = (quiz.questions as any[]).map(q => {
                        const { correctAnswer, ...rest } = q;
                        return rest;
                    });
                    return { ...quiz, questions };
                })
            }))
        }));

        return NextResponse.json({
            ...course,
            modules: sanitizedModules,
            isEnrolled: !!enrollment,
            enrollmentId: enrollment?.id,
            certificate: course.certificates[0] || null
        });

    } catch (error) {
        console.error('[COURSE_CONTENT_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
