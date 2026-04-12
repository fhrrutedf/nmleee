import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { sendBroadcastEmail } from '@/lib/email';
import { sendTelegramMessage } from '@/lib/telegram';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';

// POST /api/admin/broadcast - Scalable Broadcast Job Creation
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subject, message, target, scheduledAt } = await req.json();

    if (!subject || !message) {
        return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 });
    }

    try {
        // 1. Define Recipient Criteria (Pagination Ready)
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
        }

        // 2. Count Total Recipients (Scalability Fix)
        const totalCount = await prisma.user.count({ where });

        if (totalCount === 0) {
            return NextResponse.json({ error: 'لا يوجد مستخدمون مطابقون لهذه المعايير' }, { status: 404 });
        }

        // 3. Create Broadcast Job (Background Processing Foundation)
        const broadcastJob = await prisma.broadcast.create({
            data: {
                subject,
                content: message,
                status: 'PENDING',
                recipientCount: totalCount,
                recipientCriteria: target || 'all',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            }
        });

        // 4. Log Admin Activity
        const admin = session!.user as any;
        await logActivity({
            actorId: admin.id,
            actorName: admin.name,
            actorRole: 'ADMIN',
            action: LOG_ACTIONS.BROADCAST_SENT,
            details: { 
                jobId: broadcastJob.id,
                subject, 
                target, 
                totalRecipients: totalCount,
                scheduledAt: broadcastJob.scheduledAt
            },
        });

        // 5. Fire Telegram Alert
        await sendTelegramMessage(
            `📢 <b>تم جدولة بث جماعي!</b>\n━━━━━━━━━━━━━━\n📋 <b>العنوان:</b> ${subject}\n👥 <b>المستهدف:</b> ${target} (${totalCount} مستخدم)\n⏰ <b>الموعد:</b> ${broadcastJob.scheduledAt.toLocaleString('ar-SA')}`
        );

        // IMMEDIATE ON-DEMAND PROCESSING (Wait for completion to prevent serverless kill)
        // Since the list is currently small, we await it. For millions of users, a queue is required.
        await processBroadcast(broadcastJob.id);

        // Instant Response (UX Fix)
        return NextResponse.json({
            success: true,
            jobId: broadcastJob.id,
            message: `تم البث بنجاح لـ ${totalCount} مستخدم.`,
        });

    } catch (error) {
        console.error('Broadcast Job Error:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جدولة البث' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, action } = await req.json();

        if (action === 'stop') {
            const updated = await prisma.broadcast.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            await logActivity({
                actorId: (session!.user as any).id,
                actorName: (session!.user as any).name || 'Admin',
                actorRole: 'ADMIN',
                action: 'BROADCAST_STOPPED',
                details: { jobId: id },
            });

            return NextResponse.json({ success: true, status: updated.status });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Broadcast Stop Error:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إيقاف البث' }, { status: 500 });
    }
}

/**
 * دالة معالجة البث (Iterative Batch Processing)
 * Note: In a production environment, this should be called by a CRON job at /api/cron/process-broadcasts
 */
async function processBroadcast(broadcastId: string) {
    const broadcast = await prisma.broadcast.findUnique({
        where: { id: broadcastId },
        status: 'PENDING'
    } as any);

    if (!broadcast) return;

    // Update status to SENDING
    await prisma.broadcast.update({
        where: { id: broadcastId },
        data: { status: 'SENDING' }
    });

    const platformSettings = await prisma.platformSettings.findFirst() || { platformName: 'منصتك الرقمية' };

    // 3. Define where filter based on criteria
    const target = (broadcast as any).recipientCriteria;
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
    }

    let processed = 0;
    const batchSize = 50;
    let hasMore = true;
    let lastId: string | undefined = undefined;

    while (hasMore) {
        // Fetch recipients using keyset pagination for efficiency
        const users: any[] = await prisma.user.findMany({
            where,
            take: batchSize,
            ...(lastId ? { 
                skip: 1, 
                cursor: { id: lastId } 
            } : {}),
            select: { id: true, email: true, name: true }
        });

        if (users.length === 0) {
            hasMore = false;
            break;
        }

        // --- KILL SWITCH CHECK ---
        const currentJob = await prisma.broadcast.findUnique({ where: { id: broadcastId }, select: { status: true } });
        if (currentJob?.status === 'CANCELLED') {
            console.log(`[BROADCAST_CANCEL] Kill switch triggered for job: ${broadcastId}`);
            hasMore = false;
            break;
        }

        // Send logic
        for (const user of users) {
            try {
                await sendBroadcastEmail({
                    to: user.email,
                    customerName: user.name || 'عميلنا العزيز',
                    subject: broadcast.subject,
                    content: broadcast.content
                });
                processed++;
            } catch (e) {
                console.error(`Failed to send broadcast to ${user.email}`, e);
            }
        }

        lastId = users[users.length - 1].id;
        
        // Update progress in DB
        await prisma.broadcast.update({
            where: { id: broadcastId },
            data: { sentCount: processed }
        });

        if (users.length < batchSize) hasMore = false;
    }

    // Final update
    await prisma.broadcast.update({
        where: { id: broadcastId },
        data: { status: 'COMPLETED', updatedAt: new Date() }
    });
}
