import { prisma } from '@/lib/prisma';

export interface CommissionSplit {
    platformFee: number;
    sellerAmount: number;
    commissionRate: number;
}

/**
 * Get platform settings (with fallback defaults)
 */
export async function getPlatformSettings() {
    try {
        let settings = await prisma.platformSettings.findUnique({
            where: { id: 'singleton' },
        });

        if (!settings) {
            // Create default settings if not exist
            settings = await prisma.platformSettings.upsert({
                where: { id: 'singleton' },
                create: { id: 'singleton' },
                update: {},
            });
        }

        return settings;
    } catch {
        // Return defaults if DB error
        return {
            id: 'singleton',
            commissionRate: 10,
            escrowDays: 7,
            minPayoutAmount: 50,
            usdToSyp: 13000,
            usdToIqd: 1300,
            usdToEgp: 50,
            usdToAed: 3.67,
        };
    }
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
