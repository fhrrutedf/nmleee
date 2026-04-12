import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // استخدام الأرصدة الحقيقية المخزنة في DB (تأخذ Escrow بالحسبان)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                availableBalance: true,
                pendingBalance: true,
                totalEarnings: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // مجموع السحوبات المكتملة
        const completedPayouts = await prisma.payout.aggregate({
            where: {
                sellerId: userId,
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });

        // السحوبات قيد المراجعة
        const pendingPayoutsAgg = await prisma.payout.aggregate({
            where: {
                sellerId: userId,
                status: { in: ['PENDING', 'PROCESSING'] },
            },
            _sum: { amount: true },
        });

        const withdrawnAmount = completedPayouts._sum.amount || 0;
        const pendingPayoutAmount = pendingPayoutsAgg._sum.amount || 0;

        return NextResponse.json({
            // الرصيد الحقيقي المتاح للسحب (يأخذ Escrow بالحسبان)
            availableBalance: user.availableBalance,
            // رصيد قيد الـ Escrow
            pendingBalance: user.pendingBalance,
            // إجمالي الأرباح التاريخية
            totalEarnings: user.totalEarnings,
            // مجموع ما تم سحبه فعلياً
            withdrawnAmount,
            // مبالغ طلبات السحب قيد المراجعة
            pendingPayouts: pendingPayoutAmount,
        });
    } catch (error) {
        console.error('Error fetching payout stats:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
