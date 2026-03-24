import { prisma } from '@/lib/db';

export interface CommissionSplit {
    platformFee: number;
    sellerAmount: number;
    commissionRate: number;
    referralAmount: number;
}

// ─── Decimal-safe helpers ─────────────────────────────────
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Get platform settings (with tiered rates)
 */
export async function getPlatformSettings() {
    try {
        const settings = await (prisma as any).platformSettings.findUnique({
            where: { id: 'singleton' },
        });
        if (settings) {
            return {
                commissionRate: settings.commissionRate ?? 10,
                growthCommissionRate: (settings as any).growthCommissionRate ?? 5,
                proCommissionRate: (settings as any).proCommissionRate ?? 2,
                escrowDays: settings.escrowDays ?? 7,
                freeEscrowDays: (settings as any).freeEscrowDays ?? 14,
                growthEscrowDays: (settings as any).growthEscrowDays ?? 7,
                proEscrowDays: (settings as any).proEscrowDays ?? 1,
                referralCommissionRate: (settings as any).referralCommissionRate ?? 10,
                minPayoutAmount: settings.minPayoutAmount ?? 50,
                usdToSyp: settings.usdToSyp ?? 13000,
                usdToIqd: settings.usdToIqd ?? 1300,
                usdToEgp: settings.usdToEgp ?? 50,
                usdToAed: settings.usdToAed ?? 3.67,
                syriatelCash: settings.syriatelCash,
                mtnCash: settings.mtnCash,
                zainCash: settings.zainCash,
                shamCash: settings.shamCash,
                omtNumber: settings.omtNumber,
                whishNumber: settings.whishNumber,
                platformName: settings.platformName ?? 'منصتي الرقمية',
                supportEmail: settings.supportEmail,
                supportWhatsapp: settings.supportWhatsapp,
                socialTelegram: settings.socialTelegram,
                socialInstagram: settings.socialInstagram,
                socialFacebook: settings.socialFacebook,
                socialTwitter: settings.socialTwitter,
                socialYoutube: settings.socialYoutube,
            };
        }
    } catch { /* table may not exist yet */ }

    // Default fallback
    return {
        commissionRate: 10, growthCommissionRate: 5, proCommissionRate: 2,
        escrowDays: 7, freeEscrowDays: 14, growthEscrowDays: 7, proEscrowDays: 1,
        referralCommissionRate: 10,
        minPayoutAmount: 50,
        usdToSyp: 13000, usdToIqd: 1300, usdToEgp: 50, usdToAed: 3.67,
        syriatelCash: null, mtnCash: null, zainCash: null, shamCash: null,
        omtNumber: null, whishNumber: null,
        platformName: 'منصتي الرقمية', supportEmail: null, supportWhatsapp: null,
        socialTelegram: null, socialInstagram: null, socialFacebook: null,
        socialTwitter: null, socialYoutube: null,
    };
}

/**
 * Get the correct commission rate for a seller's plan
 * Also checks for custom commission rate override!
 */
export function getCommissionRateForPlan(
    user: { planType?: string; custom_commission_rate?: number | null },
    settings: { commissionRate: number; growthCommissionRate: number; proCommissionRate: number }
): number {
    // 1. High-Priority: Admin-Set Custom Rate Override
    if (user.custom_commission_rate !== undefined && user.custom_commission_rate !== null && user.custom_commission_rate >= 0) {
        return user.custom_commission_rate;
    }

    // 2. Fallback: Plan-Based Rate
    const planType = user.planType || 'FREE';
    switch (planType) {
        case 'PRO':    return settings.proCommissionRate;
        case 'GROWTH': return settings.growthCommissionRate;
        default:       return settings.commissionRate; // FREE
    }
}

/**
 * Get the correct escrow days for a seller's plan
 */
export function getEscrowDaysForPlan(
    planType: string,
    settings: { freeEscrowDays: number; growthEscrowDays: number; proEscrowDays: number }
): number {
    switch (planType) {
        case 'PRO':    return settings.proEscrowDays;
        case 'GROWTH': return settings.growthEscrowDays;
        default:       return settings.freeEscrowDays; // FREE
    }
}

/**
 * Calculate commission split for a transaction (tiered)
 */
export function calculateCommission(totalAmount: number, commissionRate: number): CommissionSplit {
    const platformFee = round2((totalAmount * commissionRate) / 100);
    const sellerAmount = round2(totalAmount - platformFee);
    return { platformFee, sellerAmount, commissionRate, referralAmount: 0 };
}

/**
 * Convert amount between currencies based on admin-set rates
 */
export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: { usdToSyp: number; usdToIqd: number; usdToEgp: number; usdToAed: number }
): number {
    if (fromCurrency === toCurrency) return amount;

    const toUSD: Record<string, number> = {
        USD: 1,
        SYP: 1 / rates.usdToSyp,
        IQD: 1 / rates.usdToIqd,
        EGP: 1 / rates.usdToEgp,
        AED: 1 / rates.usdToAed,
    };

    const fromUSD: Record<string, number> = {
        USD: 1,
        SYP: rates.usdToSyp,
        IQD: rates.usdToIqd,
        EGP: rates.usdToEgp,
        AED: rates.usdToAed,
    };

    const amountInUSD = amount * (toUSD[fromCurrency] ?? 1);
    const converted = amountInUSD * (fromUSD[toCurrency] ?? 1);
    return round2(converted);
}

/**
 * Auto-downgrade expired subscriptions
 * Called before commission calculations to ensure plan is current
 */
export async function ensurePlanCurrent(sellerId: string): Promise<string> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: sellerId },
        });

        if (!user) return 'FREE';

        const planType = (user as any).planType || 'FREE';
        const planExpiresAt = (user as any).planExpiresAt;

        // If plan has expired, downgrade to FREE automatically
        if (
            planType !== 'FREE' &&
            planExpiresAt &&
            new Date(planExpiresAt) < new Date()
        ) {
            await prisma.user.update({
                where: { id: sellerId },
                data: { planType: 'FREE', planExpiresAt: null } as any,
            });
            return 'FREE';
        }

        return planType;
    } catch (error) {
        console.error('⚠️ ensurePlanCurrent error:', error);
        return 'FREE';
    }
}

/**
 * ON-DEMAND BALANCE RELEASE
 * Run this when seller opens dashboard. No cron needed.
 * Now uses per-plan escrow days!
 */
export async function releaseMaturedBalances(sellerId: string): Promise<{
    released: number;
    totalAmount: number;
}> {
    const now = new Date();

    // Find all pending transactions past their release date
    const maturedOrders = await prisma.order.findMany({
        where: {
            sellerId,
            payoutStatus: 'pending',
            isPaid: true,
            availableAt: { lte: now },
        },
        select: { id: true, sellerAmount: true },
    });

    if (maturedOrders.length === 0) {
        return { released: 0, totalAmount: 0 };
    }

    const totalAmount = maturedOrders.reduce((sum, o) => sum + o.sellerAmount, 0);
    const orderIds = maturedOrders.map(o => o.id);

    // Atomic update: move to available
    await prisma.$transaction([
        // Update order statuses
        prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: { payoutStatus: 'available' },
        }),
        // Move from pending to available balance
        prisma.user.update({
            where: { id: sellerId },
            data: {
                pendingBalance: { decrement: totalAmount },
                availableBalance: { increment: totalAmount },
            },
        }),
    ]);

    return {
        released: maturedOrders.length,
        totalAmount: round2(totalAmount),
    };
}

/**
 * PROCESS PAYMENT COMMISSION (Tiered + Referral Tree + Currency Lock)
 * 
 * 1. Auto-checks/downgrades expired plans before calculating
 * 2. Uses tiered commission based on seller's planType
 * 3. Locks exchange rate at payment time
 * 4. Calculates referral tree commission (1% of platform fee → referrer)
 * 5. Uses per-plan escrow periods
 */
export async function processPaymentCommission(orderId: string): Promise<void> {
    const settings = await getPlatformSettings();
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { seller: true },
    });

    if (!order || !order.sellerId || !order.isPaid) return;

    // Step 1: Ensure seller's plan is current (auto-downgrade if expired)
    const currentPlan = await ensurePlanCurrent(order.sellerId);

    // Step 2: Get tiered/custom commission rate
    const seller = order.seller as any;
    if (!seller) return;

    const commissionRate = getCommissionRateForPlan(seller, settings);
    const { platformFee, sellerAmount } = calculateCommission(order.totalAmount, commissionRate);

    // Step 3: Get per-plan escrow days
    const escrowDays = getEscrowDaysForPlan(currentPlan, settings);
    const availableAt = new Date(order.paidAt ?? new Date());
    availableAt.setDate(availableAt.getDate() + escrowDays);

    // Step 4: Lock exchange rate at payment time (Default to SYP rate for now)
    const lockedExchangeRate = settings.usdToSyp || 15000;

    // Step 5: Calculate referral tree commission (الشجرة)
    let referralCommission = 0;
    const referredById = (seller as any)?.referredById;

    if (referredById && platformFee > 0) {
        // 1% of platform fee goes to the referrer
        referralCommission = round2((platformFee * settings.referralCommissionRate) / 100);
    }

    // Step 6: Atomic transaction — update everything together
    const operations: any[] = [
        // Update order with commission data + locked rate
        prisma.order.update({
            where: { id: orderId },
            data: {
                platformFee,
                sellerAmount,
                payoutStatus: 'pending',
                availableAt,
                lockedExchangeRate,
                referralCommission,
            } as any,
        }),
        // Add to seller's pending balance + total earnings
        prisma.user.update({
            where: { id: order.sellerId },
            data: {
                pendingBalance: { increment: sellerAmount },
                totalEarnings: { increment: sellerAmount },
            },
        }),
    ];

    // If there's a referral commission, credit the referrer
    if (referralCommission > 0 && referredById) {
        operations.push(
            prisma.user.update({
                where: { id: referredById },
                data: {
                    referralEarnings: { increment: referralCommission },
                    availableBalance: { increment: referralCommission },
                } as any,
            })
        );
    }

    await prisma.$transaction(operations);
}
/**
 * 💸 REVERSE PAYMENT / REFUND
 * Subtracts seller amounts and reverses commissions.
 */
export async function reversePaymentCommission(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, sellerId: true, sellerAmount: true, referralCommission: true, seller: true }
    });

    if (!order || !order.sellerId) return;

    const operations: any[] = [
        // Update order status
        prisma.order.update({
            where: { id: orderId },
            data: { status: 'REFUNDED', payoutStatus: 'cancelled' } as any,
        }),
        // Subtract from seller balance
        prisma.user.update({
            where: { id: order.sellerId },
            data: {
                // Deduct from either pending or available balance (wherever the money is now)
                pendingBalance: { decrement: order.sellerAmount },
                totalEarnings: { decrement: order.sellerAmount },
            },
        })
    ];

    // Reverse referral if exists
    const referredById = (order.seller as any)?.referredById;
    if (order.referralCommission > 0 && referredById) {
        operations.push(
            prisma.user.update({
                where: { id: referredById },
                data: {
                    referralEarnings: { decrement: order.referralCommission },
                    availableBalance: { decrement: order.referralCommission },
                } as any,
            })
        );
    }

    await prisma.$transaction(operations);
}
