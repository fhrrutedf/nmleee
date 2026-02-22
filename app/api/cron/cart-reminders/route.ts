import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { cartReminderTemplate } from '@/lib/email-templates';

// CRON: يعمل كل ساعة
// يتحقق من السلات المهجورة ويرسل التذكيرات المناسبة

export async function GET(req: NextRequest) {
    // التحقق من الأمان
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let sent = 0;
    let errors = 0;
    const now = new Date();

    try {
        // جلب السلات غير المكتملة
        const carts = await db.abandonedCart.findMany({
            where: { isConverted: false },
        });

        for (const cart of carts) {
            const hoursSinceCreated = (now.getTime() - cart.createdAt.getTime()) / (1000 * 60 * 60);

            // جلب إعدادات البائع
            const settings = await db.automationSettings.findUnique({
                where: { userId: cart.sellerId },
            });
            if (!settings) continue;

            const seller = await db.user.findUnique({ where: { id: cart.sellerId } });
            if (!seller) continue;

            const checkoutUrl = `${process.env.NEXTAUTH_URL || 'https://yourdomain.com'}/checkout`;

            // تذكير 1: بعد ساعة
            if (settings.cartReminder1Enabled && !cart.reminder1SentAt && hoursSinceCreated >= 1 && hoursSinceCreated < 24) {
                const html = cartReminderTemplate({
                    customerName: cart.customerName || cart.customerEmail,
                    sellerName: seller.name,
                    brandColor: seller.brandColor || '#0ea5e9',
                    reminderNumber: 1,
                    products: cart.productNames,
                    totalAmount: cart.totalAmount,
                    customBody: settings.cartReminder1Body || undefined,
                    checkoutUrl,
                });

                const result = await sendEmail({
                    to: cart.customerEmail,
                    subject: `🛒 نسيت شيئاً في سلتك - ${seller.name}`,
                    html,
                    fromName: seller.name,
                });

                await db.abandonedCart.update({
                    where: { id: cart.id },
                    data: { reminder1SentAt: now },
                });

                await db.emailLog.create({
                    data: {
                        type: 'cart_reminder_1',
                        toEmail: cart.customerEmail,
                        toName: cart.customerName || undefined,
                        subject: `نسيت شيئاً في سلتك`,
                        status: result.success ? 'sent' : 'failed',
                        errorMessage: result.error,
                        sellerId: cart.sellerId,
                    },
                });

                if (result.success) sent++;
                else errors++;
            }

            // تذكير 2: بعد 24 ساعة
            if (settings.cartReminder2Enabled && !cart.reminder2SentAt && cart.reminder1SentAt && hoursSinceCreated >= 24 && hoursSinceCreated < 72) {
                const html = cartReminderTemplate({
                    customerName: cart.customerName || cart.customerEmail,
                    sellerName: seller.name,
                    brandColor: seller.brandColor || '#0ea5e9',
                    reminderNumber: 2,
                    products: cart.productNames,
                    totalAmount: cart.totalAmount,
                    customBody: settings.cartReminder2Body || undefined,
                    checkoutUrl,
                });

                const result = await sendEmail({
                    to: cart.customerEmail,
                    subject: `⏰ لا تفوّت ما اخترته - ${seller.name}`,
                    html,
                    fromName: seller.name,
                });

                await db.abandonedCart.update({
                    where: { id: cart.id },
                    data: { reminder2SentAt: now },
                });

                await db.emailLog.create({
                    data: {
                        type: 'cart_reminder_2',
                        toEmail: cart.customerEmail,
                        toName: cart.customerName || undefined,
                        subject: `لا تفوّت ما اخترته`,
                        status: result.success ? 'sent' : 'failed',
                        errorMessage: result.error,
                        sellerId: cart.sellerId,
                    },
                });

                if (result.success) sent++;
                else errors++;
            }

            // تذكير 3: بعد 3 أيام
            if (settings.cartReminder3Enabled && !cart.reminder3SentAt && cart.reminder2SentAt && hoursSinceCreated >= 72) {
                const html = cartReminderTemplate({
                    customerName: cart.customerName || cart.customerEmail,
                    sellerName: seller.name,
                    brandColor: seller.brandColor || '#0ea5e9',
                    reminderNumber: 3,
                    products: cart.productNames,
                    totalAmount: cart.totalAmount,
                    customBody: settings.cartReminder3Body || undefined,
                    discountPercent: settings.cartReminder3Discount || undefined,
                    checkoutUrl,
                });

                const result = await sendEmail({
                    to: cart.customerEmail,
                    subject: `🎁 عرض خاص لك فقط - ${seller.name}`,
                    html,
                    fromName: seller.name,
                });

                await db.abandonedCart.update({
                    where: { id: cart.id },
                    data: { reminder3SentAt: now },
                });

                await db.emailLog.create({
                    data: {
                        type: 'cart_reminder_3',
                        toEmail: cart.customerEmail,
                        toName: cart.customerName || undefined,
                        subject: `عرض خاص لك فقط`,
                        status: result.success ? 'sent' : 'failed',
                        errorMessage: result.error,
                        sellerId: cart.sellerId,
                    },
                });

                if (result.success) sent++;
                else errors++;
            }
        }

        return NextResponse.json({ success: true, sent, errors });
    } catch (error) {
        console.error('Cart reminders cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
