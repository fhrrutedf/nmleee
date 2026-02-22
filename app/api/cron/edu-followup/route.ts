import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { eduFollowupTemplate, courseCompletionTemplate } from '@/lib/email-templates';

// CRON: يعمل يومياً الساعة 10 صباحاً
// يرسل تذكيرات للطلاب الخاملين في الكورسات
export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let sent = 0;
    const now = new Date();

    try {
        // جلب المدربين الذين فعّلوا المتابعة التعليمية
        const settings = await db.automationSettings.findMany({
            where: { eduFollowupEnabled: true },
        });

        for (const setting of settings) {
            const inactivityThreshold = new Date(now.getTime() - setting.inactivityDays * 24 * 60 * 60 * 1000);

            const seller = await db.user.findUnique({ where: { id: setting.userId } });
            if (!seller) continue;

            // جلب التسجيلات الخاملة (لم تُفتح منذ X أيام)
            const inactiveEnrollments = await db.courseEnrollment.findMany({
                where: {
                    isCompleted: false,
                    course: { userId: setting.userId },
                    lastAccessedAt: {
                        not: null,
                        lt: inactivityThreshold,
                    },
                },
                include: {
                    course: {
                        include: { modules: { include: { lessons: true } } }
                    }
                },
                take: 50, // لتجنب إرسال كميات ضخمة
            });

            for (const enrollment of inactiveEnrollments) {
                const continueUrl = `${process.env.NEXTAUTH_URL}/learn/${enrollment.courseId}`;

                // حساب عدد الدروس المتبقية
                const totalLessons = enrollment.course.modules.reduce(
                    (sum, m) => sum + m.lessons.length, 0
                );
                const completedLessons = Math.floor(totalLessons * enrollment.progress / 100);
                const remainingLessons = totalLessons - completedLessons;

                const html = eduFollowupTemplate({
                    studentName: enrollment.studentName,
                    sellerName: seller.name,
                    brandColor: seller.brandColor || '#0ea5e9',
                    courseName: enrollment.course.title,
                    progressPercent: enrollment.progress,
                    remainingLessons,
                    continueUrl,
                });

                const result = await sendEmail({
                    to: enrollment.studentEmail,
                    toName: enrollment.studentName,
                    subject: `💪 كمّل مسيرتك - باقي ${remainingLessons} دروس فقط!`,
                    html,
                    fromName: seller.name,
                });

                await db.emailLog.create({
                    data: {
                        type: 'edu_followup',
                        toEmail: enrollment.studentEmail,
                        toName: enrollment.studentName,
                        subject: `تذكير إكمال الكورس`,
                        status: result.success ? 'sent' : 'failed',
                        errorMessage: result.error,
                        sellerId: setting.userId,
                    },
                });

                if (result.success) sent++;
            }
        }

        return NextResponse.json({ success: true, sent });
    } catch (error) {
        console.error('Edu followup cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
