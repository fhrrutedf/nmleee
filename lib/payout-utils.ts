import { User } from '@prisma/client';

export const PayoutMethods = {
    CRYPTO: 'crypto',
    SHAMCASH: 'shamcash',
    SYRIATELCASH: 'syriatelcash',
} as const;

export type PayoutMethod = typeof PayoutMethods[keyof typeof PayoutMethods];

/**
 * Checks if the user has a valid and fully configured payout method
 */
export function isPayoutMethodConfigured(user: any): boolean {
    if (!user.payoutMethod) return false;

    switch (user.payoutMethod) {
        case PayoutMethods.CRYPTO:
            return !!user.cryptoWallet;
        case PayoutMethods.SHAMCASH:
            return !!user.shamCashNumber;
        case PayoutMethods.SYRIATELCASH:
            return !!user.syriatelCashNumber;
        default:
            return false;
    }
}

/**
 * Normalizes the payout method name to Arabic label
 */
export function getPayoutMethodLabel(method: string | null): string {
    switch (method) {
        case PayoutMethods.CRYPTO: return 'USDT (Crypto)';
        case PayoutMethods.SHAMCASH: return 'شام كاش';
        case PayoutMethods.SYRIATELCASH: return 'سيريتل كاش';
        default: return 'غير محدد';
    }
}
