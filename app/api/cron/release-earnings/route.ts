import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    // Security check
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();

        // 1. Find all paid orders that are ready to be released from escrow
        const pendingOrders = await prisma.order.findMany({
            where: {
                isPaid: true,
                payoutStatus: 'pending',
                availableAt: { lte: now },
                sellerId: { not: null }
            },
            include: {
                seller: true
            }
        });

        if (pendingOrders.length === 0) {
            return NextResponse.json({ message: 'No pending earnings to release at this time.' });
        }

        let releasedCount = 0;
        let totalReleased = 0;

        // 2. Process each order (Moving from Pending to Available)
        // Note: Using a transaction for each to avoid partial failures
        for (const order of pendingOrders) {
            if (!order.sellerId || !order.seller) continue;

            const amount = order.sellerAmount || 0;

            try {
                await prisma.$transaction([
                    // Deduct from pending, Add to available
                    prisma.user.update({
                        where: { id: order.sellerId },
                        data: {
                            pendingBalance: { decrement: amount },
                            availableBalance: { increment: amount }
                        }
                    }),
                    // Mark order as available for payout
                    prisma.order.update({
                        where: { id: order.id },
                        data: { payoutStatus: 'available' }
                    }),
                    // Notify the seller
                    prisma.notification.create({
                        data: {
                            userId: order.sellerId,
                            receiverId: order.sellerId,
                            type: 'INTERNAL',
                            title: '💰 تم تحرير أرباح جديدة!',
                            content: `أرباح الطلب رقم ${order.orderNumber} بقيمة $${amount.toFixed(2)} أصبحت الآن متاحة للسحب في محفظتك.`
                        }
                    })
                ]);
                releasedCount++;
                totalReleased += amount;
            } catch (err) {
                console.error(`Failed to release earnings for order ${order.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            releasedOrders: releasedCount,
            totalEarningsReleased: totalReleased,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Critical failure in release-earnings cron:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
