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
                id: 'shamcash',
                name: 'Sham Cash',
                nameAr: 'شام كاش',
                icon: '💵',
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
    EG: {
        code: 'EG',
        name: 'Egypt',
        nameAr: 'مصر',
        currency: 'EGP',
        methods: [
            {
                id: 'vodafone_cash',
                name: 'Vodafone Cash (Auto)',
                nameAr: 'فودافون كاش (تلقائي)',
                icon: '📱',
                fields: ['phone'],
                currency: 'EGP',
                exchangeRate: 50,
                enabled: true,
            },
            {
                id: 'credit_card',
                name: 'Global Credit Card',
                nameAr: 'بطاقة بنكية دولية',
                icon: '💳',
                fields: [],
                currency: 'USD',
                enabled: true,
            }
        ],
    },
    IQ: {
        code: 'IQ',
        name: 'Iraq',
        nameAr: 'العراق',
        currency: 'IQD',
        methods: [
            {
                id: 'zain_cash',
                name: 'Zain Cash (Auto)',
                nameAr: 'زين كاش (تلقائي)',
                icon: '📱',
                fields: ['phone'],
                currency: 'IQD',
                exchangeRate: 1500,
                enabled: true,
            },
            {
                id: 'credit_card',
                name: 'Global Credit Card',
                nameAr: 'بطاقة بنكية دولية',
                icon: '💳',
                fields: [],
                currency: 'USD',
                enabled: true,
            }
        ],
    },
    DEFAULT: {
        code: 'DEFAULT',
        name: 'International',
        nameAr: 'دولي',
        currency: 'USD',
        methods: [
            {
                id: 'credit_card',
                name: 'Credit Card',
                nameAr: 'بطاقة بنكية',
                icon: '💳',
                fields: [],
                currency: 'USD',
                enabled: true,
            },
            {
                id: 'crypto_usdt', // Mapping to spaceremit 'usdt_trc20'
                name: 'USDT (TRC20)',
                nameAr: 'عملات رقمية (USDT)',
                icon: '🪙',
                fields: [],
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
        EGP: 'ج.م',
        IQD: 'د.ع'
    };

    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);

    return `${formatted} ${symbol}`;
}
