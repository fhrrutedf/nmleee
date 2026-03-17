import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';

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
                planType: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Ensure plan is current (auto-downgrade if expired)
        const currentPlan = await ensurePlanCurrent(user.id);
        const settings = await getPlatformSettings();

        // Validate payout method is set
        if (!user.payoutMethod) {
            return NextResponse.json(
                { error: 'يجب تعيين طريقة الدفع أولاً' },
                { status: 400 }
            );
        }

        // Validate amount against min payout
        if (amount < settings.minPayoutAmount) {
            return NextResponse.json(
                { error: `الحد الأدنى للسحب هو $${settings.minPayoutAmount}` },
                { status: 400 }
            );
        }

        if (amount > user.availableBalance) {
            return NextResponse.json(
                { error: 'الرصيد المتاح غير كافٍ' },
                { status: 400 }
            );
        }

        // ─── Strict Payout Lock based on plan ───
        // Check if user has any recent orders that haven't passed the plan's escrow period
        const escrowDays = currentPlan === 'PRO' ? settings.proEscrowDays
            : currentPlan === 'GROWTH' ? settings.growthEscrowDays
            : settings.freeEscrowDays;

        const escrowCutoff = new Date();
        escrowCutoff.setDate(escrowCutoff.getDate() - escrowDays);

        const lockedOrders = await prisma.order.count({
            where: {
                sellerId: user.id,
                isPaid: true,
                payoutStatus: 'pending',
                paidAt: { gte: escrowCutoff },
            },
        });

        // Note: This just shows a warning — the actual lock is enforced by the availableBalance 
        // (funds only move to available after escrow period passes via releaseMaturedBalances)

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
                sellerId: user.id,
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
            plan: currentPlan,
            escrowDays,
        });
    } catch (error) {
        console.error('Error requesting payout:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
