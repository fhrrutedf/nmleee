'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiArrowLeft, FiShield, FiStar, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const plans = [
    {
        slug: 'free',
        name: 'البداية الحرة',
        badge: 'بداية آمنة',
        description: 'جرب المنصة، ارفع منتجاتك، وابدأ البيع فوراً بدون دفع مليم واحد شهرياً.',
        monthlyPrice: 0,
        yearlyPrice: 0,
        commission: '10%',
        maxProducts: '5 منتجات',
        storage: '1 جيجابايت',
        students: '100 طالب',
        border: 'border-gray-100',
        btnClass: 'bg-gray-100 text-ink hover:bg-gray-200',
        popular: false,
        features: [
            '5 منتجات رقمية نشطة',
            'متجر إلكتروني بهويتك',
            'قبول الدفع أونلاين (Stripe/Card)',
            'لوحة تحكم لإدارة المبيعات',
            'إشعارات البريد الإلكتروني',
            'دعم فني عبر التذاكر',
        ],
        notIncluded: [
            'إزالة شعار تمالين',
            'نظام المسوقين (Affiliates)',
            'إدارة الكوبونات والخصومات',
        ],
        cta: 'ابدأ مجاناً الآن',
        href: '/register',
    },
    {
        slug: 'starter',
        name: 'رواد الأعمال',
        badge: 'الأكثر ربحية للمدربين',
        description: 'الخيار الاستراتيجي لنمو أعمالك البرمجية والتدريبية بعمولة بيع هي الأقل.',
        monthlyPrice: 19,
        yearlyPrice: 180,
        commission: '5%',
        maxProducts: '50 منتج',
        storage: '15 جيجابايت',
        students: '1000 طالب',
        border: 'border-accent/40',
        btnClass: 'bg-accent text-white hover:bg-black shadow-sm shadow-accent/20',
        popular: true,
        features: [
            'أقل عمولة منصة (5% فقط)',
            '50 منتج رقمي/كورس متاح',
            'إزالة شعار المنصة بالكامل',
            'نظام متطور للمسوقين بالعمولة',
            'إدارة الكوبونات والخصومات',
            'تصدير بيانات العملاء والمبيعات',
            'دعم فني سريع عبر WhatsApp',
            'تجربة مجانية لمدة 14 يوم',
        ],
        notIncluded: [
            'مدير حساب تقني مخصص',
            'أولوية قصوى للدعم الفني',
        ],
        cta: 'اختر باقة النجاح',
        href: '/register?plan=starter',
    },
    {
        slug: 'pro',
        name: 'التميز الاحترافي',
        badge: 'بدون حدود',
        description: 'للمؤثرين والمدربين الكبار الذين يمتلكون آلاف الطلاب ويحتاجون قوة قصوى.',
        monthlyPrice: 49,
        yearlyPrice: 470,
        commission: '2.5%',
        maxProducts: 'غير محدود',
        storage: '100 جيجابايت',
        students: 'غير محدود',
        border: 'border-ink/20',
        btnClass: 'bg-ink text-white hover:bg-black shadow-sm shadow-ink/10',
        popular: false,
        features: [
            'عمولة بيع رمزية (2.5%)',
            'رفع منتجات/دورات بلا حدود',
            '100 جيجابايت مساحة سحابية',
            'عدد طلاب ومتابعين غير محدود',
            'ربط دومين مخصص (Custom Domain)',
            'تكامل مع أدوات التسويق (Webhooks)',
            'مدير حساب تقني مخصص',
            'أولوية استجابة (أقل من ساعتين)',
        ],
        notIncluded: [],
        cta: 'انطلق للاحتراف',
        href: '/register?plan=pro',
    },
    {
        slug: 'enterprise',
        name: 'المؤسسات الكبرى',
        badge: 'حلول سيادية',
        description: 'للكليات والشركات التي تطلب بنية تحتية خاصة وعمولة صفرية تماماً.',
        monthlyPrice: 199,
        yearlyPrice: 1900,
        commission: '0%',
        maxProducts: 'غير محدود',
        storage: '+1 تيرابايت',
        students: 'غير محدود',
        border: 'border-gray-100',
        btnClass: 'bg-white text-ink border border-gray-200 hover:border-ink',
        popular: false,
        features: [
            'بدون أي عمولة بيع (0% Commission)',
            'مساحة تخزين ضخمة ومخصصة',
            'تطبيقات موبايل بهوية خاصة (اختياري)',
            'تكامل API كامل مع أنظمتكم',
            'ضمان استقرار الخدمة (SLA 99.9%)',
            'دعم قانوني وتقني VIP',
            'تدريب شامل للفريق',
            'خطة استراتيجية للنمو',
        ],
        notIncluded: [],
        cta: 'تحدث مع المبيعات',
        href: '/contact',
        custom: true,
    },
];

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="min-h-screen bg-white selection:bg-accent/20" dir="rtl">
            {/* Minimalist Professional Header */}
            <section className="relative py-24 md:py-32 bg-ink text-white overflow-hidden border-b border-white/5">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent/10 rounded-xl blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-accent px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-10 shadow-sm"
                    >
                        <FiZap size={14} /> خطط مالية مصممة لزيادة المبيعات
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-tight"
                    >
                        أرباحك <span className="text-accent underline underline-offset-[12px] decoration-accent/30 decoration-4">كاملة</span> لك
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-bold leading-relaxed"
                    >
                        لماذا تدفع عمولة 20% للمنصات الأخرى؟ مع تمالين ابدأ بـ <span className="text-white underline decoration-accent/50 decoration-2 underline-offset-4">5% فقط</span> واحتفظ بجهدك وعرقك لنفسك.
                    </motion.p>

                    {/* Pro Toggle */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-[1.5rem] w-fit">
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${!isYearly ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative ${isYearly ? 'bg-white text-ink shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                yearly
                                <span className="absolute -top-4 -left-4 bg-accent text-white text-[9px] px-3 py-1 rounded-xl font-bold uppercase tracking-widest shadow-sm ">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategy Comparison Section */}
            <section className="py-20 bg-gray-50/50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm shadow-gray-200/50">
                             <div className="flex items-center gap-3 text-red-500 font-bold text-[10px] uppercase tracking-widest mb-6">
                                <FiX className="text-lg" /> المنصات التقليدية
                             </div>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>عمولة البيع:</span> <span className="line-through tracking-wider">25% - 15%</span></div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>تحصيل الأموال:</span> <span className="line-through">بعد 30 يوم</span></div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>البيانات:</span> <span className="line-through">مخفية عنك</span></div>
                             </div>
                        </div>
                        <div className="bg-ink p-8 rounded-[2rem] border border-accent/20 shadow-sm shadow-accent/10 transform md:scale-110">
                             <div className="flex items-center gap-3 text-accent font-bold text-[10px] uppercase tracking-widest mb-6">
                                <FiCheckCircle className="text-lg" /> بيئة تمالين الاستثمارية
                             </div>
                             <div className="space-y-4 text-white">
                                <div className="flex justify-between items-center text-sm font-bold"><span>عمولة البيع:</span> <span className="text-accent text-lg tracking-widest font-bold">5% ONLY</span></div>
                                <div className="flex justify-between items-center text-sm font-bold"><span>تحصيل الأموال:</span> <span className="text-accent tracking-tighter uppercase">Instant Payouts</span></div>
                                <div className="flex justify-between items-center text-sm font-bold"><span>البيانات:</span> <span className="text-accent tracking-tighter uppercase">100% Owner Control</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Surface */}
            <section className="max-w-7xl mx-auto px-6 -mt-16 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.slug}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative bg-white rounded-[2.5rem] border ${plan.border} p-10 flex flex-col transition-all duration-500 hover:shadow-sm hover:shadow-gray-200/50 
                                ${plan.popular ? 'lg:scale-[1.08] lg:-translate-y-2 z-20 shadow-sm shadow-accent/5 ring-4 ring-accent/5' : 'shadow-sm'}`}
                        >
                             <div className="mb-8 h-8">
                                {plan.popular && (
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-xl bg-accent text-white shadow-sm shadow-accent/20">
                                        {plan.badge}
                                    </span>
                                )}
                                {!plan.popular && (
                                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                                        {plan.badge}
                                    </span>
                                )}
                             </div>

                            <div className="flex flex-col flex-1">
                                <h3 className="text-3xl font-bold text-ink mb-2 tracking-tighter">{plan.name}</h3>
                                <p className="text-gray-400 text-[11px] font-bold leading-relaxed mb-10 h-12 uppercase tracking-tight">{plan.description}</p>

                                <div className="mb-10 min-h-[100px] flex flex-col justify-end">
                                    <div className="font-inter">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-6xl font-bold text-ink tracking-tighter">
                                                ${plan.custom ? 'Custom' : (isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice)}
                                            </span>
                                            {!plan.custom && plan.monthlyPrice > 0 && <span className="text-gray-400 font-bold text-sm">/mo</span>}
                                        </div>
                                        {isYearly && plan.monthlyPrice > 0 && (
                                            <p className="text-accent text-[10px] font-bold uppercase tracking-widest mt-2 bg-accent/5 py-1 px-3 rounded-lg inline-block">
                                                Total ${plan.yearlyPrice} / Year
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 p-6 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white transition-colors duration-500">
                                    {[
                                        { l: 'عمولة المبيعات', v: plan.commission, h: true },
                                        { l: 'المنتجات الرقمية', v: plan.maxProducts },
                                        { l: 'تحصيل الأموال', v: 'فوري (Stripe)' }
                                    ].map((s, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-gray-400">{s.l}</span>
                                            <span className={s.h ? 'text-accent' : 'text-ink'}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-xs font-bold text-gray-500 group-hover:text-ink transition-colors">
                                            <FiCheckCircle className="text-accent mt-0.5 shrink-0" size={16} />
                                            <span className="leading-relaxed">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    className={`w-full py-6 rounded-xl text-center font-bold text-[10px] uppercase tracking-[0.25em] transition-all duration-300 transform group-hover:-translate-y-1 ${plan.btnClass}`}
                                >
                                    {plan.cta}
                                </Link>
                                
                                {plan.monthlyPrice > 0 && !plan.custom && (
                                    <p className="text-center text-[9px] text-gray-400 font-bold mt-6 uppercase tracking-[0.2em]">
                                        Risk Free • 14 Day Trial
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Institutional Trust Banner */}
            <section className="bg-ink py-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="w-24 h-24 bg-accent text-white rounded-xl flex items-center justify-center mx-auto mb-10 shadow-sm shadow-accent/20 rotate-3">
                        <FiShield size={48} />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">لماذا يختار المحترفون تمالين؟</h2>
                    <p className="text-gray-400 text-xl font-bold mb-12 leading-relaxed">
                        نحن لسنا مجرد منصة بيع، نحن شريكك الاستراتيجي في النمو. نقوم بمعالجة مدفوعاتك بأمان، وتوصيل منتجاتك لعملائك فوراً، وحماية حقوقك القانونية والمالية.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 grayscale opacity-50">
                        <div className="text-[10px] font-bold uppercase tracking-widest">Encryption Grade: 256-bit</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">Network Speed: 10Gbps</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">Support Response: 24/7/365</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">Platform Uptime: 99.99%</div>
                    </div>
                </div>
            </section>
        </div>
    );
}

