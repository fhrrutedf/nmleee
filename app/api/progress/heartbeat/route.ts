import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * API لتمكين تتبع تقدم الفيديو لحظياً (Heartbeat)
 * يستقبل: lessonId, courseId, currentTime, duration
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { lessonId, courseId, currentTime, duration } = await req.json();

        if (!lessonId || !courseId || currentTime === undefined) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        // 1. التأكد من وجود اشتراك للمستخدم في هذا الكورس
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail: session.user.email
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json({ error: 'لم يتم العثور على اشتراك' }, { status: 403 });
        }

        // 2. تحديث تقدم الدرس (Upsert)
        // نحفظ مكان الفيديو (lastPosition) وإجمالي وقت المشاهدة
        const progress = await prisma.lessonProgress.upsert({
            where: {
                lessonId_enrollmentId: {
                    lessonId,
                    enrollmentId: enrollment.id
                }
            },
            create: {
                lessonId,
                enrollmentId: enrollment.id,
                lastPosition: currentTime,
                watchedDuration: Math.floor(currentTime),
                isCompleted: duration ? (currentTime / duration > 0.9) : false // تحديد كـ "مكتمل" إذا شاهد 90%
            },
            update: {
                lastPosition: currentTime,
                lastWatchedAt: new Date(),
                // تحديث حالة الاكتمال فقط إذا لم تكن مكتملة بالفعل وبشرط مشاهدة 90%
                isCompleted: {
                    set: duration ? (currentTime / duration > 0.9) : false
                }
            }
        });

        // 3. تحديث النسبة الإجمالية للكورس في الـ Enrollment
        // اختيارياً: يمكن حساب النسبة بناءً على عدد الدروس المكتملة
        await updateCourseOverallProgress(enrollment.id, courseId);

        return NextResponse.json({ success: true, progress });
    } catch (error: any) {
        console.error('Error tracking progress:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function updateCourseOverallProgress(enrollmentId: string, courseId: string) {
    const totalLessons = await prisma.lesson.count({
        where: { module: { courseId } }
    });
    
    if (totalLessons === 0) return;

    const completedLessons = await prisma.lessonProgress.count({
        where: {
            enrollmentId,
            isCompleted: true,
            lesson: { module: { courseId } }
        }
    });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: {
            progress: progressPercentage,
            isCompleted: progressPercentage === 100,
            completedAt: progressPercentage === 100 ? new Date() : null
        }
    });
}
