import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Date ranges for growth comparison
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [
            totalProducts,
            totalOrders,
            totalRevenue,
            upcomingAppointments,
            currentMonthRevenue,
            lastMonthRevenue,
            currentMonthOrders,
            lastMonthOrders,
        ] = await Promise.all([
            // Total active products
            prisma.product.count({
                where: { userId, isActive: true },
            }),

            // Total paid orders
            prisma.order.count({
                where: { userId, isPaid: true },
            }),

            // Total revenue (all time)
            prisma.order.aggregate({
                where: { userId, isPaid: true },
                _sum: { totalAmount: true },
            }),

            // Upcoming appointments
            prisma.appointment.count({
                where: {
                    userId,
                    date: { gte: new Date() },
                    status: { in: ['PENDING', 'CONFIRMED'] },
                },
            }),

            // Current month revenue
            prisma.order.aggregate({
                where: { userId, isPaid: true, createdAt: { gte: startOfCurrentMonth } },
                _sum: { totalAmount: true },
            }),

            // Last month revenue
            prisma.order.aggregate({
                where: {
                    userId, isPaid: true,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { totalAmount: true },
            }),

            // Current month orders count
            prisma.order.count({
                where: { userId, isPaid: true, createdAt: { gte: startOfCurrentMonth } },
            }),

            // Last month orders count
            prisma.order.count({
                where: {
                    userId, isPaid: true,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
        ]);

        // Calculate growth percentages
        const calcGrowth = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const currRev = currentMonthRevenue._sum.totalAmount || 0;
        const lastRev = lastMonthRevenue._sum.totalAmount || 0;
        const revenueGrowth = calcGrowth(currRev, lastRev);
        const ordersGrowth = calcGrowth(currentMonthOrders, lastMonthOrders);

        return NextResponse.json({
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalAppointments: upcomingAppointments,
            revenueGrowth,
            ordersGrowth,
            currentMonthRevenue: currRev,
            currentMonthOrders,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
