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

        const payouts = await prisma.payout.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(payouts);
    } catch (error) {
        console.error('Error fetching payouts:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب السحوبات' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { amount } = body;

        if (amount < 100) {
            return NextResponse.json(
                { error: 'الحد الأدنى للسحب هو 100 ج.م' },
                { status: 400 }
            );
        }

        // Get user payment details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                payoutMethod: true,
                bankDetails: true,
                paypalEmail: true,
                cryptoWallet: true,
            },
        });

        if (!user || !user.payoutMethod) {
            return NextResponse.json(
                { error: 'يجب تعيين طريقة الدفع أولاً في الإعدادات' },
                { status: 400 }
            );
        }

        // التحقق من الرصيد المتاح
        const stats = await calculatePayoutStats(userId);

        if (amount > stats.availableBalance) {
            return NextResponse.json(
                { error: 'الرصيد غير كافٍ' },
                { status: 400 }
            );
        }

        // Prepare method details
        let methodDetails = {};
        if (user.payoutMethod === 'bank') {
            methodDetails = user.bankDetails || {};
        } else if (user.payoutMethod === 'paypal') {
            methodDetails = { email: user.paypalEmail };
        } else if (user.payoutMethod === 'crypto') {
            methodDetails = { wallet: user.cryptoWallet };
        }

        const payout = await prisma.payout.create({
            data: {
                payoutNumber: `PAYOUT-${Date.now()}`,
                userId,
                amount,
                method: user.payoutMethod,
                methodDetails,
                status: 'PENDING',
            },
        });

        return NextResponse.json(payout, { status: 201 });
    } catch (error) {
        console.error('Error creating payout:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء طلب السحب' },
            { status: 500 }
        );
    }
}

async function calculatePayoutStats(userId: string) {
    // حساب إجمالي الأرباح من الطلبات المكتملة
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

    return {
        totalEarnings,
        availableBalance: totalEarnings - withdrawnAmount - pendingAmount,
        pendingPayouts: pendingAmount,
    };
}
