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

        const userEmail = session.user.email.toLowerCase().trim();

        // ─── التحقق من الوصول ─────────────────────────────────────────────────
        // 1. هل لديه Enrollment مباشر؟ (مجاني / يدوي / Stripe)
        let enrollment = await prisma.courseEnrollment.findFirst({
            where: {
                courseId,
                studentEmail: { equals: userEmail, mode: 'insensitive' },
            }
        });

        // 2. إذا لم يكن enrolled، تحقق من Order مدفوع
        if (!enrollment) {
            const paidOrder = await prisma.order.findFirst({
                where: {
                    customerEmail: { equals: userEmail, mode: 'insensitive' },
                    status: { in: ['PAID', 'COMPLETED'] },
                    items: {
                        some: { courseId }
                    },
                },
            });

            if (!paidOrder) {
                // 3. تحقق من أن المستخدم هو صاحب الكورس (المدرب)
                const course = await prisma.course.findUnique({
                    where: { id: courseId },
                    select: { userId: true }
                });
                const isOwner = course?.userId === (session.user as any).id;
                const isAdmin = (session.user as any).role === 'ADMIN';

                if (!isOwner && !isAdmin) {
                    return NextResponse.json({ error: 'ليس لديك صلاحية الوصول لهذه الدورة' }, { status: 403 });
                }

                // المدرب/الأدمن: أنشئ enrollment تلقائياً إذا لم يكن موجوداً
                enrollment = await prisma.courseEnrollment.create({
                    data: {
                        courseId,
                        studentEmail: userEmail,
                        studentName: session.user.name || 'مدرب',
                    }
                });
            } else {
                // أنشئ Enrollment من الـ Order المدفوع
                enrollment = await prisma.courseEnrollment.create({
                    data: {
                        courseId,
                        studentEmail: userEmail,
                        studentName: session.user.name || 'طالب',
                        orderId: paidOrder.id,
                    }
                });
            }
        }

        // ─── تسجيل إتمام الدرس ───────────────────────────────────────────────
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

        // ─── حساب نسبة التقدم ────────────────────────────────────────────────
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
        return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
    }
}
