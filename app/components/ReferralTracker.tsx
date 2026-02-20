'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Tracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            // حفظ كود الإحالة في الـ localStorage لمدة زمنية معينة (أو دائم حتى يتغير)
            localStorage.setItem('affiliate_ref', ref);

            // للحماية والموثوقية أيضاً، نخزنه في Session
            sessionStorage.setItem('affiliate_ref', ref);
        }
    }, [searchParams]);

    return null;
}

export function ReferralTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    );
}
