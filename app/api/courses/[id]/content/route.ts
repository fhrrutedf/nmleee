import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

        // 2. Check if student has an enrollment (Case-insensitive & Trimmed)
        const userEmail = session.user.email.toLowerCase().trim();
        const enrollment = await prisma.courseEnrollment.findFirst({
            where: {
                courseId: resolvedCourseId,
                studentEmail: {
                    equals: userEmail,
                    mode: 'insensitive'
                }
            },
        });

        // 3. Fetch the full course payload
        const course = await prisma.course.findUnique({
            where: { id: resolvedCourseId },
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
                                        questions: true,
                                    }
                                }
                            }
                        }
                    }
                },
                certificates: {
                    where: { 
                        studentEmail: {
                            equals: userEmail,
                            mode: 'insensitive'
                        }
                    }
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
        
        const isCreator = course.userId === (session.user as any).id;
        const isAdmin = (session.user as any).role === 'ADMIN';
        const hasAccess = !!enrollment || isCreator || isAdmin;
        
        console.log('[CourseAccess] Checking permissions for:', userEmail);
        console.log('[CourseAccess] resolvedCourseId:', resolvedCourseId);
        console.log('[CourseAccess] isCreator:', isCreator);
        console.log('[CourseAccess] isAdmin:', isAdmin);
        console.log('[CourseAccess] hasEnrollment:', !!enrollment);
        
        if (!hasAccess) {
            console.log('[CourseAccess] Result: FORBIDDEN');
            return new NextResponse('Forbidden', { status: 403 });
        }
        
        console.log('[CourseAccess] Result: GRANTED');

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
            isEnrolled: hasAccess, // User-facing field: can they watch the course?
            enrollmentId: enrollment?.id,
            certificate: course.certificates[0] || null
        });

    } catch (error) {
        console.error('[COURSE_CONTENT_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
