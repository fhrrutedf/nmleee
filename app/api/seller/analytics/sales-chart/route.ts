import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get period from query params (default: 30 days)
        const url = new URL(req.url);
        const period = url.searchParams.get('period') || '30d';

        let days = 30;
        if (period === '7d') days = 7;
        else if (period === '90d') days = 90;
        else if (period === '1y') days = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get orders for the period
        const orders = await prisma.order.findMany({
            where: {
                userId,
                status: 'PAID',
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Group by date
        const salesByDate: Record<string, { revenue: number; orders: number }> = {};

        orders.forEach((order) => {
            const date = order.createdAt.toISOString().split('T')[0];

            if (!salesByDate[date]) {
                salesByDate[date] = { revenue: 0, orders: 0 };
            }

            salesByDate[date].revenue += order.totalAmount;
            salesByDate[date].orders += 1;
        });

        // Convert to array format for charts
        const chartData = Object.entries(salesByDate).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
        }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error('Error fetching sales chart:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
