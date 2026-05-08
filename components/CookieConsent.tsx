'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'manasa_cookie_consent';

type ConsentState = 'pending' | 'accepted' | 'rejected';

export default function CookieConsent() {
    const [state, setState] = useState<ConsentState>('pending');
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!stored) {
            // تأخير ظهور البانر 1.5 ثانية
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
        setState(stored as ConsentState);
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setState('accepted');
        setVisible(false);
        // تفعيل Google Analytics أو أي تتبع هنا
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
            });
        }
    };

    const handleReject = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        setState('rejected');
        setVisible(false);
    };

    if (state !== 'pending' || !visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
                dir="rtl"
            >
                <div className="max-w-4xl mx-auto bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* الشريط العلوي */}
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-violet-500" />

                    <div className="p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* الأيقونة */}
                            <div className="flex-shrink-0 text-3xl">🍪</div>

                            {/* النص */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-base mb-1">
                                    نستخدم ملفات تعريف الارتباط (Cookies)
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحليل استخدام المنصة، وتقديم محتوى مخصص.
                                    استمرارك في استخدام المنصة يعني موافقتك.{' '}
                                    <a href="/privacy" className="text-emerald-400 hover:underline">
                                        سياسة الخصوصية
                                    </a>
                                </p>

                                {/* تفاصيل */}
                                {showDetails && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
                                    >
                                        {[
                                            { icon: '⚙️', name: 'ضرورية', desc: 'تسجيل الدخول والجلسة', required: true },
                                            { icon: '📊', name: 'تحليلية', desc: 'تحسين أداء المنصة', required: false },
                                            { icon: '🎯', name: 'تسويقية', desc: 'عروض مخصصة لك', required: false },
                                        ].map((cat) => (
                                            <div key={cat.name} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5 text-xs">
                                                <span>{cat.icon}</span>
                                                <div>
                                                    <div className="text-white font-semibold flex items-center gap-1">
                                                        {cat.name}
                                                        {cat.required && (
                                                            <span className="text-emerald-400 text-[10px]">(مطلوب)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400">{cat.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-gray-500 hover:text-gray-300 text-xs mt-2 transition-colors"
                                >
                                    {showDetails ? '▲ إخفاء التفاصيل' : '▼ عرض التفاصيل'}
                                </button>
                            </div>

                            {/* الأزرار */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0 min-w-[140px]">
                                <button
                                    onClick={handleAccept}
                                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    قبول الكل ✓
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl transition-colors border border-white/10"
                                >
                                    الضروري فقط
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
