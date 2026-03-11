import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { releaseMaturedBalances, getPlatformSettings, ensurePlanCurrent } from '@/lib/commission';

/**
 * GET /api/seller/financial-overview
 * Returns comprehensive financial dashboard data for the current seller
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Auto-release matured balances & ensure plan is current
    await releaseMaturedBalances(user.id);
    const currentPlan = await ensurePlanCurrent(user.id);

    const settings = await getPlatformSettings();

    // Re-fetch user after balance release
    const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    // ─── Monthly Revenue (last 6 months) ─────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
        where: {
            sellerId: user.id,
            isPaid: true,
            paidAt: { gte: sixMonthsAgo },
        },
        select: {
            totalAmount: true,
            sellerAmount: true,
            platformFee: true,
            referralCommission: true,
            paidAt: true,
            orderNumber: true,
            customerName: true,
            items: {
                select: {
                    itemType: true,
                    price: true,
                    product: { select: { title: true } },
                    course: { select: { title: true } },
                    bundle: { select: { title: true } },
                },
            },
        },
        orderBy: { paidAt: 'desc' },
    });

    // Group by month
    const monthlyData: Record<string, { revenue: number; orders: number; fees: number }> = {};
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { revenue: 0, orders: 0, fees: 0 };
    }

    // Revenue by type
    let productRevenue = 0;
    let courseRevenue = 0;
    let bundleRevenue = 0;

    orders.forEach(order => {
        if (!order.paidAt) return;
        const key = `${order.paidAt.getFullYear()}-${String(order.paidAt.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
            monthlyData[key].revenue += order.sellerAmount;
            monthlyData[key].orders += 1;
            monthlyData[key].fees += order.platformFee;
        }

        // Revenue by type
        order.items.forEach(item => {
            if (item.itemType === 'product') productRevenue += item.price;
            else if (item.itemType === 'course') courseRevenue += item.price;
            else bundleRevenue += item.price;
        });
    });

    // Format monthly chart data
    const monthlyChart = {
        labels: Object.keys(monthlyData).map(k => {
            const [, m] = k.split('-');
            return monthNames[parseInt(m) - 1];
        }),
        data: Object.values(monthlyData).map(v => Math.round(v.revenue * 100) / 100),
        orders: Object.values(monthlyData).map(v => v.orders),
        fees: Object.values(monthlyData).map(v => Math.round(v.fees * 100) / 100),
    };

    // This month vs last month growth
    const monthKeys = Object.keys(monthlyData);
    const thisMonthRevenue = monthlyData[monthKeys[monthKeys.length - 1]]?.revenue || 0;
    const lastMonthRevenue = monthlyData[monthKeys[monthKeys.length - 2]]?.revenue || 0;
    const revenueGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

    // Recent 10 transactions
    const recentTransactions = orders.slice(0, 10).map(o => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        totalAmount: o.totalAmount,
        sellerAmount: o.sellerAmount,
        platformFee: o.platformFee,
        date: o.paidAt?.toISOString(),
        item: o.items[0]?.product?.title || o.items[0]?.course?.title || o.items[0]?.bundle?.title || 'منتج',
        itemType: o.items[0]?.itemType || 'product',
    }));

    // Payouts summary
    const payouts = await prisma.payout.findMany({
        where: { sellerId: user.id },
        select: { amount: true, status: true },
    });

    const totalWithdrawn = payouts
        .filter(p => p.status === 'COMPLETED' || p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayouts = payouts
        .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
        .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayoutsCount = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length;

    // Referrals count
    const referralsCount = await prisma.user.count({
        where: { referredById: user.id } as any,
    });

    // Commission rate for current plan
    let currentCommissionRate = settings.commissionRate;
    if (currentPlan === 'GROWTH') currentCommissionRate = settings.growthCommissionRate;
    if (currentPlan === 'PRO') currentCommissionRate = settings.proCommissionRate;

    return NextResponse.json({
        // Balance
        balance: {
            pending: updatedUser?.pendingBalance || 0,
            available: updatedUser?.availableBalance || 0,
            total: updatedUser?.totalEarnings || 0,
            referralEarnings: (updatedUser as any)?.referralEarnings || 0,
        },

        // Plan info
        plan: {
            type: currentPlan,
            expiresAt: (user as any).planExpiresAt ? new Date((user as any).planExpiresAt).toISOString() : null,
            commissionRate: currentCommissionRate,
        },

        // Charts
        monthlyChart,
        revenueByType: {
            labels: ['منتجات رقمية', 'دورات تدريبية', 'باقات'],
            data: [
                Math.round(productRevenue * 100) / 100,
                Math.round(courseRevenue * 100) / 100,
                Math.round(bundleRevenue * 100) / 100,
            ],
        },

        // Growth
        thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
        revenueGrowth,

        // Recent
        recentTransactions,

        // Payouts
        payoutsSummary: {
            totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
            pendingPayouts: Math.round(pendingPayouts * 100) / 100,
            pendingPayoutsCount,
        },

        // Referrals
        referrals: {
            count: referralsCount,
            earnings: (updatedUser as any)?.referralEarnings || 0,
            username: user.username,
        },
    });
}
