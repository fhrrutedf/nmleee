import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { courseId, lessonId } = await req.json();

        if (!courseId || !lessonId) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        // Check if user has access to this course
        const hasAccess = await prisma.order.findFirst({
            where: {
                customerEmail: session.user.email,
                status: 'PAID',
                items: {
                    some: {
                        courseId,
                    },
                },
            },
        });

        if (!hasAccess) {
            return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
        }

        let enrollment = await prisma.courseEnrollment.findFirst({
            where: {
                courseId,
                studentEmail: session.user.email,
            }
        });

        if (!enrollment) {
            enrollment = await prisma.courseEnrollment.create({
                data: {
                    courseId,
                    studentEmail: session.user.email,
                    studentName: session.user.name || 'طالب',
                    orderId: hasAccess.id
                }
            });
        }

        // Mark lesson as complete
        await prisma.lessonProgress.upsert({
            where: {
                lessonId_enrollmentId: {
                    lessonId,
                    enrollmentId: enrollment.id
                }
            },
            create: {
                lessonId,
                enrollmentId: enrollment.id,
                isCompleted: true,
                lastWatchedAt: new Date()
            },
            update: {
                isCompleted: true,
                lastWatchedAt: new Date()
            }
        });

        // Recalculate overall course progress
        const totalLessons = await prisma.lesson.count({
            where: { module: { courseId }, isPublished: true }
        });

        const completedLessons = await prisma.lessonProgress.count({
            where: { enrollmentId: enrollment.id, isCompleted: true }
        });

        const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const isCourseCompleted = totalLessons > 0 && completedLessons >= totalLessons;

        await prisma.courseEnrollment.update({
            where: { id: enrollment.id },
            data: {
                progress: progressPercent,
                isCompleted: isCourseCompleted,
                completedAt: isCourseCompleted ? new Date() : undefined,
                lastAccessedAt: new Date(),
            }
        });

        return NextResponse.json({
            success: true,
            progress: progressPercent,
            isCompleted: isCourseCompleted,
        });
    } catch (error) {
        console.error('Error marking complete:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
