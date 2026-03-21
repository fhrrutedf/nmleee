import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

// This function processes PENDING broadcasts in the background
// Security: Check for CRON_SECRET to prevent unauthorized execution
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // Find one pending broadcast job that is due
        const broadcast = await (prisma as any).broadcast.findFirst({
            where: {
                status: 'PENDING',
                scheduledAt: { lte: new Date() }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        if (!broadcast) {
            return NextResponse.json({ message: 'No pending broadcasts' });
        }

        // We use a separate internal call or just execute here for one job
        // To avoid timeout, we only process ONE job per cron run,
        // but if we have many, we can process more if time permits.
        
        await processOneBroadcast(broadcast);

        return NextResponse.json({ 
            success: true, 
            message: `Processed broadcast: ${broadcast.subject}` 
        });

    } catch (error) {
        console.error('Cron Broadcast Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function processOneBroadcast(broadcast: any) {
    const broadcastId = broadcast.id;

    // Update status to SENDING
    await (prisma as any).broadcast.update({
        where: { id: broadcastId },
        data: { status: 'SENDING', updatedAt: new Date() }
    });

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const platformSettings = await prisma.platformSettings.findFirst() || { platformName: 'تمالين' };
    const FROM = process.env.RESEND_FROM_EMAIL || 'no-reply@tmleen.com';

    // Criteria logic
    const criteria = broadcast.recipientCriteria || 'all';
    const where: any = { isActive: true };
    if (criteria === 'sellers') where.role = 'SELLER';
    else if (criteria === 'admins') where.role = 'ADMIN';
    else if (criteria === 'high-earners') {
        where.role = 'SELLER';
        where.totalEarnings = { gte: 1000 };
    } else if (criteria === 'new-users') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        where.createdAt = { gte: sevenDaysAgo };
    }

    let processed = 0;
    const batchSize = 100;
    let hasMore = true;
    let lastId: string | undefined = undefined;

    // We take a max duration of 50 seconds to avoid function timeout (Vercel max is usually 60s for Pro)
    const startTime = Date.now();
    const MAX_DURATION = 50000;

    while (hasMore) {
        if (Date.now() - startTime > MAX_DURATION) {
            // If we are reaching timeout, stop and leave as SENDING for next cron
            break;
        }

        const users: any[] = await prisma.user.findMany({
            where,
            take: batchSize,
            ...(lastId ? { skip: 1, cursor: { id: lastId } } : {}),
            select: { id: true, email: true, name: true }
        });

        if (users.length === 0) {
            hasMore = false;
            break;
        }

        // Send emails in parallel batches of 10 for speed
        const chunks = Array.from({ length: Math.ceil(users.length / 10) }, (_, i) =>
            users.slice(i * 10, i * 10 + 10)
        );

        for (const chunk of chunks) {
            await Promise.all(chunk.map(user => 
                resend.emails.send({
                    from: FROM,
                    to: user.email,
                    subject: broadcast.subject,
                    html: `
                        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                            <div style="background: #0ea5e9; padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 28px;">${platformSettings.platformName}</h1>
                            </div>
                            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0; border-top: none;">
                                <p style="font-size: 18px;">مرحباً <strong>${user.name}</strong>،</p>
                                <div style="line-height: 1.8; font-size: 16px; margin: 25px 0; color: #475569; white-space: pre-wrap;">${broadcast.content}</div>
                                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                                <p style="text-align: center; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${platformSettings.platformName} - جميع الحقوق محفوظة</p>
                            </div>
                        </div>
                    `
                }).catch(e => console.error(`Failed to send broadcast to ${user.email}`, e))
            ));
            processed += chunk.length;
            
            // Update progress in DB every 10 emails
            await (prisma as any).broadcast.update({
                where: { id: broadcastId },
                data: { sentCount: processed }
            });
        }

        lastId = users[users.length - 1].id;
        if (users.length < batchSize) hasMore = false;
    }

    // Final update
    const status = hasMore ? 'SENDING' : 'COMPLETED';
    await (prisma as any).broadcast.update({
        where: { id: broadcastId },
        data: { 
            status, 
            sentCount: processed,
            updatedAt: new Date() 
        }
    });
}
