'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

const plans = [
    {
        slug: 'free',
        name: 'انطلاقة',
        badge: null,
        description: 'ابدأ رحلتك مجاناً وقم ببيع منتجاتك الرقمية',
        monthlyPrice: 0,
        yearlyPrice: 0,
        commission: '10%',
        maxProducts: '5 منتجات',
        storage: '1 جيجابايت',
        students: 'حتى 100 طالب',
        support: 'بريد إلكتروني',
        color: 'from-gray-500 to-gray-600',
        border: 'border-gray-200 dark:border-gray-700',
        btnClass: 'bg-gray-800 hover:bg-gray-700 text-white',
        popular: false,
        features: [
            '5 منتجات رقمية',
            'متجر إلكتروني احترافي',
            'قبول الدفع أونلاين',
            'لوحة تحكم كاملة',
            'تحليلات أساسية',
            'دعم بالبريد الإلكتروني',
        ],
        notIncluded: [
            'تجريبي مجاني 14 يوم',
            'دعم الدردشة المباشرة',
            'مدير حساب مخصص',
        ],
        cta: 'باقتك الحالية',
        href: '#',
    },
    {
        slug: 'starter',
        name: 'رواد',
        badge: 'الأكثر شعبية',
        description: 'للمبدعين الجادين الذين يريدون نمو حقيقي',
        monthlyPrice: 19,
        yearlyPrice: 182,
        commission: '5%',
        maxProducts: '50 منتج',
        storage: '15 جيجابايت',
        students: 'حتى 1,000 طالب',
        support: 'بريد + دردشة مباشرة',
        color: 'from-blue-500 to-purple-600',
        border: 'border-action-blue',
        btnClass: 'bg-action-blue hover:bg-action-blue/90 text-white',
        popular: true,
        features: [
            '50 منتج رقمي',
            'عمولة 5% فقط (توفير 50%)',
            '15 جيجابايت تخزين',
            'حتى 1,000 طالب',
            'كوبونات خصم',
            'برنامج الإحالة',
            'تحليلات متقدمة',
            'دردشة مباشرة مع الدعم',
            'تجريبي مجاني 14 يوم',
        ],
        notIncluded: [
            'مدير حساب مخصص',
            'دعم VIP 24/7',
        ],
        cta: 'ترقية إلى رواد',
        href: '#', // Change from /register to action or contact for logged in users
    },
    {
        slug: 'pro',
        name: 'تميز',
        badge: 'الأفضل للمحترفين',
        description: 'قدرات لا محدودة لصانعي المحتوى المحترفين',
        monthlyPrice: 49,
        yearlyPrice: 470,
        commission: '2%',
        maxProducts: 'غير محدود',
        storage: '100 جيجابايت',
        students: 'غير محدود',
        support: 'مدير حساب مخصص',
        color: 'from-purple-600 to-pink-600',
        border: 'border-purple-400',
        btnClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white',
        popular: false,
        features: [
            'منتجات غير محدودة',
            'عمولة 2% فقط (الأدنى)',
            '100 جيجابايت تخزين',
            'طلاب غير محدودين',
            'جميع ميزات رواد',
            'Google Calendar & Meet',
            'مدير حساب مخصص',
            'API للمطورين',
            'لوحة تحليلات Pro',
            'تجريبي مجاني 14 يوم',
        ],
        notIncluded: [],
        cta: 'ترقية إلى تميز',
        href: '#',
    },
    {
        slug: 'enterprise',
        name: 'مؤسسات',
        badge: null,
        description: 'حلول مخصصة للشركات والمؤسسات الكبرى',
        monthlyPrice: 199,
        yearlyPrice: 0,
        commission: '0%',
        maxProducts: 'غير محدود',
        storage: '+1 تيرابايت',
        students: 'غير محدود',
        support: 'VIP دعم 24/7',
        color: 'from-yellow-500 to-orange-500',
        border: 'border-yellow-400',
        btnClass: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white',
        popular: false,
        features: [
            'صفر عمولة على المبيعات',
            'تخزين +1 تيرابايت',
            'جميع ميزات تميز',
            'White-label (شعارك الخاص)',
            'SLA ضمان الأداء',
            'تكامل API مخصص',
            'تدريب الفريق',
            'دعم VIP 24/7',
            'مدير حساب مخصص',
        ],
        notIncluded: [],
        cta: 'تواصل معنا',
        href: '/contact',
        custom: true,
    },
];

const comparisonFeatures = [
    { feature: 'عمولة المنصة', free: '10%', starter: '5%', pro: '2%', enterprise: '0%' },
    { feature: 'عدد المنتجات', free: '5', starter: '50', pro: 'غير محدود', enterprise: 'غير محدود' },
    { feature: 'مساحة التخزين', free: '1 GB', starter: '15 GB', pro: '100 GB', enterprise: '+1 TB' },
    { feature: 'عدد الطلاب', free: '100', starter: '1,000', pro: 'غير محدود', enterprise: 'غير محدود' },
    { feature: 'كوبونات الخصم', free: '❌', starter: '✅', pro: '✅', enterprise: '✅' },
    { feature: 'برنامج الإحالة', free: '❌', starter: '✅', pro: '✅', enterprise: '✅' },
    { feature: 'Google Meet', free: '❌', starter: '❌', pro: '✅', enterprise: '✅' },
    { feature: 'تحليلات متقدمة', free: '❌', starter: '✅', pro: '✅', enterprise: '✅' },
    { feature: 'دردشة مباشرة', free: '❌', starter: '✅', pro: '✅', enterprise: '✅' },
    { feature: 'مدير حساب', free: '❌', starter: '❌', pro: '✅', enterprise: '✅' },
    { feature: 'White-label', free: '❌', starter: '❌', pro: '❌', enterprise: '✅' },
    { feature: 'دعم VIP 24/7', free: '❌', starter: '❌', pro: '❌', enterprise: '✅' },
    { feature: 'تجريبي مجاني', free: '❌', starter: '14 يوم', pro: '14 يوم', enterprise: 'تخصيص' },
];

export default function BillingPage() {
    const { data: session } = useSession();
    const [isYearly, setIsYearly] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [currentPlanSlug, setCurrentPlanSlug] = useState('free');
    const [upgrading, setUpgrading] = useState<string | null>(null);

    // Map DB plan types to billing page slugs
    const planTypeToSlug: Record<string, string> = { FREE: 'free', GROWTH: 'starter', PRO: 'pro' };

    useEffect(() => {
        // Fetch current plan
        fetch('/api/seller/financial-overview')
            .then(res => res.json())
            .then(data => {
                if (data?.plan?.type) {
                    setCurrentPlanSlug(planTypeToSlug[data.plan.type] || 'free');
                }
            })
            .catch(() => {});
    }, []);

    const handleUpgrade = async (targetSlug: string) => {
        if (targetSlug === currentPlanSlug || targetSlug === 'enterprise') return;
        
        const slugToPlanType: Record<string, string> = { free: 'FREE', starter: 'GROWTH', pro: 'PRO' };
        const planType = slugToPlanType[targetSlug];
        if (!planType) return;

        const confirmed = window.confirm(
            `هل تريد ${targetSlug === 'free' ? 'تخفيض' : 'ترقية'} باقتك إلى ${plans.find(p => p.slug === targetSlug)?.name}؟\n\nملاحظة: سيتم تحديث باقتك فوراً. تواصل مع الدعم لإتمام الدفع.`
        );
        if (!confirmed) return;

        setUpgrading(targetSlug);
        try {
            // For now, show contact info — in production this would go through Stripe
            alert(`✅ تم إرسال طلب الترقية إلى ${plans.find(p => p.slug === targetSlug)?.name}.\n\nتواصل معنا عبر الواتساب لإتمام الدفع وتفعيل الباقة فوراً.`);
        } finally {
            setUpgrading(null);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <section className="relative py-12 overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-charcoal via-purple-900/50 to-primary-charcoal" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,18,149,0.15)_0%,transparent_70%)]" />
                <div className="relative max-w-5xl mx-auto px-4 text-center">
                    {/* Launch Offer Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-action-blue/20 border border-action-blue/40 text-action-blue px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm"
                    >
                        🚀 عرض إطلاق حصري — خصم 50% لأول 3 أشهر لأول 500 بائع!
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white mb-6"
                    >
                        إدارة اشتراكك — رقِ باقتك{' '}
                        <span className="bg-gradient-to-r from-action-blue to-purple-400 bg-clip-text text-transparent">
                            الآن
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
                    >
                        لا رسوم خفية. لا عقود طويلة. ألغِ في أي وقت.
                    </motion.p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-2"
                    >
                        <button
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${!isYearly ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-300 hover:text-white'}`}
                        >
                            شهري
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all relative ${isYearly ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-300 hover:text-white'}`}
                        >
                            سنوي
                            <span className="absolute -top-3 -left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                وفّر 20%
                            </span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.slug}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative bg-white dark:bg-gray-900 rounded-3xl border-2 ${plan.border} shadow-xl flex flex-col overflow-hidden
                                ${plan.popular ? 'ring-2 ring-action-blue ring-offset-4 ring-offset-bg-light dark:ring-offset-gray-950 scale-105 lg:scale-105 my-2 lg:my-0 z-10' : ''}`}
                        >
                            {/* Popular Badge */}
                            {plan.badge && (
                                <div className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-bold`}>
                                    ⭐ {plan.badge}
                                </div>
                            )}

                            {plan.slug === currentPlanSlug && (
                                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                                    باقتك الحالية
                                </div>
                            )}

                            <div className="p-6 flex flex-col flex-1">
                                {/* Plan name */}
                                <h3 className="text-2xl font-black text-primary-charcoal dark:text-white mb-1">{plan.name}</h3>
                                <p className="text-text-muted text-sm mb-6">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    {plan.custom ? (
                                        <div>
                                            <span className="text-4xl font-black text-primary-charcoal dark:text-white">مخصص</span>
                                            <p className="text-text-muted text-sm mt-1">يبدأ من $199/شهر</p>
                                        </div>
                                    ) : plan.monthlyPrice === 0 ? (
                                        <div>
                                            <span className="text-5xl font-black text-primary-charcoal dark:text-white">مجاناً</span>
                                            <p className="text-text-muted text-sm mt-1">للأبد</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-end gap-1">
                                                <span className="text-5xl font-black text-primary-charcoal dark:text-white">
                                                    ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                                                </span>
                                                <span className="text-text-muted mb-2">/شهر</span>
                                            </div>
                                            {isYearly && (
                                                <p className="text-green-600 text-sm font-semibold">
                                                    ${plan.yearlyPrice} سنوياً — وفّر ${plan.monthlyPrice * 12 - plan.yearlyPrice}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Key Stats */}
                                <div className="space-y-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">عمولة المنصة</span>
                                        <span className={`font-bold ${plan.commission === '0%' ? 'text-green-600' : 'text-primary-charcoal dark:text-white'}`}>
                                            {plan.commission}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">المنتجات</span>
                                        <span className="font-bold text-primary-charcoal dark:text-white">{plan.maxProducts}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">التخزين</span>
                                        <span className="font-bold text-primary-charcoal dark:text-white">{plan.storage}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">الطلاب</span>
                                        <span className="font-bold text-primary-charcoal dark:text-white">{plan.students}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 mb-8 flex-1">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-primary-charcoal dark:text-gray-300">
                                            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                    {plan.notIncluded.map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                                            <span className="flex-shrink-0">✗</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => plan.slug !== 'enterprise' ? handleUpgrade(plan.slug) : window.open('/contact', '_blank')}
                                    className={`w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${plan.slug === currentPlanSlug ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-none' : plan.btnClass}`}
                                    disabled={plan.slug === currentPlanSlug || upgrading === plan.slug}
                                >
                                    {upgrading === plan.slug ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            جاري المعالجة...
                                        </span>
                                    ) : plan.slug === currentPlanSlug ? 'باقتك الحالية ✓' : plan.cta}
                                </button>

                                {plan.slug !== 'free' && plan.slug !== 'enterprise' && plan.slug !== currentPlanSlug && (
                                    <p className="text-center text-xs text-text-muted mt-3">
                                        تجريبي مجاني 14 يوم • لا حاجة لبطاقة
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Launch Offer Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 relative overflow-hidden bg-gradient-to-r from-action-blue to-purple-600 rounded-3xl p-8 text-white text-center"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
                    <div className="relative">
                        <div className="text-4xl mb-3">🎉</div>
                        <h3 className="text-2xl font-black mb-2">عرض الإطلاق الحصري</h3>
                        <p className="text-white/80 mb-4 max-w-xl mx-auto">
                            خصم <strong>50%</strong> لأول 3 أشهر لأول <strong>500 بائع</strong> يسجلون في الباقات المدفوعة.
                            المتبقي:
                            <span className="bg-white/20 px-3 py-1 rounded-full mx-2 font-bold">۴۸۳ مقعد</span>
                        </p>
                        <button
                            className="inline-block bg-white text-action-blue font-black px-8 py-3.5 rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-0.5 text-lg"
                        >
                            قم بالترقية الآن ←
                        </button>
                    </div>
                </motion.div>

                {/* Referral Program */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center"
                >
                    <div className="text-4xl mb-3">🤝</div>
                    <h3 className="text-2xl font-black text-primary-charcoal dark:text-white mb-2">
                        برنامج الإحالة — اكسب معنا
                    </h3>
                    <p className="text-text-muted mb-4 max-w-lg mx-auto">
                        شارك رابطك مع أصدقائك واكسب <strong className="text-action-blue">20% عمولة متكررة</strong> شهرياً عن كل بائع جديد يشترك في باقة مدفوعة.
                    </p>
                    <Link href="/dashboard/affiliate" className="btn btn-primary px-8 py-3">
                        اذهب إلى التسويق بالعمولة
                    </Link>
                </motion.div>

                {/* Comparison Table Toggle */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="text-action-blue font-bold underline underline-offset-4 text-sm hover:opacity-80 transition-opacity"
                    >
                        {showComparison ? '▲ إخفاء' : '▼ إظهار'} مقارنة تفصيلية بين الباقات
                    </button>
                </div>

                {/* Comparison Table */}
                {showComparison && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="text-right p-4 font-bold text-primary-charcoal dark:text-white w-40">الميزة</th>
                                    {['انطلاقة', 'رواد', 'تميز', 'مؤسسات'].map(name => (
                                        <th key={name} className="p-4 font-bold text-primary-charcoal dark:text-white text-center">{name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures.map((row, i) => (
                                    <tr key={i} className={`border-b border-gray-50 dark:border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}>
                                        <td className="p-4 font-medium text-primary-charcoal dark:text-gray-300">{row.feature}</td>
                                        {[row.free, row.starter, row.pro, row.enterprise].map((val, j) => (
                                            <td key={j} className="p-4 text-center">
                                                <span className={val === '❌' ? 'text-gray-300' : val === '✅' ? 'text-green-500 text-lg' : 'font-bold text-primary-charcoal dark:text-white'}>
                                                    {val}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* FAQ */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-center text-primary-charcoal dark:text-white mb-10">
                        أسئلة شائعة
                    </h2>
                    {[
                        { q: 'هل أحتاج بطاقة ائتمان للبدء؟', a: 'لا! يمكنك البدء مجاناً بدون بطاقة. للباقات المدفوعة، لديك 14 يوماً تجريبياً قبل أي رسوم.' },
                        { q: 'ما الفرق بين العمولة في الباقات؟', a: 'العمولة هي النسبة التي تأخذها المنصة من كل عملية بيع. مثلاً: إذا بعت منتجاً بـ 100$، في الباقة المجانية يصلك 90$، وفي تميز يصلك 98$.' },
                        { q: 'هل يمكنني الترقية أو التخفيض في أي وقت؟', a: 'نعم، يمكنك تغيير باقتك في أي وقت. عند الترقية تدفع الفرق، وعند التخفيض يستمر اشتراكك حتى نهاية الدورة.' },
                        { q: 'ما العملات المدعومة للدفع؟', a: 'ندعم USD, SAR, EGP, SYP وغيرها من العملات المحلية العربية.' },
                        { q: 'كيف يعمل برنامج الإحالة؟', a: 'احصل على رابط فريد وشاركه. ستحصل على 20% عمولة متكررة شهرياً من كل شخص يشترك في باقة مدفوعة عبر رابطك.' },
                    ].map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-gray-100 dark:border-gray-800 py-6"
                        >
                            <h4 className="font-bold text-primary-charcoal dark:text-white mb-2">{faq.q}</h4>
                            <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
