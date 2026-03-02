import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = parseInt(searchParams.get('period') ?? '30');
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const prevSince = new Date(Date.now() - period * 2 * 24 * 60 * 60 * 1000);

    const [
        totalUsers, newUsers, prevNewUsers,
        totalSellers, activeSellers,
        allOrders, periodOrders, prevPeriodOrders,
        pendingManual, totalRevenue, periodRevenue,
        platformFees, topSellers, recentOrders,
        usersByCountry, ordersByMethod, recentUsers,
    ] = await Promise.all([
        // Users
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: since } } }),
        prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
        prisma.user.count({ where: { role: 'SELLER' } }),
        prisma.user.count({ where: { role: 'SELLER', isActive: true } }),

        // Orders
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: since } } }),
        prisma.order.count({ where: { createdAt: { gte: prevSince, lt: since } } }),

        // Pending manual payments
        prisma.order.count({ where: { paymentMethod: 'manual', status: 'PENDING' } }),

        // Revenue
        prisma.order.aggregate({ where: { isPaid: true }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { isPaid: true, paidAt: { gte: since } }, _sum: { totalAmount: true } }),
        prisma.order.aggregate({ where: { isPaid: true }, _sum: { platformFee: true } }),

        // Top sellers by revenue
        prisma.order.groupBy({
            by: ['sellerId'],
            where: { isPaid: true },
            _sum: { sellerAmount: true, totalAmount: true },
            _count: { _all: true },
            orderBy: { _sum: { totalAmount: 'desc' } },
            take: 10,
        }),

        // Recent orders
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 15,
            include: {
                seller: { select: { name: true, email: true } },
                items: { take: 1, include: { product: { select: { title: true } }, course: { select: { title: true } } } },
            },
        }),

        // Users by country
        prisma.user.groupBy({
            by: ['country'],
            _count: { _all: true },
            orderBy: { _count: { country: 'desc' } },
            take: 10,
        }),

        // Orders by payment method
        prisma.order.groupBy({
            by: ['paymentMethod'],
            _count: { _all: true },
            _sum: { totalAmount: true },
        }),

        // Recent users
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true, name: true, email: true, role: true,
                country: true, createdAt: true, isActive: true,
                _count: { select: { sellerOrders: true } },
            },
        }),
    ]);

    // Resolve seller names for top sellers
    const sellerIds = topSellers.map(s => s.sellerId).filter(Boolean) as string[];
    const sellerDetails = await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, name: true, email: true, avatar: true },
    });
    const sellerMap = Object.fromEntries(sellerDetails.map(s => [s.id, s]));

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await prisma.$queryRaw<any[]>`
        SELECT 
            TO_CHAR(DATE_TRUNC('month', "paidAt"), 'YYYY-MM') as month,
            SUM("totalAmount") as revenue,
            SUM("platformFee") as fees,
            COUNT(*) as orders
        FROM "Order"
        WHERE "isPaid" = true AND "paidAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "paidAt")
        ORDER BY DATE_TRUNC('month', "paidAt") ASC
    `;

    const growthCalc = (curr: number, prev: number) =>
        prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);

    return NextResponse.json({
        overview: {
            totalUsers,
            newUsers,
            usersGrowth: growthCalc(newUsers, prevNewUsers),
            totalSellers,
            activeSellers,
            totalOrders: allOrders,
            periodOrders,
            ordersGrowth: growthCalc(periodOrders, prevPeriodOrders),
            pendingManual,
            totalRevenue: totalRevenue._sum.totalAmount ?? 0,
            periodRevenue: periodRevenue._sum.totalAmount ?? 0,
            platformFees: platformFees._sum.platformFee ?? 0,
        },
        topSellers: topSellers.map(s => ({
            ...sellerMap[s.sellerId ?? ''],
            totalRevenue: s._sum.totalAmount ?? 0,
            netEarnings: s._sum.sellerAmount ?? 0,
            ordersCount: s._count._all,
        })).filter(s => s.id),
        recentOrders: recentOrders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            amount: o.totalAmount,
            platformFee: o.platformFee,
            sellerAmount: o.sellerAmount,
            status: o.status,
            paymentMethod: o.paymentMethod,
            isPaid: o.isPaid,
            createdAt: o.createdAt,
            seller: o.seller,
            productTitle: o.items[0]?.product?.title ?? o.items[0]?.course?.title ?? 'غير محدد',
        })),
        usersByCountry: usersByCountry.filter(u => u.country).map(u => ({
            country: u.country,
            count: u._count._all,
        })),
        ordersByMethod: ordersByMethod.map(m => ({
            method: m.paymentMethod ?? 'غير محدد',
            count: m._count._all,
            total: m._sum.totalAmount ?? 0,
        })),
        monthlyRevenue,
        recentUsers,
    });
}
