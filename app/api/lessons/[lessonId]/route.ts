import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - جلب درس محدد (يدعم المعاينة المجانية)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const session = await getServerSession(authOptions);

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                userId: true,
                                isActive: true,
                                allowComments: true,
                            }
                        }
                    }
                },
                quizzes: {
                    where: { isPublished: true },
                    select: {
                        id: true,
                        title: true,
                        passingScore: true,
                        timeLimit: true,
                    }
                },
                comments: {
                    where: { parentId: null, isApproved: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        replies: {
                            where: { isApproved: true },
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        if (!lesson.module?.course?.isActive) {
            return NextResponse.json({ error: 'الدورة غير متاحة' }, { status: 403 });
        }

        const courseId = lesson.module.course.id;
        const isFreeLesson = lesson.isFree;

        // التحقق من التسجيل للدروس المدفوعة
        let enrollment = null;
        let progress = null;
        
        if (session?.user?.email) {
            enrollment = await prisma.courseEnrollment.findUnique({
                where: {
                    courseId_studentEmail: {
                        courseId,
                        studentEmail: session.user.email
                    }
                }
            });
        }

        // إذا الدرس مش مجاني والطالب مش مسجل
        if (!isFreeLesson && !enrollment) {
            return NextResponse.json({
                error: 'يجب شراء الدورة لمشاهدة هذا الدرس',
                isFree: false,
                requiresEnrollment: true,
                courseId,
                lesson: {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    isFree: lesson.isFree,
                }
            }, { status: 403 });
        }

        // جلب تقدم الطالب إذا كان مسجل
        if (enrollment) {
            progress = await prisma.lessonProgress.findUnique({
                where: {
                    lessonId_enrollmentId: {
                        lessonId,
                        enrollmentId: enrollment.id
                    }
                }
            });

            await prisma.courseEnrollment.update({
                where: { id: enrollment.id },
                data: { lastAccessedAt: new Date() }
            });
        }

        const isPreview = isFreeLesson && !enrollment;

        return NextResponse.json({
            lesson: {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                videoDuration: lesson.videoDuration,
                bunnyVideoId: lesson.bunnyVideoId,
                bunnyLibraryId: lesson.bunnyLibraryId,
                muxPlaybackId: lesson.muxPlaybackId,
                isProtected: lesson.isProtected,
                isFree: lesson.isFree,
                isPublished: lesson.isPublished,
                attachments: lesson.attachments,
                order: lesson.order,
            },
            course: {
                id: lesson.module.course.id,
                title: lesson.module.course.title,
                allowComments: lesson.module.course.allowComments,
            },
            module: {
                id: lesson.module.id,
                title: lesson.module.title,
            },
            quizzes: enrollment ? lesson.quizzes : [], // إخفاء الاختبارات في المعاينة
            comments: lesson.module.course.allowComments ? lesson.comments : [],
            progress: progress ? {
                isCompleted: progress.isCompleted,
                watchedDuration: progress.watchedDuration,
                lastPosition: progress.lastPosition,
            } : null,
            isPreview, // true = معاينة مجانية بدون تسجيل
            enrollment: enrollment ? {
                id: enrollment.id,
                progress: enrollment.progress,
            } : null,
        });

    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الدرس' }, { status: 500 });
    }
}

// PUT - تحديث درس
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        const body = await req.json();
        const { 
            title, 
            description, 
            content, 
            videoUrl, 
            videoDuration, 
            isPublished, 
            isFree, 
            attachments,
            bunnyVideoId,
            bunnyLibraryId
        } = body;

        const updatedLesson = await (prisma.lesson as any).update({
            where: { id: lessonId },
            data: {
                title,
                description,
                content,
                videoUrl,
                videoDuration: videoDuration ? parseInt(videoDuration.toString()) : null,
                isPublished,
                isFree,
                attachments,
                bunnyVideoId,
                bunnyLibraryId
            },
        });

        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الدرس' }, { status: 500 });
    }
}

// DELETE - حذف درس
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        await prisma.lesson.delete({
            where: { id: lessonId },
        });

        return NextResponse.json({ message: 'تم حذف الدرس بنجاح' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الدرس' }, { status: 500 });
    }
}
