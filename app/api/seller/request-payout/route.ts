import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { escrowConfig } from '@/config/escrow';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { amount } = body;

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                availableBalance: true,
                payoutMethod: true,
                bankDetails: true,
                paypalEmail: true,
                cryptoWallet: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Validate payout method is set
        if (!user.payoutMethod) {
            return NextResponse.json(
                { error: 'يجب تعيين طريقة الدفع أولاً' },
                { status: 400 }
            );
        }

        // Validate amount
        if (amount < escrowConfig.minPayoutAmount) {
            return NextResponse.json(
                { error: `الحد الأدنى للسحب هو $${escrowConfig.minPayoutAmount}` },
                { status: 400 }
            );
        }

        if (amount > user.availableBalance) {
            return NextResponse.json(
                { error: 'الرصيد المتاح غير كافٍ' },
                { status: 400 }
            );
        }

        // Get method details
        let methodDetails = {};
        if (user.payoutMethod === 'bank') {
            methodDetails = user.bankDetails || {};
        } else if (user.payoutMethod === 'paypal') {
            methodDetails = { email: user.paypalEmail };
        } else if (user.payoutMethod === 'crypto') {
            methodDetails = { wallet: user.cryptoWallet };
        }

        // Create payout request
        const payout = await prisma.payout.create({
            data: {
                payoutNumber: `PAYOUT-${Date.now()}`,
                userId: user.id,
                amount,
                method: user.payoutMethod,
                methodDetails,
                status: 'PENDING',
            },
        });

        // Deduct from available balance
        await prisma.user.update({
            where: { id: user.id },
            data: {
                availableBalance: { decrement: amount },
            },
        });

        return NextResponse.json({
            success: true,
            payoutNumber: payout.payoutNumber,
            message: 'تم إرسال طلب السحب بنجاح',
        });
    } catch (error) {
        console.error('Error requesting payout:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
