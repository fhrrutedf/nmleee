import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendTelegramMessage, dailyReportMessage } from '@/lib/telegram';

export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalOrders, totalRevenueData, newUsers, pendingPayouts] = await Promise.all([
            prisma.order.count({ where: { isPaid: true, createdAt: { gte: today } } }),
            prisma.order.aggregate({ _sum: { totalAmount: true }, where: { isPaid: true, createdAt: { gte: today } } }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.payout.count({ where: { status: 'PENDING' } }),
        ]);

        const message = dailyReportMessage({
            totalOrders,
            totalRevenue: totalRevenueData._sum.totalAmount || 0,
            newUsers,
            pendingPayouts,
        });

        await sendTelegramMessage(message);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Daily report cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
