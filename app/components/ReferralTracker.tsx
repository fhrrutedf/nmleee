'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Tracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            // حفظ كود الإحالة في المتصفح
            localStorage.setItem('affiliate_ref', ref);
            sessionStorage.setItem('affiliate_ref', ref);

            // استدعاء API التتبع لتسجيل النقرة وتعيين الكوكيز (HTTP-only)
            fetch('/api/affiliate/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: ref })
            }).catch(err => console.error('Tracking Error:', err));
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
