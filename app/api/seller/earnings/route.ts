import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { releaseMaturedBalances, getPlatformSettings, ensurePlanCurrent, getEscrowDaysForPlan } from '@/lib/commission';

/**
 * GET /api/seller/earnings
 * Called when seller opens dashboard.
 * 1. Auto-releases matured escrow balances (Event-Driven, no Cron)
 * 2. Returns full financial summary
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 🔑 KEY: Auto-release matured balances on every dashboard open
    await releaseMaturedBalances(user.id);

    // Ensure plan is current (auto-downgrade expired subscriptions)
    const currentPlan = await ensurePlanCurrent(user.id);

    const settings = await getPlatformSettings();
    const escrowDays = getEscrowDaysForPlan(currentPlan, settings);

    // Fetch order history for earnings
    const orders = await prisma.order.findMany({
        where: { sellerId: user.id, isPaid: true },
        select: {
            orderNumber: true,
            totalAmount: true,
            sellerAmount: true,
            platformFee: true,
            payoutStatus: true,
            paidAt: true,
            items: {
                select: {
                    product: { select: { title: true } },
                    course: { select: { title: true } }
                }
            }
        },
        orderBy: { paidAt: 'desc' },
        take: 100,
    });

    const formattedEarnings = orders.map(o => {
        let title = 'منتج';
        if (o.items && o.items.length > 0) {
            title = o.items[0].product?.title || o.items[0].course?.title || 'منتج';
        }

        const availableDate = o.paidAt ? new Date(o.paidAt.getTime() + (escrowDays * 24 * 60 * 60 * 1000)) : new Date();

        return {
            orderNumber: o.orderNumber,
            total: o.totalAmount,
            platformFee: o.platformFee,
            yourEarning: o.sellerAmount,
            status: o.payoutStatus,
            availableAt: availableDate.toISOString(),
            paidOutAt: null,
            date: o.paidAt ? o.paidAt.toISOString() : new Date().toISOString(),
            item: title,
        };
    });

    return NextResponse.json(formattedEarnings);
}

