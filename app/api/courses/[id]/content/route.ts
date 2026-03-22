import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseSlugOrId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Resolve Course ID securely without throwing Prisma errors on bad UUIDs
        let resolvedCourseId = courseSlugOrId;
        let courseRecord = null;
        
        try {
            // First treat it as an ID 
            courseRecord = await prisma.course.findUnique({ where: { id: courseSlugOrId } });
        } catch (e) {
            // If it fails (e.g. malformed UUID), do nothing here
        }

        if (!courseRecord) {
            try {
                // Then try as a slug if model supports it (backward compat)
                courseRecord = await (prisma.course as any).findFirst({ where: { slug: courseSlugOrId } });
            } catch (e) {
                // Ignore
            }
        }

        if (!courseRecord) {
            return new NextResponse('Course not found', { status: 404 });
        }

        resolvedCourseId = courseRecord.id;

        // 2. Check Permissions & Identity
        const userEmail = session.user.email.toLowerCase().trim();
        const isAdmin = (session.user as any).role === 'ADMIN';
        const isCreator = courseRecord.userId === (session.user as any).id;
        
        const enrollment = await prisma.courseEnrollment.findFirst({
            where: {
                courseId: resolvedCourseId,
                studentEmail: { equals: userEmail, mode: 'insensitive' }
            },
        });

        const hasAccess = !!enrollment || isCreator || isAdmin;
        if (!hasAccess) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // 3. Fetch full course payload (Filtered for students, unfiltered for owners)
        const isStudentOnly = !isCreator && !isAdmin;

        const course: any = await prisma.course.findUnique({
            where: { id: resolvedCourseId },
            include: {
                modules: {
                    where: isStudentOnly ? { isPublished: true } : {},
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            where: isStudentOnly ? { isPublished: true } : {},
                            orderBy: { order: 'asc' },
                            include: {
                                progress: {
                                    where: { enrollmentId: enrollment?.id || 'none' },
                                    select: { isCompleted: true, lastPosition: true }
                                },
                                quizzes: {
                                    where: isStudentOnly ? { isPublished: true } : {},
                                    select: {
                                        id: true,
                                        title: true,
                                        description: true,
                                        isPublished: true,
                                        passingScore: true,
                                        timeLimit: true,
                                        questions: true,
                                    }
                                }
                            }
                        }
                    }
                },
                quizzes: {
                    where: isStudentOnly ? { isPublished: true, lessonId: null } : { lessonId: null },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        isPublished: true,
                        passingScore: true,
                        timeLimit: true,
                        questions: true,
                    }
                },
                certificates: {
                    where: { 
                        studentEmail: { equals: userEmail, mode: 'insensitive' }
                    }
                },
                user: {
                    select: { brandColor: true, name: true, username: true }
                }
            }
        });

        if (!course) {
            return new NextResponse('Course not found', { status: 404 });
        }

        // 4. Sanitize Quiz Questions (Remove correct answers) ONLY for students
        const sanitizedModules = isStudentOnly 
            ? (course.modules || []).map((module: any) => ({
                ...module,
                lessons: (module.lessons || []).map((lesson: any) => ({
                    ...lesson,
                    completed: lesson.progress?.[0]?.isCompleted || false,
                    lastPosition: lesson.progress?.[0]?.lastPosition || 0,
                    quizzes: (lesson.quizzes || []).map((quiz: any) => {
                        const questions = (Array.isArray(quiz.questions) ? quiz.questions : []).map((q: any) => {
                            const { correctAnswer, ...rest } = q;
                            return rest;
                        });
                        return { ...quiz, questions };
                    })
                }))
            }))
            : (course.modules || []).map((module: any) => ({
                ...module,
                lessons: (module.lessons || []).map((lesson: any) => ({
                    ...lesson,
                    completed: lesson.progress?.[0]?.isCompleted || false,
                    lastPosition: lesson.progress?.[0]?.lastPosition || 0,
                    quizzes: lesson.quizzes || []
                }))
            }));

        const sanitizedCourseQuizzes = isStudentOnly && course.quizzes
            ? (course.quizzes || []).map((quiz: any) => {
                const questions = (Array.isArray(quiz.questions) ? quiz.questions : []).map((q: any) => {
                    const { correctAnswer, ...rest } = q;
                    return rest;
                });
                return { ...quiz, questions };
            })
            : course.quizzes || [];

        return NextResponse.json({
            ...course,
            modules: sanitizedModules,
            quizzes: sanitizedCourseQuizzes,
            isEnrolled: true, // They have access at this point
            enrollmentId: enrollment?.id,
            certificate: course.certificates[0] || null
        });

    } catch (error) {
        console.error('[COURSE_CONTENT_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
