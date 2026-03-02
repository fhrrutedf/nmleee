import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { releaseMaturedBalances, getPlatformSettings } from '@/lib/commission';

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
        select: {
            id: true,
            pendingBalance: true,
            availableBalance: true,
            totalEarnings: true,
        },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 🔑 KEY: Auto-release matured balances on every dashboard open (no cron!)
    const releaseResult = await releaseMaturedBalances(user.id);

    // Fetch fresh data after release
    const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            pendingBalance: true,
            availableBalance: true,
            totalEarnings: true,
        },
    });

    const settings = await getPlatformSettings();

    // Analytics: sales this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthOrders, allOrders, pendingOrders, topProducts] = await Promise.all([
        // This month's paid orders
        prisma.order.findMany({
            where: {
                sellerId: user.id,
                isPaid: true,
                paidAt: { gte: startOfMonth },
            },
            select: { totalAmount: true, sellerAmount: true, platformFee: true, paidAt: true },
        }),

        // All-time paid orders
        prisma.order.findMany({
            where: { sellerId: user.id, isPaid: true },
            select: { totalAmount: true, sellerAmount: true, paidAt: true, payoutStatus: true },
            orderBy: { paidAt: 'desc' },
            take: 12, // Last 12 orders for chart
        }),

        // Pending orders (in escrow)
        prisma.order.count({
            where: { sellerId: user.id, payoutStatus: 'pending', isPaid: true },
        }),

        // Top performing products
        prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: { sellerId: user.id, isPaid: true } },
            _count: { _all: true },
            _sum: { price: true },
            orderBy: { _sum: { price: 'desc' } },
            take: 5,
        }),
    ]);

    const grossThisMonth = monthOrders.reduce((s, o) => s + o.totalAmount, 0);
    const netThisMonth = monthOrders.reduce((s, o) => s + o.sellerAmount, 0);

    return NextResponse.json({
        // Balances (after auto-release)
        balances: {
            pending: updatedUser?.pendingBalance ?? 0,
            available: updatedUser?.availableBalance ?? 0,
            total: updatedUser?.totalEarnings ?? 0,
        },

        // This month stats
        month: {
            gross: parseFloat(grossThisMonth.toFixed(2)),
            net: parseFloat(netThisMonth.toFixed(2)),
            orders: monthOrders.length,
        },

        // Escrow info
        escrow: {
            pendingOrdersCount: pendingOrders,
            escrowDays: settings.escrowDays,
            released: releaseResult.released,
            releasedAmount: releaseResult.totalAmount,
        },

        // Chart data (last 12 orders grouped by month)
        chartData: buildMonthlyChart(allOrders),

        // Platform settings relevant to seller
        settings: {
            commissionRate: settings.commissionRate,
            minPayoutAmount: settings.minPayoutAmount,
            currencyRates: {
                SYP: settings.usdToSyp,
                IQD: settings.usdToIqd,
                EGP: settings.usdToEgp,
                AED: settings.usdToAed,
            },
        },
    });
}

function buildMonthlyChart(orders: { totalAmount: number; sellerAmount: number; paidAt: Date | null }[]) {
    const months: Record<string, { gross: number; net: number; count: number }> = {};

    for (const order of orders) {
        if (!order.paidAt) continue;
        const key = `${order.paidAt.getFullYear()}-${String(order.paidAt.getMonth() + 1).padStart(2, '0')}`;
        if (!months[key]) months[key] = { gross: 0, net: 0, count: 0 };
        months[key].gross += order.totalAmount;
        months[key].net += order.sellerAmount;
        months[key].count += 1;
    }

    return Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // Last 6 months
        .map(([month, data]) => ({
            month,
            gross: parseFloat(data.gross.toFixed(2)),
            net: parseFloat(data.net.toFixed(2)),
            orders: data.count,
        }));
}
