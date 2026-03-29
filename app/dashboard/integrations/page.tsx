'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLink2, FiAlertTriangle, FiClock, FiVideo } from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

interface Integration {
    id: string;
    name: string;
    description: string;
    features: string[];
    status: 'connected' | 'disconnected' | 'coming_soon';
    icon: React.ReactNode;
    connectUrl?: string;
    color: string;
    bg: string;
}

export default function IntegrationsPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [zoomConnected, setZoomConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await apiGet('/api/user/profile');
                setCalendarConnected(data.googleCalendarConnected || false);
                setZoomConnected(data.zoomConnected || false);
            } catch (e) { } finally {
                setLoading(false);
            }
        };

        if (session?.user) fetchStatus();

        // Read URL success/error params
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        if (success === 'calendar_connected') {
            setCalendarConnected(true);
            setNotification({ type: 'success', text: '✅ تم ربط Google Calendar & Meet بنجاح!' });
            setTimeout(() => setNotification(null), 5000);
        } else if (success === 'zoom_connected') {
            setZoomConnected(true);
            setNotification({ type: 'success', text: '✅ تم ربط Zoom بنجاح!' });
            setTimeout(() => setNotification(null), 5000);
        } else if (error) {
            setNotification({ type: 'error', text: '❌ فشل الربط. حاول مرة أخرى.' });
            setTimeout(() => setNotification(null), 5000);
        }
    }, [session, searchParams]);

    const integrations: Integration[] = [
        {
            id: 'google',
            name: 'Google Calendar & Meet',
            description: 'عند تأكيد أي حجز، يُنشأ تلقائياً حدث في تقويمك مع رابط Google Meet ويُرسل للعميل قبل الموعد بـ 30 دقيقة.',
            features: [
                'إنشاء حدث تلقائي في Google Calendar',
                'رابط Google Meet تلقائي لكل حجز',
                'إرسال تذكير للعميل قبل 30 دقيقة',
                'دعوة تقويم تُرسل فوراً عند الحجز',
            ],
            status: calendarConnected ? 'connected' : 'disconnected',
            connectUrl: '/api/google/calendar/connect',
            icon: (
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            ),
            color: 'text-[#10B981]-600',
            bg: 'bg-emerald-700-50 dark:bg-blue-900/20',
        },
        {
            id: 'zoom',
            name: 'Zoom',
            description: 'أنشئ اجتماعات Zoom تلقائياً عند كل حجز وأرسل الرابط للعميل.',
            features: [
                'إنشاء اجتماع Zoom تلقائي',
                'رابط اجتماع مخصص لكل حجز',
                'تذكير تلقائي قبل الموعد',
            ],
            status: zoomConnected ? 'connected' : 'coming_soon',
            icon: <span className="text-3xl">📹</span>,
            color: 'text-[#10B981]-500',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            description: 'أرسل تأكيدات الحجز وتذكيرات الاستشارات تلقائياً عبر WhatsApp.',
            features: [
                'رسالة تأكيد فورية',
                'تذكير قبل الموعد',
                'إشعار بأي تغيير',
            ],
            status: 'coming_soon',
            icon: <span className="text-3xl">💬</span>,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            id: 'calendly',
            name: 'Calendly',
            description: 'زامن استشاراتك مع Calendly لإدارة أوقات الفراغ بشكل أفضل.',
            features: [
                'مزامنة تلقائية للأوقات',
                'منع التعارض في الاستشارات',
            ],
            status: 'coming_soon',
            icon: <span className="text-3xl">📆</span>,
            color: 'text-[#10B981]',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#10B981] dark:text-white flex items-center gap-3">
                    <FiLink2 className="text-[#10B981]" />
                    التكاملات
                </h1>
                <p className="text-text-muted mt-2">
                    اربط أدواتك المفضلة لأتمتة استشاراتك وتحسين تجربة عملائك
                </p>
            </div>

            {/* Notification Banner */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 font-medium shadow-md ${notification.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {notification.type === 'success'
                        ? <FiCheckCircle className="text-xl flex-shrink-0" />
                        : <FiXCircle className="text-xl flex-shrink-0" />}
                    {notification.text}
                </motion.div>
            )}

            {/* Reminder info box */}
            <div className="bg-emerald-700/5 border border-emerald-600/20 rounded-xl p-5 flex gap-4 items-start">
                <FiClock className="text-[#10B981] text-2xl flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-[#10B981]">إرسال رابط الاجتماع تلقائياً</p>
                    <p className="text-text-muted text-sm mt-1">
                        عند ربط أي خدمة، يتم إرسال رابط الاجتماع للعميل <strong>قبل 30 دقيقة</strong> من الموعد تلقائياً عبر البريد الإلكتروني — لا تحتاج لأي إجراء يدوي.
                    </p>
                </div>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration, i) => (
                    <motion.div
                        key={integration.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className={`card p-6 border-2 transition-all duration-300 ${integration.status === 'connected'
                            ? 'border-green-200 dark:border-green-800'
                            : integration.status === 'coming_soon'
                                ? 'border-dashed border-emerald-500/20 dark:border-gray-700 opacity-70'
                                : 'border-gray-100 dark:border-gray-800 hover:border-emerald-600/40'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl ${integration.bg} flex items-center justify-center shadow-lg shadow-[#10B981]/20`}>
                                    {integration.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#10B981] dark:text-white">
                                        {integration.name}
                                    </h3>
                                    {integration.status === 'connected' && (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-xl mt-1">
                                            <FiCheckCircle />
                                            متصل وفعّال
                                        </span>
                                    )}
                                    {integration.status === 'disconnected' && (
                                        <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-emerald-800 dark:bg-gray-800 px-2.5 py-1 rounded-xl mt-1">
                                            غير مربوط
                                        </span>
                                    )}
                                    {integration.status === 'coming_soon' && (
                                        <span className="inline-flex items-center gap-1.5 text-[#10B981] text-xs font-medium bg-emerald-700-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-xl mt-1">
                                            قريباً
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-text-muted text-sm mb-4">{integration.description}</p>

                        {/* Features */}
                        <ul className="space-y-2 mb-5">
                            {integration.features.map((f, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-[#10B981] dark:text-gray-300">
                                    <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {/* Action Button */}
                        {integration.status === 'connected' ? (
                            <div className="flex gap-3">
                                <div className="flex-1 py-2.5 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 text-sm font-medium rounded-xl text-center border border-green-200">
                                    ✅ الخدمة نشطة
                                </div>
                                <a
                                    href={integration.connectUrl}
                                    className="py-2.5 px-4 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors"
                                >
                                    قطع
                                </a>
                            </div>
                        ) : integration.status === 'disconnected' ? (
                            <a
                                href={integration.connectUrl}
                                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 text-sm"
                            >
                                <FiVideo />
                                ربط {integration.name}
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full py-3 px-4 bg-emerald-800 dark:bg-gray-800 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed"
                            >
                                قريباً...
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
