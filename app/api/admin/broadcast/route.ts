import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendBulkNotification } from '@/lib/novu';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';

const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// POST /api/admin/broadcast
export async function POST(req: NextRequest) {
    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'الرجاء إعداد RESEND_API_KEY' }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subject, message, target } = await req.json();
    // target: 'all' | 'sellers' | 'admins'

    if (!subject || !message) {
        return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 });
    }

    const where: any = { isActive: true };
    if (target === 'sellers') where.role = 'SELLER';
    else if (target === 'admins') where.role = 'ADMIN';
    else if (target === 'high-earners') {
        where.role = 'SELLER';
        where.totalEarnings = { gte: 1000 };
    } else if (target === 'new-users') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        where.createdAt = { gte: sevenDaysAgo };
    } else if (target === 'inactive-sellers') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        where.role = 'SELLER';
        where.products = {
            none: {
                createdAt: { gte: thirtyDaysAgo }
            }
        };
    }

    const users = await prisma.user.findMany({
        where,
        select: { email: true, name: true },
        take: 100,
    });

    if (users.length === 0) {
        return NextResponse.json({ error: 'لا يوجد مستخدمون' }, { status: 404 });
    }

    // Send in batches of 10 to avoid rate limits
    const batchSize = 10;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(u =>
                resend.emails.send({
                    from: FROM,
                    to: u.email,
                    subject,
                    html: `
                        <div dir="rtl" style="font-family:Arial;padding:24px;max-width:600px;margin:0 auto">
                            <div style="background:#0052FF;padding:20px;border-radius:12px 12px 0 0;text-align:center">
                                <h1 style="color:white;margin:0;font-size:22px">تمالين</h1>
                            </div>
                            <div style="background:#f8fafc;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
                                <p style="color:#374151;font-size:16px">مرحباً ${u.name}،</p>
                                <div style="background:white;padding:20px;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#374151;line-height:1.7;white-space:pre-wrap">${message}</div>
                                <p style="color:#9ca3af;font-size:13px;margin-top:20px">فريق تمالين</p>
                            </div>
                        </div>
                    `,
                }).then(() => sent++).catch(() => failed++)
            )
        );
        // Small delay between batches
        if (i + batchSize < users.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Also send Novu in-app notification if available
    try {
        const userIds = await prisma.user.findMany({
            where,
            select: { id: true },
            take: 100,
        });
        await sendBulkNotification('admin-broadcast', userIds.map(u => u.id), {
            subject,
            message: message.slice(0, 200),
        });
    } catch { }

    // Alert admin via Telegram
    await sendTelegramMessage(
        `📢 <b>بث جماعي أُرسل!</b>\n━━━━━━━━━━━━━━\n📋 <b>العنوان:</b> ${subject}\n👥 <b>المستلمون:</b> ${users.length} (${target})\n✅ <b>نجح:</b> ${sent} | ❌ <b>فشل:</b> ${failed}`
    );

    // Activity log
    const admin = session!.user as any;
    await logActivity({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        action: LOG_ACTIONS.BROADCAST_SENT,
        details: { subject, target, total: users.length, sent, failed },
    });

    return NextResponse.json({
        success: true,
        total: users.length,
        sent,
        failed,
        message: `تم الإرسال لـ ${sent} مستخدم${failed > 0 ? ` (${failed} فشل)` : ''}`,
    });
}
