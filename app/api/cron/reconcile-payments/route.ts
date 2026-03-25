import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSpaceremitPaymentStatus } from '@/lib/spaceremit';
import { fulfillPurchase } from '@/lib/checkout';
import { processPaymentCommission } from '@/lib/commission';

/**
 * 🤖 DIGITAL EMPLOYEE: PAYMENT RECONCILER (CRON JOB)
 * ─────────────────────────────────────────────────────────
 * Tasks:
 * 1. Find PENDING orders from the last 24h (Automated providers only).
 * 2. Query gateway APIs to verify if payment happened but webhook failed.
 * 3. Auto-fulfill confirmed orders to ensure best customer experience.
 * ─────────────────────────────────────────────────────────
 * Trigger: Vercel Cron or any external HTTP scheduler (e.g. EasyCron).
 */
export async function GET(req: NextRequest) {
    // 🛡️ SECURITY: Verify Authorization (from Cron service)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const start = Date.now();
    const stats = { found: 0, verified: 0, fulfilled: 0, errors: 0 };

    try {
        // 1. Fetch PENDING orders from automated gateways (last 24h)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: { gte: twentyFourHoursAgo },
                paymentProvider: { in: ['spaceremit', 'coinremitter'] },
                paymentId: { not: null }
            },
            take: 20 // Process in small batches to stay within lambda limits
        });

        stats.found = pendingOrders.length;

        for (const order of pendingOrders) {
            try {
                // A. Spaceremit Reconcilation
                if (order.paymentProvider === 'spaceremit' && order.paymentId) {
                    const statusData = await getSpaceremitPaymentStatus(order.paymentId);
                    
                    if (statusData.status === 'SUCCESS' || statusData.status === 'PAID') {
                        console.log(`[RECONCILER]: Recovered Spaceremit order ${order.orderNumber}`);
                        
                        await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                status: 'COMPLETED',
                                isPaid: true,
                                paidAt: new Date(statusData.paid_at || Date.now()),
                                transactionRef: statusData.transaction_ref || order.transactionRef
                            }
                        });

                        await processPaymentCommission(order.id);
                        await fulfillPurchase(order.id, order.userId);
                        stats.fulfilled++;
                    }
                }
                
                // B. Coinremitter / Crypto (Not implemented yet but reserved here)
                // ... logic for other gateways can be added here
                
                stats.verified++;
            } catch (err) {
                console.error(`[RECONCILER_ERROR]: Failed to verify order ${order.orderNumber}`, err);
                stats.errors++;
            }
        }

        return NextResponse.json({
            success: true,
            duration: `${Date.now() - start}ms`,
            stats
        });

    } catch (error) {
        console.error('[CRON_CRITICAL]: Payment reconciler failed:', error);
        return NextResponse.json({ error: 'Internal failure' }, { status: 500 });
    }
}
