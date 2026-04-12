import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Get statistics
        const [
            totalOrders,
            paidOrders,
            pendingOrders,
            revenueAggregation,
            feesAggregation,
            pendingPayouts,
            pendingManualOrders,
            totalUsers,
            totalSellers,
            totalProducts,
            totalCourses,
            pendingVerifications,
            planDistributionRaw,
            liabilityStatsRaw,
            gatewayBreakdownRaw
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PAID' } }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { totalAmount: true },
            }),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { platformFee: true },
            }),
            prisma.payout.count({ where: { status: 'PENDING' } }),
            prisma.order.count({
                where: {
                    paymentMethod: 'manual',
                    status: 'PENDING',
                    verifiedAt: null,
                },
            }),
            prisma.user.count(),
            prisma.user.count({ where: { role: 'SELLER' } }),
            prisma.product.count(),
            prisma.course.count(),
            prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
            prisma.user.groupBy({
                by: ['planType' as any],
                where: { role: 'SELLER' },
                _count: { _all: true },
            }),
            prisma.user.aggregate({
                _sum: {
                    pendingBalance: true,
                    availableBalance: true,
                    referralEarnings: true,
                },
            }),
            prisma.order.groupBy({
                by: ['paymentMethod' as any],
                where: { status: 'PAID' },
                _sum: { totalAmount: true },
            }),
        ]);

        // Calculate 7-day trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyRevenueRaw = await prisma.order.groupBy({
            by: ['paidAt' as any],
            where: {
                status: 'PAID',
                paidAt: { gte: sevenDaysAgo },
            },
            _sum: { totalAmount: true },
        });

        const revenueTrend: Record<string, number> = {};
        for(let i=0; i<7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            revenueTrend[d.toISOString().split('T')[0]] = 0;
        }
        dailyRevenueRaw.forEach(item => {
            const dateStr = new Date(item.paidAt as any).toISOString().split('T')[0];
            if (revenueTrend[dateStr] !== undefined) {
                revenueTrend[dateStr] += item._sum.totalAmount || 0;
            }
        });

        const trendArray = Object.entries(revenueTrend).map(([date, amount]) => ({ date, amount })).reverse();

        const plansArr = (planDistributionRaw as any[]) || [];
        const planDistribution = {
            FREE: plansArr.find(p => p.planType === 'FREE')?._count._all || 0,
            GROWTH: plansArr.find(p => p.planType === 'GROWTH')?._count._all || 0,
            PRO: plansArr.find(p => p.planType === 'PRO')?._count._all || 0,
            AGENCY: plansArr.find(p => p.planType === 'AGENCY')?._count._all || 0,
        };

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                seller: { select: { name: true, email: true } },
                items: {
                    include: {
                        product: { select: { title: true } },
                        course: { select: { title: true } },
                        bundle: { select: { title: true } },
                    },
                },
            },
        });

        // Top sellers
        const topSellers = await prisma.user.findMany({
            where: { role: 'SELLER' },
            orderBy: { totalEarnings: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                totalEarnings: true,
                pendingBalance: true,
                availableBalance: true,
                _count: { select: { sellerOrders: true } },
            },
        });

        return NextResponse.json({
            stats: {
                totalOrders,
                paidOrders,
                pendingOrders,
                totalRevenue: revenueAggregation._sum.totalAmount || 0,
                platformFees: feesAggregation._sum.platformFee || 0,
                pendingPayouts,
                pendingManualOrders,
                totalUsers,
                totalSellers,
                totalProducts,
                totalCourses,
                pendingVerifications,
                planDistribution,
                platformLiability: (liabilityStatsRaw._sum.pendingBalance || 0) + (liabilityStatsRaw._sum.availableBalance || 0),
                referralLiability: liabilityStatsRaw._sum.referralEarnings || 0,
                gatewayBreakdown: (gatewayBreakdownRaw as any[]).map(g => ({
                    method: g.paymentMethod || 'Other',
                    amount: g._sum.totalAmount || 0
                })),
                revenueTrend: trendArray
            },
            recentOrders,
            topSellers,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
