import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const [ordersCount, totalRevenue, newUsers] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: yesterday }, status: 'COMPLETED' } }),
            prisma.order.aggregate({
                where: { createdAt: { gte: yesterday }, status: 'COMPLETED' },
                _sum: { totalAmount: true }
            }),
            prisma.user.count({ where: { createdAt: { gte: yesterday } } })
        ]);

        console.log('[CRON] Daily report generated successfully:', {
            orders: ordersCount,
            revenue: totalRevenue._sum.totalAmount || 0,
            users: newUsers
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CRON] Daily report failed:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
