'use client';

import { FiShoppingBag, FiCreditCard, FiBarChart2, FiGlobe, FiSmartphone, FiShield, FiUsers, FiCpu, FiArrowLeft, FiLayers, FiActivity, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Refined Professional Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

export default function FeaturesPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    const features = [
        {
            icon: <FiShoppingBag size={28} />,
            title: 'متجر إلكتروني متكامل',
            description: 'احصل على متجر خاص بك بهوية علامتك التجارية، مع صفحات منتجات احترافية وسلة تسوق سلسة وتجربة شراء استثنائية.',
        },
        {
            icon: <FiCreditCard size={28} />,
            title: 'بوابات دفع عالمية ومحلية',
            description: 'اقبل المدفوعات عبر Visa, MasterCard, PayPal, وعملات رقمية، بالإضافة إلى المحافظ المحلية بكل أمان وموثوقية.',
        },
        {
            icon: <FiBarChart2 size={28} />,
            title: 'لوحة تحكم وتحليلات ذكية',
            description: 'تابع مبيعاتك، زوارك، وأداء منتجاتك من خلال لوحة تحكم سهلة الاستخدام وتقارير مفصلة مبنية على تقنيات ذكية.',
        },
        {
            icon: <FiGlobe size={28} />,
            title: 'دعم متعدد اللغات والعملات',
            description: 'بع منتجاتك للعالم أجمع مع دعم كامل للغات المتعددة والعملات المختلفة، وتوطين كامل لتجربة المستخدم.',
        },
        {
            icon: <FiSmartphone size={28} />,
            title: 'توافق كامل مع الجوال',
            description: 'تجربة مستخدم ممتازة على جميع الأجهزة، مما يضمن سهولة تصفح متجرك والشراء من قِبل عملائك عبر هواتفهم.',
        },
        {
            icon: <FiShield size={28} />,
            title: 'حماية وتشفير متقدم',
            description: 'نظام حماية متطور لمنتجاتك الرقمية يمنع التحميل غير المصرح به ويحمي حقوقك الفكرية بشكل كامل.',
        },
        {
            icon: <FiUsers size={28} />,
            title: 'نظام المسوقين بالعمولة',
            description: 'دع الآخرين يسوقون لمنتجاتك مقابل عمولة تحددها أنت، وضاعف مبيعاتك ووسع قاعدة عملائك بسهولة.',
        },
        {
            icon: <FiLayers size={28} />,
            title: 'بناء أكاديميات تعليمية',
            description: 'أدوات متطورة لبناء دوراتك التدريبية، توزيع الدروس، إدارة الطلاب، وإعطاء الشهادات التلقائية.',
        }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-white overflow-hidden selection:bg-emerald-600/20">
            {/* High-Performance Corporate Hero */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-white py-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-600/5 rounded-xl blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-emerald-600 shadow-sm">
                            Infrastructure for Creators
                        </div>
                        <h1 className="text-5xl md:text-8xl font-bold text-ink mb-10 tracking-tighter leading-[1.05]">
                            بنية تحتية <br/> <span className="text-emerald-600 underline underline-offset-[12px] decoration-accent/10">بلا حدود</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-bold leading-relaxed">
                            لقد قمنا ببناء كافة الأدوات المعقدة لكي تتمكن أنت من التركيز على صناعة المحتوى والبيع بكل سهولة.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Clean Grid */}
            <section className="py-24 md:py-40 relative z-20 bg-white -mt-16 rounded-t-[3rem] border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className="group p-10 bg-gray-50 border border-gray-100 rounded-[2.5rem] hover:bg-ink hover:text-white transition-all duration-500 cursor-default"
                            >
                                <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-ink mb-10 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                                    {feature.icon}
                                </div>

                                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                    {feature.description}
                                </p>
                                
                                <div className="mt-10 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-emerald-600 group-hover:text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                    <span>Learn more</span>
                                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Core Statistics / Trust Section */}
            <section className="py-24 bg-white border-y border-gray-50 flex overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 w-full">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-ink tracking-tighter mb-4">أداء لا يتوقف.</h2>
                            <p className="text-gray-400 font-bold">بنية تحتية موزعة عالمياً تضمن استجابة متجرك في أقل من 200ms.</p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-8">
                             <div className="p-8 border-l border-gray-100">
                                <div className="text-6xl font-bold text-ink font-inter tracking-tighter mb-2">99.9%</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Uptime Guarantee</div>
                             </div>
                             <div className="p-8 border-l border-gray-100">
                                <div className="text-6xl font-bold text-emerald-600 font-inter tracking-tighter mb-2">24/7</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Monitoring</div>
                             </div>
                        </div>
                   </div>
                </div>
            </section>

            {/* Strategic Integration Section */}
            <section className="py-32 bg-ink text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">يتكامل مع نظامك الحالي</h2>
                    <p className="text-gray-400 text-lg font-bold max-w-2xl mx-auto">
                        اربط تمالين مع عشرات الأدوات التي تحبها، من أنظمة الأتمتة إلى تحليلات قوقل المتقدمة.
                    </p>
                </div>

                <div className="relative flex overflow-x-hidden opacity-30">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                        className="flex gap-12 whitespace-nowrap"
                    >
                        {[1, 2].map((set) => (
                            <div key={set} className="flex gap-12 items-center">
                                {['Stripe', 'PayPal', 'Mailchimp', 'Zapier', 'Slack', 'Analytics', 'Binance', 'Zoom', 'Discord'].map((item, idx) => (
                                    <div key={idx} className="text-4xl font-bold font-inter tracking-tighter text-white border-2 border-white/5 px-12 py-6 rounded-xl hover:bg-white hover:text-ink transition-all cursor-default">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* High-End Refined CTA */}
            <section className="py-40 bg-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                   <div className="bg-ink rounded-[3.5rem] p-16 md:p-32 border border-white/5 relative overflow-hidden group shadow-sm shadow-ink/20">
                        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-600/10 rounded-xl blur-[120px]"></div>
                        <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-12 relative z-10 leading-[0.95]">
                            ابدأ ببناء <br/> <span className="text-emerald-600">إمبراطوريتك.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link href="/register" className="px-14 py-6 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-ink transition-all shadow-sm shadow-accent/20">
                                Start Your Mission Now
                            </Link>
                            <Link href="/pricing" className="px-14 py-6 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-ink transition-all">
                                View Pricing Plans
                            </Link>
                        </div>
                   </div>
                </div>
            </section>
        </div>
    );
}
