import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTelegramMessage, dailyReportMessage } from '@/lib/telegram';

// CRON: يعمل يومياً - يرسل تقرير يومي لصاحب المنصة
export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalOrders, totalRevenueData, newUsers, pendingPayouts] = await Promise.all([
            db.order.count({ where: { isPaid: true, createdAt: { gte: today } } }),
            db.order.aggregate({
                _sum: { totalAmount: true },
                where: { isPaid: true, createdAt: { gte: today } },
            }),
            db.user.count({ where: { createdAt: { gte: today } } }),
            db.payout.count({ where: { status: 'PENDING' } }),
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
