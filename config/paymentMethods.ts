// Simplified Payment Methods Configuration
// Focuses only on Crypto (Global) and Local Manual Payments (Syria)

export interface PaymentMethod {
    id: string;
    name: string;
    nameAr: string;
    icon: string;
    fields: string[];
    currency: string;
    exchangeRate?: number;
    enabled: boolean;
}

export interface CountryPaymentConfig {
    code: string;
    name: string;
    nameAr: string;
    currency: string;
    methods: PaymentMethod[];
}

export const paymentMethodsByCountry: Record<string, CountryPaymentConfig> = {
    SY: {
        code: 'SY',
        name: 'Syria',
        nameAr: 'سوريا',
        currency: 'SYP',
        methods: [
            {
                id: 'shamcash',
                name: 'Sham Cash',
                nameAr: 'شام كاش',
                icon: '💵',
                fields: ['phone', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 15000, // 1 USD = 15000 SYP (Adjusted for current market)
                enabled: true,
            },
            {
                id: 'mtncash',
                name: 'MTN Cash',
                nameAr: 'MTN كاش',
                icon: '📱',
                fields: ['phone', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 15000,
                enabled: true,
            },
            {
                id: 'alharam',
                name: 'Al Haram',
                nameAr: 'شركة الهرم',
                icon: '🏢',
                fields: ['senderName', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 15000,
                enabled: true,
            },
        ],
    },
    DEFAULT: {
        code: 'DEFAULT',
        name: 'International',
        nameAr: 'دولي',
        currency: 'USD',
        methods: [
            {
                id: 'crypto',
                name: 'Crypto (USDT)',
                nameAr: 'عملات رقمية (USDT)',
                icon: '🪙',
                fields: ['transactionHash'],
                currency: 'USD',
                enabled: true,
            }
        ],
    },
};

export function getPaymentMethodsForCountry(countryCode: string): CountryPaymentConfig {
    return paymentMethodsByCountry[countryCode] || paymentMethodsByCountry.DEFAULT;
}

export function convertCurrency(amountUSD: number, countryCode: string): {
    amount: number;
    currency: string;
} {
    const config = getPaymentMethodsForCountry(countryCode);
    const method = config.methods[0];

    if (method.exchangeRate) {
        return {
            amount: amountUSD * method.exchangeRate,
            currency: config.currency,
        };
    }

    return {
        amount: amountUSD,
        currency: 'USD',
    };
}

export function formatCurrency(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
        USD: '$',
        SYP: 'ل.س',
    };

    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);

    return `${formatted} ${symbol}`;
}
