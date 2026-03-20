'use client';

import { useState, useEffect } from 'react';

export type CurrencyInfo = {
    code: string;
    symbol: string;
    rate: number;
};

export const useCurrency = () => {
    const [currency, setCurrency] = useState<CurrencyInfo>({
        code: 'USD',
        symbol: '$',
        rate: 1
    });

    useEffect(() => {
        const detectCurrency = async () => {
            try {
                // Try to get country from a free API or custom endpoint
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                const country = data.country_code;

                // Simple mapping (could be improved with dynamic rates from DB)
                if (country === 'EG') {
                    setCurrency({ code: 'EGP', symbol: 'ج.م', rate: 50 });
                } else if (country === 'SY') {
                    setCurrency({ code: 'SYP', symbol: 'ل.س', rate: 15000 });
                } else if (country === 'IQ') {
                    setCurrency({ code: 'IQD', symbol: 'د.ع', rate: 1320 });
                } else {
                    setCurrency({ code: 'USD', symbol: '$', rate: 1 });
                }
            } catch (error) {
                console.error('Currency detection failed', error);
            }
        };

        detectCurrency();
    }, []);

    const formatPrice = (priceInUsd: number) => {
        const converted = priceInUsd * currency.rate;
        return {
            value: converted.toLocaleString(undefined, { minimumFractionDigits: converted < 1 ? 2 : 0, maximumFractionDigits: 2 }),
            symbol: currency.symbol,
            code: currency.code
        };
    };

    return { currency, formatPrice };
};
