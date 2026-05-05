// Payment Methods Configuration (Globalized Spaceremit)

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
                id: 'syriatel_cash',
                name: 'Syriatel Cash',
                nameAr: 'سيريتل كاش (تلقائي)',
                icon: '📱',
                fields: [],
                currency: 'SYP',
                enabled: true,
            },
            {
                id: 'shamcash',
                name: 'Sham Cash',
                nameAr: 'شام كاش (تلقائي)',
                icon: '💚',
                fields: [],
                currency: 'SYP',
                enabled: true,
            },
            {
                id: 'crypto_usdt',
                name: 'USDT (TRC20)',
                nameAr: 'تتر (USDT)',
                icon: '🪙',
                fields: [],
                currency: 'USD',
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
                id: 'crypto_usdt',
                name: 'USDT (TRC20)',
                nameAr: 'تتر (USDT)',
                icon: '🪙',
                fields: [],
                currency: 'USD',
                enabled: true,
            },
        ],
    },
};

export function getPaymentMethodsForCountry(countryCode: string): CountryPaymentConfig {
    return paymentMethodsByCountry[countryCode] || paymentMethodsByCountry.DEFAULT;
}

export function convertCurrency(
    amountUSD: number, 
    countryCode: string, 
    customRates?: { usdToSyp: number; usdToSypCrypto?: number; usdToEgp?: number; usdToIqd?: number },
    methodId?: string
): {
    amount: number;
    currency: string;
} {
    const config = getPaymentMethodsForCountry(countryCode);
    
    if (countryCode === 'SY' && customRates) {
        let rate = customRates.usdToSyp;
        if (methodId === 'crypto_usdt') rate = customRates.usdToSypCrypto || rate;
        
        return {
            amount: amountUSD * rate,
            currency: 'SYP'
        };
    }

    // Default static fallbacks
    const symbols: Record<string, number> = {
        SY: 15000,
    };

    const rate = symbols[countryCode] || 1;
    if (countryCode !== 'DEFAULT' && config.currency !== 'USD') {
        return {
            amount: amountUSD * rate,
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
        EGP: 'ج.م',
        IQD: 'د.ع'
    };

    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);

    return `${formatted} ${symbol}`;
}
