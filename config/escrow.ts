// Escrow System Configuration

export const escrowConfig = {
    // Platform commission percentage
    platformFeePercentage: 10, // 10%

    // Minimum amount for payout request
    minPayoutAmount: 50, // $50

    // Holding period before funds become available (in days)
    holdingPeriodDays: 7, // 7 days

    // Payout schedule
    payoutSchedule: 'weekly', // 'weekly' | 'biweekly' | 'monthly'

    // Supported payout methods
    payoutMethods: ['bank', 'paypal', 'crypto'] as const,

    // Currency
    currency: 'USD',
};

export type PayoutMethod = typeof escrowConfig.payoutMethods[number];
