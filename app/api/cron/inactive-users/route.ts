import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { marketingEmailTemplate } from '@/lib/email-templates';

export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let sent = 0;
    const now = new Date();

    try {
        // ─── 1. الإيميلات المجدولة ───────────────────────────────────────
        const scheduledEmails = await prisma.scheduledEmail.findMany({
            where: { status: 'pending', scheduledAt: { lte: now } },
        });

        for (const scheduled of scheduledEmails) {
            const seller = await prisma.user.findUnique({ where: { id: scheduled.sellerId } });
            if (!seller) continue;

            let recipientEmails: { email: string; name?: string }[] = [];

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

            let emailsSent = 0;
            for (const recipient of recipientEmails) {
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
                await prisma.emailLog.create({ data: { type: 'marketing', toEmail: recipient.email, toName: recipient.name, subject: scheduled.subject, status: result.success ? 'sent' : 'failed', errorMessage: result.error, sellerId: seller.id } });
                if (result.success) { sent++; emailsSent++; }
            }

            await prisma.scheduledEmail.update({
                where: { id: scheduled.id },
                data: { status: 'sent', sentAt: now, recipientCount: emailsSent },
            });
        }

        // ─── 2. عملاء خاملين تلقائياً ──────────────────────────────────
        const marketingSettings = await prisma.automationSettings.findMany({
            where: { marketingEnabled: true },
            include: { user: true },
        });

        for (const setting of marketingSettings) {
            const seller = setting.user;
            const threshold = new Date(now.getTime() - setting.inactiveUserDays * 24 * 60 * 60 * 1000);

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

            for (const customer of allBuyers.filter(b => !recentEmails.has(b.customerEmail))) {
                const recentLog = await prisma.emailLog.findFirst({
                    where: { sellerId: seller.id, toEmail: customer.customerEmail, type: 'marketing', createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
                });
                if (recentLog) continue;

                const html = marketingEmailTemplate({
                    customerName: customer.customerName || customer.customerEmail,
                    sellerName: seller.name,
                    brandColor: seller.brandColor || '#0ea5e9',
                    subject: `نفتقدك في ${seller.name}! 💙`,
                    body: 'مرحباً! مرّ وقت طويل منذ آخر زيارة لك. لدينا منتجات رائعة تنتظرك!',
                    discountCode: setting.inactiveUserDiscount ? `WELCOME${Math.floor(setting.inactiveUserDiscount)}` : undefined,
                    discountPercent: setting.inactiveUserDiscount || undefined,
                    ctaUrl: `${process.env.NEXTAUTH_URL}/${seller.username}`,
                    ctaText: 'عُد وتسوّق الآن',
                });

                const result = await sendEmail({ to: customer.customerEmail, toName: customer.customerName, subject: `نفتقدك! 💙 - ${seller.name}`, html, fromName: seller.name });
                await prisma.emailLog.create({ data: { type: 'marketing', toEmail: customer.customerEmail, toName: customer.customerName, subject: 'نفتقدك', status: result.success ? 'sent' : 'failed', errorMessage: result.error, sellerId: seller.id } });
                if (result.success) sent++;
            }
        }

        return NextResponse.json({ success: true, sent });
    } catch (error) {
        console.error('Inactive users cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
