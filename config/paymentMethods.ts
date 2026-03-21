// Payment Methods Configuration by Country

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
                exchangeRate: 13000, // 1 USD = 13000 SYP (approximate)
                enabled: true,
            },
            {
                id: 'omt',
                name: 'OMT',
                nameAr: 'OMT',
                icon: '🏦',
                fields: ['phone', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 13000,
                enabled: true,
            },
            {
                id: 'hawala',
                name: 'Hawala',
                nameAr: 'هوالا',
                icon: '💰',
                fields: ['phone', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 13000,
                enabled: true,
            },
            {
                id: 'mtncash',
                name: 'MTN Cash',
                nameAr: 'MTN كاش',
                icon: '📱',
                fields: ['phone', 'transactionId'],
                currency: 'SYP',
                exchangeRate: 13000,
                enabled: true,
            },
        ],
    },
    IQ: {
        code: 'IQ',
        name: 'Iraq',
        nameAr: 'العراق',
        currency: 'IQD',
        methods: [
            {
                id: 'zaincash',
                name: 'Zain Cash',
                nameAr: 'زين كاش',
                icon: '📱',
                fields: ['phone', 'transactionId'],
                currency: 'IQD',
                exchangeRate: 1450, // 1 USD = 1450 IQD
                enabled: true,
            },
            {
                id: 'qicard',
                name: 'Qi Card',
                nameAr: 'كارت كي',
                icon: '💳',
                fields: ['phone', 'transactionId'],
                currency: 'IQD',
                exchangeRate: 1450,
                enabled: true,
            },
            {
                id: 'asiahawala',
                name: 'Asia Hawala',
                nameAr: 'آسيا حوالة',
                icon: '💰',
                fields: ['phone', 'transactionId'],
                currency: 'IQD',
                exchangeRate: 1450,
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
                id: 'vodafonecash',
                name: 'Vodafone Cash',
                nameAr: 'فودافون كاش',
                icon: '📱',
                fields: ['phone', 'transactionId'],
                currency: 'EGP',
                exchangeRate: 50, // 1 USD = 50 EGP
                enabled: true,
            },
            {
                id: 'fawry',
                name: 'Fawry',
                nameAr: 'فوري',
                icon: '🏪',
                fields: ['transactionId'],
                currency: 'EGP',
                exchangeRate: 50,
                enabled: true,
            },
            {
                id: 'instapay',
                name: 'InstaPay',
                nameAr: 'إنستاباي',
                icon: '⚡',
                fields: ['phone', 'transactionId'],
                currency: 'EGP',
                exchangeRate: 50,
                enabled: true,
            },
        ],
    },
    SA: {
        code: 'SA',
        name: 'Saudi Arabia',
        nameAr: 'السعودية',
        currency: 'SAR',
        methods: [
            {
                id: 'stcpay',
                name: 'STC Pay',
                nameAr: 'STC Pay',
                icon: '📱',
                fields: ['phone', 'transactionId'],
                currency: 'SAR',
                exchangeRate: 3.75, // 1 USD = 3.75 SAR
                enabled: true,
            },
            {
                id: 'banktransfer',
                name: 'Bank Transfer',
                nameAr: 'تحويل بنكي',
                icon: '🏦',
                fields: ['bankName', 'accountNumber', 'transactionId'],
                currency: 'SAR',
                exchangeRate: 3.75,
                enabled: true,
            },
        ],
    },
    DEFAULT: {
        code: 'DEFAULT',
        name: 'Other Countries',
        nameAr: 'دول أخرى',
        currency: 'USD',
        methods: [
            {
                id: 'banktransfer',
                name: 'Bank Transfer',
                nameAr: 'تحويل بنكي',
                icon: '🏦',
                fields: ['bankName', 'accountNumber', 'transactionId'],
                currency: 'USD',
                enabled: true,
            },
            {
                id: 'westernunion',
                name: 'Western Union',
                nameAr: 'ويسترن يونيون',
                icon: '💸',
                fields: ['mtcn', 'senderName'],
                currency: 'USD',
                enabled: true,
            },
        ],
    },
};

/**
 * Get available payment methods for a country
 */
export function getPaymentMethodsForCountry(countryCode: string): CountryPaymentConfig {
    return paymentMethodsByCountry[countryCode] || paymentMethodsByCountry.DEFAULT;
}

/**
 * Convert USD to local currency
 */
export function convertCurrency(amountUSD: number, countryCode: string): {
    amount: number;
    currency: string;
} {
    const config = getPaymentMethodsForCountry(countryCode);
    const method = config.methods[0]; // Use first method's exchange rate

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

/**
 * Format currency with proper symbol
 */
export function formatCurrency(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
        USD: '$',
        SYP: 'ل.س',
        IQD: 'د.ع',
        EGP: '$',
        SAR: 'ر.س',
    };

    const symbol = symbols[currency] || currency;
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);

    return `${formatted} ${symbol}`;
}
