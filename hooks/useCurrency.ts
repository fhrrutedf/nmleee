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
        // As requested: fix currency to USD globally for consistency.
        setCurrency({ code: 'USD', symbol: '$', rate: 1 });
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
