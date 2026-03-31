'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiArrowLeft, FiShield, FiStar, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  planType: string;
}

// Default plans fallback
const defaultPlans = [
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
        border: 'border-white/10',
        btnClass: 'bg-emerald-800 text-[#10B981] hover:bg-gray-200',
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
        border: 'border-emerald-600/40',
        btnClass: 'bg-emerald-700 text-white hover:bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-accent/20',
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
        btnClass: 'bg-emerald-700 text-white hover:bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-ink/10',
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
        border: 'border-white/10',
        btnClass: 'bg-[#0A0A0A] text-[#10B981] border border-emerald-500/20 hover:border-ink',
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
    const [dbPlans, setDbPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch plans from database
        fetch('/api/plans/public')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setDbPlans(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Convert DB plans to display format or use default
    const displayPlans = dbPlans.length > 0 
        ? dbPlans.map((plan, index) => ({
            slug: plan.planType?.toLowerCase() || `plan-${index}`,
            name: plan.name,
            badge: index === 0 ? 'بداية آمنة' : index === 1 ? 'الأكثر ربحية' : 'احترافي',
            description: plan.description,
            monthlyPrice: plan.price,
            yearlyPrice: Math.round(plan.price * 12 * 0.8), // 20% discount for yearly
            commission: plan.planType === 'FREE' ? '10%' : plan.planType === 'PRO' ? '5%' : plan.planType === 'AGENCY' ? '0%' : '5%',
            maxProducts: plan.planType === 'FREE' ? '5 منتجات' : plan.planType === 'GROWTH' ? '50 منتج' : 'غير محدود',
            storage: plan.planType === 'FREE' ? '1 جيجابايت' : plan.planType === 'GROWTH' ? '15 جيجابايت' : '100 جيجابايت',
            students: plan.planType === 'FREE' ? '100 طالب' : plan.planType === 'GROWTH' ? '1000 طالب' : 'غير محدود',
            border: index === 1 ? 'border-emerald-600/40' : 'border-white/10',
            btnClass: index === 1 
                ? 'bg-emerald-700 text-white hover:bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20' 
                : 'bg-emerald-800 text-[#10B981] hover:bg-gray-200',
            popular: index === 1,
            features: plan.features || [],
            notIncluded: plan.planType === 'FREE' ? ['إزالة شعار تمالين', 'نظام المسوقين'] : [],
            cta: plan.price === 0 ? 'ابدأ مجاناً' : 'اشترك الآن',
            href: plan.price === 0 ? '/register' : `/register?plan=${plan.planType?.toLowerCase()}`,
            custom: false,
        }))
        : defaultPlans;

    return (
        <div className="min-h-screen bg-[#0A0A0A] selection:bg-emerald-500 text-white/20" dir="rtl">
            {/* Minimalist Professional Header */}
            <section className="relative py-32 md:py-48 bg-[#0A0A0A] text-white overflow-hidden border-b border-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500 text-white/5 blur-[120px] rounded-full"></div>
                
                <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 bg-emerald-900/40 border border-emerald-500/20 text-[#10B981] px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-12 shadow-2xl"
                    >
                        <FiZap size={14} className="animate-pulse" /> خطط مالية مصممة لزيادة المبيعات
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-black mb-10 tracking-tighter leading-[0.85]"
                    >
                        أرباحك <span className="text-[#10B981]">كاملة</span> لك
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-2xl text-gray-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        لماذا تدفع عمولة 20% للمنصات الأخرى؟ مع تمالين ابدأ بـ <span className="text-white border-b-2 border-emerald-500/50 pb-1">5% فقط</span> واحتفظ بجهدك وعرقك لنفسك.
                    </motion.p>

                    {/* Pro Toggle */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 p-2 bg-emerald-900/40 border border-emerald-500/20 rounded-2xl w-fit backdrop-blur-md">
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${!isYearly ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 shadow-glow' : 'text-gray-500 hover:text-white'}`}
                            >
                                monthly
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-12 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative ${isYearly ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 shadow-glow' : 'text-gray-500 hover:text-white'}`}
                            >
                                yearly
                                <span className="absolute -top-4 -left-4 bg-emerald-500 text-white text-black text-[9px] px-3 py-1.2 rounded-lg font-black uppercase tracking-widest shadow-xl">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategy Comparison Section */}
            <section className="py-24 bg-[#0A0A0A] border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="bg-[#111] p-10 rounded-3xl border border-white/5 shadow-2xl opacity-60">
                             <div className="flex items-center gap-3 text-red-500/70 font-bold text-[10px] uppercase tracking-widest mb-8">
                                <FiX className="text-lg" /> المنصات التقليدية
                             </div>
                             <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>عمولة البيع:</span> <span className="line-through tracking-wider">25% - 15%</span></div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>تحصيل الأموال:</span> <span className="line-through">بعد 30 يوم</span></div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-400 italic"><span>البيانات:</span> <span className="line-through">مخفية عنك</span></div>
                             </div>
                        </div>
                        <div className="bg-[#161616] p-10 rounded-3xl border border-emerald-500/20 shadow-glow transform md:scale-110 relative z-10">
                             <div className="flex items-center gap-3 text-[#10B981] font-bold text-[10px] uppercase tracking-widest mb-8">
                                <FiCheckCircle className="text-lg" /> بيئة تمالين الاستثمارية
                             </div>
                             <div className="space-y-5 text-white">
                                <div className="flex justify-between items-center text-sm font-bold"><span>عمولة البيع:</span> <span className="text-[#10B981] text-xl tracking-widest font-black">5% ONLY</span></div>
                                <div className="flex justify-between items-center text-sm font-bold"><span>تحصيل الأموال:</span> <span className="text-[#10B981] tracking-tighter uppercase font-black">Instant Payouts</span></div>
                                <div className="flex justify-between items-center text-sm font-bold"><span>البيانات:</span> <span className="text-[#10B981] tracking-tighter uppercase font-black">100% Owner Control</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Surface */}
            <section className="max-w-7xl mx-auto px-6 -mt-20 pb-40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayPlans.map((plan, i) => (
                        <motion.div
                            key={plan.slug}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`group relative bg-[#111] rounded-[2.5rem] border ${plan.popular ? 'border-emerald-500/30' : 'border-white/5'} p-12 flex flex-col transition-all duration-500 hover:border-emerald-500/40 hover:shadow-glow 
                                ${plan.popular ? 'lg:scale-[1.08] lg:-translate-y-4 z-20 shadow-glow ring-1 ring-emerald-500/20' : 'shadow-2xl'}`}
                        >
                             <div className="mb-10 h-8">
                                {plan.popular && (
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                                        {plan.badge}
                                    </span>
                                )}
                                {!plan.popular && (
                                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl bg-white/5 text-gray-500 border border-white/5">
                                        {plan.badge}
                                    </span>
                                )}
                             </div>

                            <div className="flex flex-col flex-1">
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">{plan.name}</h3>
                                <p className="text-gray-500 text-[11px] font-bold leading-relaxed mb-12 h-12 uppercase tracking-tight">{plan.description}</p>

                                <div className="mb-12 min-h-[100px] flex flex-col justify-end">
                                    <div className="font-inter text-white">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black text-white tracking-tighter">
                                                ${plan.custom ? 'Custom' : (isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice)}
                                            </span>
                                            {!plan.custom && plan.monthlyPrice > 0 && <span className="text-gray-500 font-bold text-sm">/mo</span>}
                                        </div>
                                        {isYearly && plan.monthlyPrice > 0 && (
                                            <p className="text-[#10B981] text-[10px] font-black uppercase tracking-widest mt-4 bg-emerald-500 text-white/10 py-1.5 px-4 rounded-lg inline-block">
                                                Total ${plan.yearlyPrice} / Year
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12 p-8 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors duration-500">
                                    {[
                                        { l: 'عمولة المبيعات', v: plan.commission, h: true },
                                        { l: 'المنتجات الرقمية', v: plan.maxProducts },
                                        { l: 'تحصيل الأموال', v: 'فوري (Stripe)' }
                                    ].map((s, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-gray-500">{s.l}</span>
                                            <span className={s.h ? 'text-[#10B981]' : 'text-white'}>{s.v}</span>
                                        </div>
                                    ))}
                                </div>

                                <ul className="space-y-5 mb-12 flex-1">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-xs font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                                            <FiCheckCircle className="text-[#10B981] mt-0.5 shrink-0 shadow-glow" size={16} />
                                            <span className="leading-relaxed">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.href}
                                    className={`w-full py-6 rounded-2xl text-center font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-300 transform group-hover:-translate-y-1 shadow-lg ${plan.popular ? 'bg-emerald-700 text-white hover:bg-emerald-500 text-white hover:shadow-glow' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {plan.cta}
                                </Link>
                                
                                {plan.monthlyPrice > 0 && !plan.custom && (
                                    <p className="text-center text-[9px] text-gray-400 font-bold mt-8 uppercase tracking-[0.2em]">
                                        Risk Free • 14 Day Trial
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Institutional Trust Banner */}
            <section className="bg-[#0A0A0A] py-40 text-white relative overflow-hidden border-t border-white/10">
                <div className="absolute inset-0 bg-emerald-500 text-white/5 blur-[150px] -translate-y-1/2"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <div className="w-24 h-24 bg-emerald-700 text-white/10 text-[#10B981] rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-glow border border-emerald-500/20 rotate-3">
                        <FiShield size={48} />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-tight">لماذا يختار المحترفون تمالين؟</h2>
                    <p className="text-gray-400 text-xl font-medium mb-16 leading-relaxed max-w-3xl mx-auto">
                        نحن لسنا مجرد منصة بيع، نحن شريكك الاستراتيجي في النمو. نقوم بمعالجة مدفوعاتك بأمان، وتوصيل منتجاتك لعملائك فوراً، وحماية حقوقك القانونية والمالية.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30">
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


