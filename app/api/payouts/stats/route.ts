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

        // حساب إجمالي الأرباح
        const completedOrders = await prisma.order.aggregate({
            where: {
                items: {
                    some: {
                        product: {
                            userId,
                        },
                    },
                },
                status: 'COMPLETED',
            },
            _sum: {
                totalAmount: true,
            },
        });

        const totalEarnings = completedOrders._sum.totalAmount || 0;

        // حساب المسحوبات المكتملة
        const completedPayouts = await prisma.payout.aggregate({
            where: {
                userId,
                status: 'COMPLETED',
            },
            _sum: {
                amount: true,
            },
        });

        const withdrawnAmount = completedPayouts._sum.amount || 0;

        // حساب الطلبات قيد المراجعة
        const pendingPayouts = await prisma.payout.aggregate({
            where: {
                userId,
                status: 'PENDING',
            },
            _sum: {
                amount: true,
            },
        });

        const pendingAmount = pendingPayouts._sum.amount || 0;

        return NextResponse.json({
            totalEarnings,
            availableBalance: totalEarnings - withdrawnAmount - pendingAmount,
            pendingPayouts: pendingAmount,
        });
    } catch (error) {
        console.error('Error fetching payout stats:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
