import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { marketingEmailTemplate } from '@/lib/email-templates';

/**
 * 🕵️‍♂️ INACTIVE USER RECOVERY CRON
 * Phase 7: Smart Marketing & Performance Refactoring
 * 1. Batch Processing (50/batch) to avoid timeouts.
 * 2. Smart Coupon Logic: Creates actual records in Coupon table.
 * 3. Scarcity: Coupons expire in 7 days.
 * 4. Custom Messaging: Uses seller-defined "Miss You" message.
 * 5. Tracking: Integrated EmailLog tracking.
 */
export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized CRON access' }, { status: 401 });
    }

    let totalSent = 0;
    const now = new Date();
    const batchSize = 50;

    try {
        // --- SECTION A: Scheduled Emails ---
        const scheduledEmails = await prisma.scheduledEmail.findMany({
            where: { status: 'pending', scheduledAt: { lte: now } },
        });

        for (const scheduled of scheduledEmails) {
            const seller = await prisma.user.findUnique({ where: { id: scheduled.sellerId } });
            if (!seller) continue;

            let recipientEmails: { email: string; name?: string }[] = [];
            // Target logic (kept from original for compatibility)
            if (scheduled.targetGroup === 'all' || scheduled.targetGroup === 'buyers') {
                const orders = await prisma.order.findMany({
                    where: { sellerId: seller.id, isPaid: true },
                    select: { customerEmail: true, customerName: true },
                    distinct: ['customerEmail'],
                });
                recipientEmails = orders.map(o => ({ email: o.customerEmail, name: o.customerName }));
            } else if (scheduled.targetGroup === 'inactive') {
                const settings = await prisma.automationSettings.findUnique({ where: { userId: seller.id } });
                const inactiveDays = settings?.inactiveUserDays || 30;
                const threshold = new Date(now.getTime() - inactiveDays * 24 * 60 * 60 * 1000);
                const recentBuyers = await prisma.order.findMany({
                    where: { sellerId: seller.id, isPaid: true, createdAt: { gte: threshold } },
                    select: { customerEmail: true },
                });
                const recentEmails = new Set(recentBuyers.map(o => o.customerEmail));
                const allBuyers = await prisma.order.findMany({
                    where: { sellerId: seller.id, isPaid: true },
                    select: { customerEmail: true, customerName: true },
                    distinct: ['customerEmail'],
                });
                recipientEmails = allBuyers.filter(b => !recentEmails.has(b.customerEmail)).map(o => ({ email: o.customerEmail, name: o.customerName }));
            }

            // --- BATCH PROCESSING for Scheduled ---
            for (let i = 0; i < recipientEmails.length; i += batchSize) {
                const batch = recipientEmails.slice(i, i + batchSize);
                await Promise.all(batch.map(async (recipient) => {
                    const html = marketingEmailTemplate({
                        customerName: recipient.name || recipient.email,
                        sellerName: seller.name,
                        brandColor: seller.brandColor || '#0ea5e9',
                        subject: scheduled.subject,
                        body: scheduled.body,
                        discountCode: scheduled.discountCode || undefined,
                        ctaUrl: `${process.env.NEXTAUTH_URL}/${seller.username}`,
                        ctaText: 'تسوّق الآن',
                    });

                    const result = await sendEmail({ to: recipient.email, toName: recipient.name, subject: scheduled.subject, html, fromName: seller.name });
                    if (result.success) totalSent++;
                }));
            }

            await prisma.scheduledEmail.update({
                where: { id: scheduled.id },
                data: { status: 'sent', sentAt: now, recipientCount: recipientEmails.length },
            });
        }

        // --- SECTION B: Auto-Inactivity Marketing (The AI Brain) ---
        const marketingSettings = await prisma.automationSettings.findMany({
            where: { marketingEnabled: true },
            include: { user: true },
        });

        for (const setting of marketingSettings) {
            const seller = setting.user;
            const threshold = new Date(now.getTime() - setting.inactiveUserDays * 24 * 60 * 60 * 1000);

            // Find truly inactive customers
            const recentBuyers = await prisma.order.findMany({
                where: { sellerId: seller.id, isPaid: true, createdAt: { gte: threshold } },
                select: { customerEmail: true },
            });
            const recentEmails = new Set(recentBuyers.map(o => o.customerEmail));

            const allBuyers = await prisma.order.findMany({
                where: { sellerId: seller.id, isPaid: true },
                select: { customerEmail: true, customerName: true },
                distinct: ['customerEmail'],
            });

            const inactiveCustomers = allBuyers.filter(b => !recentEmails.has(b.customerEmail));

            // --- BATCH PROCESSING for Inactive ---
            for (let i = 0; i < inactiveCustomers.length; i += batchSize) {
                const batch = inactiveCustomers.slice(i, i + batchSize);
                
                await Promise.all(batch.map(async (customer) => {
                    // Avoid spamming (max 1 marketing email per month)
                    const recentLog = await prisma.emailLog.findFirst({
                        where: { sellerId: seller.id, toEmail: customer.customerEmail, type: 'marketing', createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
                    });
                    if (recentLog) return;

                    // 🎟️ SMART COUPON GENERATION
                    let dynamicCode = undefined;
                    if (setting.inactiveUserDiscount) {
                        const randomSuffix = Math.random().toString(36).substring(7).toUpperCase();
                        dynamicCode = `MISSU-${randomSuffix}`;
                        
                        await prisma.coupon.create({
                            data: {
                                code: dynamicCode,
                                type: 'percentage',
                                value: setting.inactiveUserDiscount,
                                isActive: true,
                                userId: seller.id,
                                usageLimit: 1,
                                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
                            }
                        });
                    }

                    const subject = `نفتقدك في ${seller.name}! 💙`;
                    
                    // Create tracking ID (EmailLog record)
                    const log = await prisma.emailLog.create({
                        data: {
                            type: 'marketing',
                            toEmail: customer.customerEmail,
                            toName: customer.customerName,
                            subject: subject,
                            sellerId: seller.id,
                            status: 'pending'
                        }
                    });

                    // 📧 Tracking Pixel & Personalized Message
                    const trackingUrl = `${process.env.NEXTAUTH_URL}/api/tracking/email/open?logId=${log.id}`;
                    const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />`;

                    const html = marketingEmailTemplate({
                        customerName: customer.customerName || customer.customerEmail,
                        sellerName: seller.name,
                        brandColor: seller.brandColor || '#0ea5e9',
                        subject: subject,
                        body: setting.inactiveUserMessage || 'مرحباً! لاحظنا غيابك منذ فترة... يسعدنا دعوتك للحصول على خصم خاص للعودة!',
                        discountCode: dynamicCode,
                        discountPercent: setting.inactiveUserDiscount || undefined,
                        ctaUrl: `${process.env.NEXTAUTH_URL}/${seller.username}`,
                        ctaText: 'استخدم الرصيد الآن',
                    }) + pixel;

                    const result = await sendEmail({ to: customer.customerEmail, toName: customer.customerName, subject, html, fromName: seller.name });
                    
                    await prisma.emailLog.update({
                        where: { id: log.id },
                        data: { status: result.success ? 'sent' : 'failed', errorMessage: result.error }
                    });

                    if (result.success) totalSent++;
                }));
            }
        }

        return NextResponse.json({ success: true, sentCount: totalSent });
    } catch (error: any) {
        console.error('[CRON]: Inactive Discovery Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
