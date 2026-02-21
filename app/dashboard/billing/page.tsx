'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiArrowUp, FiStar } from 'react-icons/fi';

const planDetails: Record<string, {
    name: string; color: string; commission: string; products: string;
    storage: string; students: string; monthlyPrice: number;
}> = {
    free: { name: 'انطلاقة', color: 'from-gray-500 to-gray-600', commission: '10%', products: '5', storage: '1 GB', students: '100', monthlyPrice: 0 },
    starter: { name: 'رواد', color: 'from-blue-500 to-purple-600', commission: '5%', products: '50', storage: '15 GB', students: '1,000', monthlyPrice: 19 },
    pro: { name: 'تميز', color: 'from-purple-600 to-pink-600', commission: '2%', products: 'غير محدود', storage: '100 GB', students: 'غير محدود', monthlyPrice: 49 },
    enterprise: { name: 'مؤسسات', color: 'from-yellow-500 to-orange-500', commission: '0%', products: 'غير محدود', storage: '+1 TB', students: 'غير محدود', monthlyPrice: 199 },
};

export default function BillingPage() {
    const { data: session } = useSession();

    // Default to free plan
    const currentPlanSlug = 'free';
    const currentPlan = planDetails[currentPlanSlug];

    const upgradePlans = [
        {
            slug: 'starter', name: 'رواد', price: 19, color: 'from-blue-500 to-purple-600',
            highlight: 'الأكثر شعبية', perks: ['عمولة 5% فقط', '50 منتج', 'دردشة مباشرة'],
        },
        {
            slug: 'pro', name: 'تميز', price: 49, color: 'from-purple-600 to-pink-600',
            highlight: 'الأفضل للمحترفين', perks: ['عمولة 2% فقط', 'منتجات غير محدودة', 'مدير حساب'],
        },
    ];

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white flex items-center gap-3">
                    <FiZap className="text-action-blue" />
                    الاشتراك والباقة
                </h1>
                <p className="text-text-muted mt-2">إدارة اشتراكك وترقية باقتك</p>
            </div>

            {/* Current Plan Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
            >
                <div className={`h-2 w-full bg-gradient-to-r ${currentPlan.color}`} />
                <div className="p-8">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-text-muted text-sm mb-1">باقتك الحالية</p>
                            <h2 className="text-3xl font-black text-primary-charcoal dark:text-white">
                                {currentPlan.name}
                            </h2>
                            <p className="text-text-muted mt-1">
                                {currentPlan.monthlyPrice === 0 ? 'مجاناً للأبد' : `$${currentPlan.monthlyPrice} / شهر`}
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="btn btn-primary flex items-center gap-2 py-3 px-6"
                        >
                            <FiArrowUp />
                            ترقية الباقة
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                            { label: 'عمولة المنصة', value: currentPlan.commission, highlight: true },
                            { label: 'المنتجات', value: currentPlan.products },
                            { label: 'التخزين', value: currentPlan.storage },
                            { label: 'الطلاب', value: currentPlan.students },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 text-center">
                                <p className={`text-2xl font-black ${stat.highlight ? 'text-action-blue' : 'text-primary-charcoal dark:text-white'}`}>
                                    {stat.value}
                                </p>
                                <p className="text-text-muted text-xs mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Upgrade Options */}
            {currentPlanSlug === 'free' && (
                <div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        ترقية إلى باقة مدفوعة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upgradePlans.map((plan, i) => (
                            <motion.div
                                key={plan.slug}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className={`bg-gradient-to-r ${plan.color} p-5 text-white`}>
                                    <div className="text-xs font-bold opacity-80 mb-1">{plan.highlight}</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black">${plan.price}</span>
                                        <span className="opacity-80 mb-1">/شهر</span>
                                    </div>
                                    <div className="text-lg font-bold mt-1">{plan.name}</div>
                                </div>
                                <div className="p-5">
                                    <ul className="space-y-2 mb-5">
                                        {plan.perks.map((perk, j) => (
                                            <li key={j} className="flex items-center gap-2 text-sm text-primary-charcoal dark:text-gray-300">
                                                <FiCheck className="text-green-500 flex-shrink-0" />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={`/pricing`}
                                        className={`w-full block text-center py-3 rounded-2xl font-bold text-sm bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}
                                    >
                                        ترقية الآن — 14 يوم مجاني
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Launch Offer */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-action-blue/10 to-purple-500/10 border border-action-blue/20 rounded-3xl p-6 flex items-center gap-5"
            >
                <div className="text-4xl">🚀</div>
                <div>
                    <h4 className="font-bold text-primary-charcoal dark:text-white text-lg">عرض إطلاق حصري!</h4>
                    <p className="text-text-muted text-sm">احصل على خصم 50% لأول 3 أشهر. هذا العرض لأول 500 بائع فقط.</p>
                </div>
                <Link href="/pricing" className="btn btn-primary whitespace-nowrap py-3 px-5 text-sm mr-auto">
                    احجز الآن ←
                </Link>
            </motion.div>

            {/* Billing History Placeholder */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <h3 className="font-bold text-primary-charcoal dark:text-white text-lg mb-4">سجل الفواتير</h3>
                <div className="text-center py-10 text-text-muted">
                    <div className="text-4xl mb-3">📄</div>
                    <p>لا توجد فواتير بعد — أنت على الباقة المجانية</p>
                </div>
            </div>
        </div>
    );
}
