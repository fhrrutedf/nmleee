'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiX, FiCheckCircle } from 'react-icons/fi';
import { getCookie, setCookie } from '@/lib/marketing';

function AffiliateBannerContent() {
    const searchParams = useSearchParams();
    const [affiliateName, setAffiliateName] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Track the affiliate code from URL ?aff=CODE or ?ref=CODE
        const affCode = searchParams.get('aff') || searchParams.get('ref');
        
        if (affCode) {
            validateAndTrack(affCode);
        } else {
            // No code in URL, check if there's an existing 30-day cookie
            const savedName = getCookie('aff_name');
            if (savedName) {
                setAffiliateName(decodeURIComponent(savedName));
                setIsVisible(true);
            }
        }
    }, [searchParams]);

    const validateAndTrack = async (code: string) => {
        try {
            const res = await fetch(`/api/marketing/affiliate/validate/${code}`);
            if (res.ok) {
                const data = await res.json();
                setAffiliateName(data.affiliateName);
                setIsVisible(true);
                
                // Set cookies for 30 days (attribution window)
                setCookie('aff_code', data.code, 30);
                setCookie('aff_name', encodeURIComponent(data.affiliateName), 30);
            }
        } catch (e) {
            console.error('Affiliate tracking failed', e);
        }
    };

    if (!isVisible || !affiliateName) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-ink text-white overflow-hidden relative z-50 transition-all border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center  shadow-sm shadow-white/10">
                            <FiGift className="text-white text-lg" />
                        </div>
                        <div className="text-xs sm:text-sm font-bold flex flex-wrap items-center gap-x-1.5 leading-relaxed">
                            <span className="opacity-90">🎉 أنت تستفيد الآن من عرض خاص مقدم من</span>
                            <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/20 text-white shadow-inner">
                                {affiliateName}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 px-2 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                        title="إغلاق التنبيه"
                    >
                        <FiX size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function AffiliateBanner() {
    return (
        <Suspense fallback={null}>
            <AffiliateBannerContent />
        </Suspense>
    );
}
