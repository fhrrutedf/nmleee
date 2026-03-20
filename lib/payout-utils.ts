import { User } from '@prisma/client';

export const PayoutMethods = {
    BANK: 'bank',
    PAYPAL: 'paypal',
    CRYPTO: 'crypto',
    SHAMCASH: 'shamcash',
    OMT: 'omt',
    ZAINCASH: 'zaincash',
    VODAFONE: 'vodafone',
    MTNCASH: 'mtncash',
} as const;

export type PayoutMethod = typeof PayoutMethods[keyof typeof PayoutMethods];

/**
 * Checks if the user has a valid and fully configured payout method
 */
export function isPayoutMethodConfigured(user: any): boolean {
    if (!user.payoutMethod) return false;

    switch (user.payoutMethod) {
        case PayoutMethods.BANK:
            return !!(user.bankName && user.accountNumber && user.accountName);
        case PayoutMethods.PAYPAL:
            return !!user.paypalEmail;
        case PayoutMethods.CRYPTO:
            return !!user.cryptoWallet;
        case PayoutMethods.SHAMCASH:
            return !!user.shamCashNumber;
        case PayoutMethods.OMT:
            return !!user.omtNumber;
        case PayoutMethods.ZAINCASH:
            return !!user.zainCashNumber;
        case PayoutMethods.VODAFONE:
            return !!user.vodafoneCash;
        case PayoutMethods.MTNCASH:
            return !!user.mtncashNumber;
        default:
            return false;
    }
}

/**
 * Normalizes the payout method name to Arabic label
 */
export function getPayoutMethodLabel(method: string | null): string {
    switch (method) {
        case PayoutMethods.BANK: return 'تحويل بنكي';
        case PayoutMethods.PAYPAL: return 'PayPal';
        case PayoutMethods.CRYPTO: return 'USDT (Crypto)';
        case PayoutMethods.SHAMCASH: return 'شام كاش';
        case PayoutMethods.OMT: return 'OMT';
        case PayoutMethods.ZAINCASH: return 'زين كاش';
        case PayoutMethods.VODAFONE: return 'فودافون كاش';
        case PayoutMethods.MTNCASH: return 'MTN Cash';
        default: return 'غير محدد';
    }
}
