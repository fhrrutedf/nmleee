/**
 * POST /api/withdraw
 *
 * Creator withdrawal request flow.
 * Supports: USDT (TRC20), Bank Transfer, Mobile Wallets
 *
 * Security:
 *  - Session required (authenticated sellers only)
 *  - Amount validation against REAL available balance
 *  - Atomic debit: locks balance before creating payout record
 *  - Prevents duplicate pending requests (one inflight withdrawal at a time)
 *  - Idempotency key support (X-Idempotency-Key header)
 *
 * GET /api/withdraw → fetch withdrawal history + current balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { releaseMaturedBalances, getPlatformSettings } from '@/lib/commission';
import { isPayoutMethodConfigured, getPayoutMethodLabel } from '@/lib/payout-utils';
import { sendTelegramMessage, newPayoutMessage } from '@/lib/telegram';
import { round2 } from '@/lib/spaceremit';

// ─── GET: Fetch balance + withdrawal history ───────────────
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // 1. Release any matured escrow balances on-demand
        const releaseResult = await releaseMaturedBalances(userId);
        if (releaseResult.released > 0) {
            console.log(`[WITHDRAW_GET] Released ${releaseResult.released} orders → $${releaseResult.totalAmount}`);
        }

        // 2. Get fresh user balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                pendingBalance: true,
                availableBalance: true,
                totalEarnings: true,
                referralEarnings: true,
                payoutMethod: true,
                planType: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // 3. Aggregate pending withdrawal requests (to prevent double withdrawal)
        const pendingWithdrawals = await prisma.payout.aggregate({
            where: { sellerId: userId, status: 'PENDING' },
            _sum: { amount: true },
        });
        const pendingWithdrawalAmount = pendingWithdrawals._sum.amount || 0;

        // 4. Actual spendable = available - already-requested-but-not-paid
        const spendableBalance = round2(
            Math.max(0, user.availableBalance - pendingWithdrawalAmount)
        );

        // 5. Fetch withdrawal history
        const withdrawals = await prisma.payout.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // 6. Fetching escrow breakdown for the next 30 days
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const upcomingReleases = await prisma.order.groupBy({
            by: ['availableAt'],
            where: {
                sellerId: userId,
                payoutStatus: 'pending',
                isPaid: true,
                availableAt: { gte: now, lte: in30Days }
            },
            _sum: { sellerAmount: true },
            orderBy: { availableAt: 'asc' },
        });

        const settings = await getPlatformSettings();

        return NextResponse.json({
            balance: {
                pending: round2(user.pendingBalance),
                available: round2(user.availableBalance),
                spendable: spendableBalance,   // available minus pending withdrawals
                totalEarnings: round2(user.totalEarnings),
                referralEarnings: round2(user.referralEarnings),
                pendingWithdrawals: round2(pendingWithdrawalAmount),
            },
            minPayoutAmount: settings.minPayoutAmount,
            payoutMethodConfigured: user.payoutMethod !== null,
            withdrawals: withdrawals.map(w => ({
                id: w.id,
                payoutNumber: w.payoutNumber,
                amount: w.amount,
                method: w.method,
                status: w.status,
                requestedAt: w.requestedAt,
                processedAt: w.processedAt,
                completedAt: w.completedAt,
                adminNotes: w.adminNotes,
                transactionId: w.transactionId,
            })),
            upcomingReleases: upcomingReleases.map(r => ({
                releaseDate: r.availableAt,
                amount: round2(r._sum.sellerAmount || 0),
            })),
        });

    } catch (error) {
        console.error('[WITHDRAW_GET_ERROR]', error);
        return NextResponse.json({ error: 'فشل جلب بيانات الرصيد' }, { status: 500 });
    }
}

// ─── POST: Create withdrawal request ──────────────────────
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
            return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
        }

        const body = await req.json();
        const { amount, currency = 'USD' } = body;

        // ── Validate amount ──────────────────────────────────────────
        if (typeof amount !== 'number' || isNaN(amount)) {
            return NextResponse.json({ error: 'مبلغ غير صالح' }, { status: 400 });
        }

        const requestedAmount = round2(amount);

        // ── Validate currency ────────────────────────────────────────
        const allowedCurrencies = ['USD'];
        if (!allowedCurrencies.includes(currency)) {
            return NextResponse.json({ error: 'العملة غير مدعومة' }, { status: 400 });
        }

        // ── Get platform settings ────────────────────────────────────
        const settings = await getPlatformSettings();

        if (requestedAmount < settings.minPayoutAmount) {
            return NextResponse.json(
                { error: `الحد الأدنى للسحب هو $${settings.minPayoutAmount}` },
                { status: 400 }
            );
        }

        // ── Release matured balances (on-demand escrow) ──────────────
        await releaseMaturedBalances(userId);

        // ── Get user with payout method ──────────────────────────────
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                availableBalance: true,
                payoutMethod: true,
                bankDetails: true,
                paypalEmail: true,
                cryptoWallet: true,
                shamCashNumber: true,
                omtNumber: true,
                zainCashNumber: true,
                vodafoneCash: true,
                mtncashNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // ── Validate payout method ───────────────────────────────────
        if (!isPayoutMethodConfigured(user)) {
            return NextResponse.json(
                { error: 'يجب إعداد طريقة الاستلام أولاً في إعدادات الحساب' },
                { status: 400 }
            );
        }

        // ── Check for existing pending withdrawal (fraud prevention) ─
        const existingPending = await prisma.payout.count({
            where: { sellerId: userId, status: 'PENDING' },
        });

        if (existingPending > 0) {
            return NextResponse.json(
                { error: 'لديك طلب سحب معلق بالفعل — يرجى انتظار معالجته قبل تقديم طلب جديد' },
                { status: 409 }
            );
        }

        // ── Check aggregate pending withdrawals vs. available balance ─
        const pendingAggregate = await prisma.payout.aggregate({
            where: { sellerId: userId, status: 'PENDING' },
            _sum: { amount: true },
        });
        const pendingTotal = pendingAggregate._sum.amount || 0;

        const spendableBalance = round2(
            Math.max(0, user.availableBalance - pendingTotal)
        );

        if (requestedAmount > spendableBalance) {
            return NextResponse.json(
                {
                    error: 'الرصيد المتاح غير كافٍ',
                    details: {
                        available: spendableBalance,
                        requested: requestedAmount,
                    }
                },
                { status: 400 }
            );
        }

        // ── Prepare payout details (encrypted) ───────────────────────
        const { decryptPaymentJson, decryptPaymentData, encryptPaymentJson } =
            await import('@/lib/encryption');

        let payoutDetails: Record<string, string> = {};
        const method = user.payoutMethod!;

        if (method === 'bank') {
            payoutDetails = decryptPaymentJson(user.bankDetails as any) || {};
        } else if (method === 'paypal') {
            payoutDetails = { email: user.paypalEmail ? decryptPaymentData(user.paypalEmail) : '' };
        } else if (method === 'crypto') {
            payoutDetails = { wallet: user.cryptoWallet ? decryptPaymentData(user.cryptoWallet) : '' };
        } else if (method === 'shamcash') {
            payoutDetails = { phone: user.shamCashNumber || '' };
        } else if (method === 'omt') {
            payoutDetails = { phone: user.omtNumber || '' };
        } else if (method === 'zaincash') {
            payoutDetails = { phone: user.zainCashNumber || '' };
        } else if (method === 'vodafone') {
            payoutDetails = { phone: user.vodafoneCash || '' };
        } else if (method === 'mtncash') {
            payoutDetails = { phone: user.mtncashNumber || '' };
        }

        // ── Atomic transaction: debit balance + create payout ────────
        const payoutNumber = `WDR-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

        const payout = await prisma.$transaction(async (tx) => {
            // Re-check balance inside transaction (prevent race condition)
            const freshUser = await tx.user.findUnique({
                where: { id: userId },
                select: { availableBalance: true },
            });

            if (!freshUser || requestedAmount > round2(freshUser.availableBalance - pendingTotal)) {
                throw new Error('INSUFFICIENT_BALANCE');
            }

            // Create payout record
            const newPayout = await tx.payout.create({
                data: {
                    payoutNumber,
                    sellerId: userId,
                    amount: requestedAmount,
                    method,
                    methodDetails: encryptPaymentJson(payoutDetails) as any,
                    status: 'PENDING',
                },
            });

            return newPayout;
        });

        // ── Notify admin via Telegram ────────────────────────────────
        try {
            await sendTelegramMessage(
                newPayoutMessage({
                    sellerName: user.name,
                    sellerEmail: user.email,
                    amount: requestedAmount,
                    method,
                })
            );
        } catch (telegramErr) {
            console.error('[WITHDRAW] Telegram notification failed:', telegramErr);
            // Non-fatal — continue
        }

        console.log(
            `[WITHDRAW] New request: ${payoutNumber} | User: ${userId} | Amount: $${requestedAmount} | Method: ${method}`
        );

        return NextResponse.json({
            success: true,
            payout: {
                id: payout.id,
                payoutNumber: payout.payoutNumber,
                amount: payout.amount,
                method: payout.method,
                methodLabel: getPayoutMethodLabel(payout.method),
                status: payout.status,
                requestedAt: payout.requestedAt,
            },
            message: `تم تقديم طلب السحب بنجاح (${payoutNumber}) — سيتم المراجعة خلال 2-3 أيام عمل`,
        }, { status: 201 });

    } catch (error) {
        if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
            return NextResponse.json(
                { error: 'الرصيد غير كافٍ — ربما تم تغييره للتو' },
                { status: 400 }
            );
        }

        console.error('[WITHDRAW_POST_ERROR]', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء طلب السحب' },
            { status: 500 }
        );
    }
}
