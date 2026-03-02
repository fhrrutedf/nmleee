import { prisma } from '@/lib/db';

export interface CommissionSplit {
    platformFee: number;
    sellerAmount: number;
    commissionRate: number;
}

/**
 * Get platform settings via raw SQL (safe fallback if table missing)
 */
export async function getPlatformSettings() {
    try {
        const rows = await prisma.$queryRaw<any[]>`
            SELECT * FROM platform_settings WHERE id = 'singleton' LIMIT 1
        `;
        if (rows && rows.length > 0) {
            const r = rows[0];
            return {
                commissionRate: Number(r.commission_rate ?? 10),
                escrowDays: Number(r.escrow_days ?? 7),
                minPayoutAmount: Number(r.min_payout_amount ?? 50),
                usdToSyp: Number(r.usd_to_syp ?? 13000),
                usdToIqd: Number(r.usd_to_iqd ?? 1300),
                usdToEgp: Number(r.usd_to_egp ?? 50),
                usdToAed: Number(r.usd_to_aed ?? 3.67),
                syriatelCash: r.syriatel_cash as string | null,
                mtnCash: r.mtn_cash as string | null,
                zainCash: r.zain_cash as string | null,
                shamCash: r.sham_cash as string | null,
                omtNumber: r.omt_number as string | null,
                whishNumber: r.whish_number as string | null,
                platformName: (r.platform_name as string) ?? 'منصتي الرقمية',
                supportEmail: r.support_email as string | null,
                supportWhatsapp: r.support_whatsapp as string | null,
            };
        }
    } catch { /* table may not exist yet */ }

    // Default fallback
    return {
        commissionRate: 10, escrowDays: 7, minPayoutAmount: 50,
        usdToSyp: 13000, usdToIqd: 1300, usdToEgp: 50, usdToAed: 3.67,
        syriatelCash: null, mtnCash: null, zainCash: null, shamCash: null,
        omtNumber: null, whishNumber: null,
        platformName: 'منصتي الرقمية', supportEmail: null, supportWhatsapp: null,
    };
}

/**
 * Calculate commission split for a transaction
 */
export function calculateCommission(totalAmount: number, commissionRate: number): CommissionSplit {
    const platformFee = parseFloat(((totalAmount * commissionRate) / 100).toFixed(2));
    const sellerAmount = parseFloat((totalAmount - platformFee).toFixed(2));
    return { platformFee, sellerAmount, commissionRate };
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
    return parseFloat(converted.toFixed(2));
}

/**
 * ON-DEMAND BALANCE RELEASE
 * Run this when seller opens dashboard. No cron needed.
 * Checks for PENDING transactions past their releaseDate → moves to AVAILABLE.
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
        totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
}

/**
 * PROCESS PAYMENT COMMISSION
 * Call this when a payment is approved/completed.
 * Splits the total into platformFee + sellerAmount and sets escrow period.
 */
export async function processPaymentCommission(orderId: string): Promise<void> {
    const settings = await getPlatformSettings();
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { seller: true },
    });

    if (!order || !order.sellerId || !order.isPaid) return;

    const { platformFee, sellerAmount } = calculateCommission(
        order.totalAmount,
        settings.commissionRate
    );

    const availableAt = new Date(order.paidAt ?? new Date());
    availableAt.setDate(availableAt.getDate() + settings.escrowDays);

    await prisma.$transaction([
        // Update order with commission data
        prisma.order.update({
            where: { id: orderId },
            data: {
                platformFee,
                sellerAmount,
                payoutStatus: 'pending',
                availableAt,
            },
        }),
        // Add to seller's pending balance
        prisma.user.update({
            where: { id: order.sellerId },
            data: {
                pendingBalance: { increment: sellerAmount },
                totalEarnings: { increment: sellerAmount },
            },
        }),
    ]);
}
