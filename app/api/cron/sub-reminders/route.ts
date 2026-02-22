import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { subscriptionReminderTemplate } from '@/lib/email-templates';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// CRON: يعمل يومياً الساعة 9 صباحاً
export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let sent = 0;
    const now = new Date();

    try {
        const settings = await db.automationSettings.findMany({
            where: { subRemindersEnabled: true },
        });

        const enabledSellerIds = settings.map(s => s.userId);

        // جلب الاشتراكات النشطة التي تنتهي قريباً
        const subscriptions = await db.subscription.findMany({
            where: {
                status: 'active',
                cancelAtPeriodEnd: false,
                plan: { userId: { in: enabledSellerIds } },
                currentPeriodEnd: {
                    gte: now,
                    lte: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // خلال أسبوع
                },
            },
            include: {
                plan: { include: { user: true } },
                customer: true,
            },
        });

        for (const subscription of subscriptions) {
            const daysLeft = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // إرسال عند: 7 أيام، 1 يوم، يوم الانتهاء (0 أيام)
            if (![7, 1, 0].includes(daysLeft)) continue;

            const seller = subscription.plan.user;
            const expiresAt = format(subscription.currentPeriodEnd, 'yyyy-MM-dd', { locale: ar });
            const renewUrl = `${process.env.NEXTAUTH_URL}/checkout?plan=${subscription.planId}`;

            const html = subscriptionReminderTemplate({
                customerName: subscription.customer.name,
                sellerName: seller.name,
                brandColor: seller.brandColor || '#0ea5e9',
                planName: subscription.plan.name,
                expiresAt,
                renewUrl,
                daysLeft,
            });

            const result = await sendEmail({
                to: subscription.customer.email,
                toName: subscription.customer.name,
                subject: daysLeft === 0
                    ? `🚨 انتهى اشتراكك في ${subscription.plan.name}`
                    : `⏰ اشتراكك ينتهي خلال ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}`,
                html,
                fromName: seller.name,
            });

            await db.emailLog.create({
                data: {
                    type: 'sub_reminder',
                    toEmail: subscription.customer.email,
                    toName: subscription.customer.name,
                    subject: `تذكير تجديد الاشتراك`,
                    status: result.success ? 'sent' : 'failed',
                    errorMessage: result.error,
                    sellerId: seller.id,
                },
            });

            if (result.success) sent++;
        }

        return NextResponse.json({ success: true, sent });
    } catch (error) {
        console.error('Sub reminders cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
