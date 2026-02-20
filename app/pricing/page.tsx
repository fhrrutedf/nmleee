'use client';

import { FiCheck, FiX, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Premium Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

// 3D Tilt Wrapper for Pricing Cards
const TiltWrapper = ({ children, className, recommended }: { children: React.ReactNode, className?: string, recommended?: boolean }) => {
    const x = useSpring(0, { stiffness: 400, damping: 30 });
    const y = useSpring(0, { stiffness: 400, damping: 30 });

    function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        // Less rotation for non-recommended cards to make the recommended one pop more
        x.set(xPct * (recommended ? 1 : 0.5));
        y.set(yPct * (recommended ? 1 : 0.5));
    }

    const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1200 }}
            onMouseMove={handleMouse}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={`w-full relative ${className}`}
        >
            <div style={{ transform: recommended ? "translateZ(30px)" : "translateZ(10px)" }} className="w-full h-full">
                {children}
            </div>
            {/* Dynamic Shadow based on tilt */}
            <motion.div
                className={`absolute inset-0 rounded-3xl -z-10 ${recommended ? 'bg-action-blue/20 blur-2xl' : 'bg-black/5 blur-xl'}`}
                style={{
                    transform: "translateZ(-20px)",
                    x: useTransform(x, [-0.5, 0.5], [20, -20]),
                    y: useTransform(y, [-0.5, 0.5], [20, -20])
                }}
            />
        </motion.div>
    );
}

export default function PricingPage() {
    const plans = [
        {
            name: 'البداية',
            price: 'مجاناً',
            description: 'مثالية لتجربة المنصة والبدء في بيع أول منتج',
            features: [
                'عدد غير محدود من المنتجات',
                'عمولة منصة 10% فقط',
                'صفحة متجر احترافية',
                'دعم فني عبر البريد الإلكتروني',
                'استلام الأرباح شهرياً'
            ],
            missing: [
                'نطاق خاص (Domain)',
                'إزالة شعار المنصة',
                'تحليلات متقدمة',
                'كوبونات خصم'
            ],
            buttonText: 'ابدأ مجاناً',
            buttonLink: '/register',
            recommended: false
        },
        {
            id: 'pro',
            name: 'المحترف',
            price: 29,
            priceLabel: '$29',
            period: '/ شهرياً',
            description: 'لصناع المحتوى الجادين الذين يريدون تنمية أعمالهم',
            features: [
                'كل مميزات البداية',
                'عمولة منصة 5% فقط',
                'ربط نطاق خاص (Custom Domain)',
                'كوبونات خصم غير محدودة',
                'تحليلات مفصلة للمبيعات والزيارات',
                'دعم فني ذو أولوية'
            ],
            missing: [
                'إزالة شعار المنصة تماماً',
                'مدير حساب خاص'
            ],
            buttonText: 'اشترك الآن',
            recommended: true
        },
        {
            name: 'الشركات',
            price: '$99',
            period: '/ شهرياً',
            description: 'للشركات والمؤسسات التعليمية الكبيرة',
            features: [
                'كل مميزات المحترف',
                '0% عمولة منصة',
                'واجهة بيضاء (White Label)',
                'مدير حساب مخصص',
                'API للربط مع أنظمتك',
                'تصدير بيانات متقدم',
                'دعم فني عبر الهاتف'
            ],
            missing: [],
            buttonText: 'تواصل معنا',
            buttonLink: '/contact',
            recommended: false
        }
    ];

    const { data: session } = useSession();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = async (plan: any) => {
        // إذا لم يكن مسجلاً، نرسله للتسجيل
        if (!session) {
            router.push(`/register?redirect=/pricing`);
            return;
        }

        if (plan.price === 'مجاناً' || !plan.price) {
            toast.success('أنت بالفعل على الخطة المجانية!');
            return;
        }

        if (plan.buttonLink) {
            router.push(plan.buttonLink);
            return;
        }

        setLoadingPlan(plan.id);

        try {
            const res = await fetch('/api/stripe/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    name: plan.name,
                    price: plan.price
                })
            });

            const data = await res.json();

            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'حدث خطأ أثناء إعداد عملية الدفع');
                setLoadingPlan(null);
            }
        } catch (error) {
            toast.error('حدث خطأ في الاتصال بالخادم');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-bg-light py-20 lg:py-32 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-action-blue/5 rounded-full blur-[100px] -z-10"
            ></motion.div>
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10"
            ></motion.div>

            <div className="container-custom relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block py-1.5 px-4 rounded-full bg-blue-100/50 text-action-blue font-bold tracking-wider text-sm mb-6 border border-blue-200"
                    >
                        استثمارك الرابح
                    </motion.span>
                    <h1 className="text-5xl lg:text-6xl font-bold text-primary-charcoal mb-6 font-heading leading-tight">
                        خطط أسعار <span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-600">تناسب الجميع</span>
                    </h1>
                    <p className="text-xl text-text-muted font-medium">
                        ابدأ مجاناً، ولا تدفع إلا عندما تنجح. لا توجد رسوم خفية أو مفاجآت.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col lg:flex-row justify-center items-center lg:items-stretch gap-8 max-w-7xl mx-auto"
                >
                    {plans.map((plan, idx) => (
                        <TiltWrapper key={idx} recommended={plan.recommended} className={`${plan.recommended ? 'lg:w-[38%] z-20' : 'lg:w-[31%] z-10'}`}>
                            <motion.div
                                variants={scaleIn}
                                className={`relative h-full flex flex-col bg-white rounded-3xl overflow-hidden border-2 transition-colors duration-300
                                    ${plan.recommended
                                        ? 'border-action-blue shadow-[0_20px_50px_-12px_rgba(0,82,255,0.2)]'
                                        : 'border-gray-100 hover:border-gray-200 shadow-xl shadow-gray-200/50'
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-0 inset-x-0">
                                        <div className="bg-gradient-to-r from-action-blue to-blue-400 text-white text-center py-2 text-sm font-bold tracking-wider uppercase shadow-md">
                                            🌟 الخيار المفضل للمبدعين
                                        </div>
                                    </div>
                                )}

                                <div className={`p-8 md:p-10 flex-1 flex flex-col ${plan.recommended ? 'pt-14' : ''}`}>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{plan.name}</h3>

                                    <div className="mb-6 flex items-baseline gap-1">
                                        <span className={`font-bold tracking-tight ${plan.price === 'مجاناً' ? 'text-5xl text-green-500' : 'text-5xl text-gray-900'}`}>
                                            {plan.priceLabel || plan.price}
                                        </span>
                                        {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                                    </div>

                                    <p className="text-gray-500 mb-8 font-medium min-h-[48px] leading-relaxed">
                                        {plan.description}
                                    </p>

                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full mt-auto mb-10">
                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={loadingPlan === plan.id}
                                            className={`block w-full py-4 rounded-xl text-center font-bold text-lg transition-all duration-300 relative overflow-hidden group
                                                ${plan.recommended
                                                    ? 'bg-action-blue text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                } ${loadingPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="relative z-10">
                                                {loadingPlan === plan.id ? 'جاري التحضير...' : plan.buttonText}
                                            </span>
                                            {plan.recommended && (
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            )}
                                        </button>
                                    </motion.div>

                                    <div className="space-y-4 flex-1">
                                        <div className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">ماذا تتضمن الباقة؟</div>

                                        {plan.features.map((feature, fIdx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + (fIdx * 0.1) }}
                                                key={fIdx}
                                                className="flex items-start gap-3 text-gray-700"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FiCheck className="text-green-500 text-sm" />
                                                </div>
                                                <span className="font-medium">{feature}</span>
                                            </motion.div>
                                        ))}

                                        {plan.missing.length > 0 && <div className="h-px w-full bg-gray-100 my-4"></div>}

                                        {plan.missing.map((missing, mIdx) => (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.8 }}
                                                key={mIdx}
                                                className="flex items-start gap-3 text-gray-400"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FiX className="text-gray-400 text-sm" />
                                                </div>
                                                <span className="line-through">{missing}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </TiltWrapper>
                    ))}
                </motion.div>

                {/* Animated FAQ Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                    className="mt-32 max-w-4xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="text-center mb-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs mb-4">لديك استفسار؟</span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary-charcoal">الأسئلة الشائعة</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { q: 'هل يمكنني تغيير خطتي لاحقاً؟', a: 'نعم بالتأكيد، يمكنك ترقية أو تخفيض خطتك في أي وقت من لوحة التحكم، وسيتم احتساب الفرق تلقائياً.' },
                            { q: 'كيف يتم تحويل الأرباح لي؟', a: 'نقوم بتحويل الأرباح بشكل دوري (شهري أو أسبوعي حسب الخطة) إلى حسابك البنكي أو محفظتك الإلكترونية المفضلة محلياً ودولياً.' },
                            { q: 'هل أحتاج لبطاقة ائتمان للتسجيل؟', a: 'لا أبداً، يمكنك البدء بالخطة المجانية بالكامل دون الحاجة لإدخال أي بيانات دفع.' },
                            { q: 'هل توجد رسوم مخفية أخرى؟', a: 'الشفافية هي أساسنا. لا توجد أي رسوم وتكاليف غير معلنة. رسوم بوابات الدفع الدولية (مثل Stripe/Paypal) تطبق بشكل منفصل وتعرض لك بوضوح.' }
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                whileHover={{ y: -5, backgroundColor: '#ffffff' }}
                                className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-action-blue flex items-center justify-center flex-shrink-0">
                                        <FiInfo className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-3 text-gray-900 leading-tight">{faq.q}</h3>
                                        <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
