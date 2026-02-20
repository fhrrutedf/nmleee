'use client';

import { FiShoppingBag, FiCreditCard, FiBarChart2, FiGlobe, FiSmartphone, FiShield, FiUsers, FiCpu, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// Premium Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const iconReveal = {
    hidden: { opacity: 0, scale: 0.5, rotate: -45 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }
};

export default function FeaturesPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const features = [
        {
            icon: <FiShoppingBag className="text-4xl text-blue-600 group-hover:text-white transition-colors duration-300" />,
            title: 'متجر إلكتروني متكامل',
            description: 'احصل على متجر خاص بك بهوية علامتك التجارية، مع صفحات منتجات احترافية وسلة تسوق سلسة وتجربة شراء استثنائية.',
            color: 'bg-blue-50',
            hoverColor: 'hover:bg-blue-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiCreditCard className="text-4xl text-green-600 group-hover:text-white transition-colors duration-300" />,
            title: 'بوابات دفع عالمية ومحلية',
            description: 'اقبل المدفوعات عبر Visa, MasterCard, PayPal, وعملات رقمية، بالإضافة إلى المحافظ المحلية بكل أمان وموثوقية.',
            color: 'bg-green-50',
            hoverColor: 'hover:bg-green-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiBarChart2 className="text-4xl text-purple-600 group-hover:text-white transition-colors duration-300" />,
            title: 'لوحة تحكم وتحليلات ذكية',
            description: 'تابع مبيعاتك، زوارك، وأداء منتجاتك من خلال لوحة تحكم سهلة الاستخدام وتقارير مفصلة مبنية على تقنيات ذكية.',
            color: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiGlobe className="text-4xl text-orange-600 group-hover:text-white transition-colors duration-300" />,
            title: 'دعم متعدد اللغات والعملات',
            description: 'بع منتجاتك للعالم أجمع مع دعم كامل للغات المتعددة والعملات المختلفة، وتوطين كامل لتجربة المستخدم.',
            color: 'bg-orange-50',
            hoverColor: 'hover:bg-orange-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiSmartphone className="text-4xl text-indigo-600 group-hover:text-white transition-colors duration-300" />,
            title: 'متوافق مع الجوال 100%',
            description: 'تجربة مستخدم ممتازة على جميع الأجهزة، مما يضمن سهولة تصفح متجرك والشراء من قِبل عملائك عبر هواتفهم.',
            color: 'bg-indigo-50',
            hoverColor: 'hover:bg-indigo-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiShield className="text-4xl text-rose-600 group-hover:text-white transition-colors duration-300" />,
            title: 'حماية وتشفير عالي المستوى',
            description: 'نظام حماية متقدم لمنتجاتك الرقمية يمنع التحميل غير المصرح به ويحمي حقوقك الفكرية بشكل كامل.',
            color: 'bg-rose-50',
            hoverColor: 'hover:bg-rose-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiUsers className="text-4xl text-teal-600 group-hover:text-white transition-colors duration-300" />,
            title: 'نظام المسوقين (Affiliate)',
            description: 'دع الآخرين يسوقون لمنتجاتك مقابل عمولة تحددها أنت، وضاعف مبيعاتك ووسع قاعدة عملائك بسهولة.',
            color: 'bg-teal-50',
            hoverColor: 'hover:bg-teal-600',
            iconBg: 'bg-white'
        },
        {
            icon: <FiCpu className="text-4xl text-pink-600 group-hover:text-white transition-colors duration-300" />,
            title: 'أتمتة المهام المعقدة',
            description: 'أرسل المنتجات تلقائياً بعد الدفع، واربط متجرك مع تطبيقات خارجية عبر Zapier لتوفر وقتك وجهدك.',
            color: 'bg-pink-50',
            hoverColor: 'hover:bg-pink-600',
            iconBg: 'bg-white'
        }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-bg-light overflow-hidden">
            {/* Hero Parallax Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-charcoal">
                <motion.div style={{ y: yParallax, opacity: opacityFade }} className="absolute inset-0 z-0">
                    {/* Abstract Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    {/* Glowing Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-action-blue/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px]"></div>
                </motion.div>

                <div className="container-custom relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    >
                        <span className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium tracking-widest text-sm mb-8">
                            قوة لا محدودة
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading leading-tight">
                            مميزات تفوق <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">التوقعات</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
                            كل ما تحتاجه لنجاح مشروعك الرقمي في منصة واحدة قوية، مرنة، وسهلة الاستخدام.
                        </p>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 mt-20"
                    >
                        <div className="w-[30px] h-[50px] rounded-full border-2 border-white/30 flex justify-center p-2">
                            <motion.div
                                animate={{ y: [0, 15, 0], opacity: [1, 0, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Interacting Grid */}
            <section className="py-32 relative z-20 bg-white -mt-10 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
                <div className="container-custom">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className={`group relative p-8 rounded-3xl transition-all duration-500 overflow-hidden isolate ${feature.color} ${feature.hoverColor} hover:-translate-y-2 hover:shadow-2xl cursor-default border border-transparent hover:border-black/5`}
                            >
                                {/* Expanding Circle Background on Hover */}
                                <div className="absolute inset-x-0 -bottom-full group-hover:bottom-0 top-full group-hover:top-0 bg-black/5 transition-all duration-500 ease-out -z-10 rounded-full scale-150 group-hover:scale-100 opacity-0 group-hover:opacity-100"></div>

                                <motion.div variants={iconReveal} className={`mb-8 p-5 ${feature.iconBg} rounded-2xl shadow-sm inline-block group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/20 backdrop-blur-sm group-hover:shadow-none`}>
                                    {feature.icon}
                                </motion.div>

                                <h3 className="text-2xl font-bold mb-4 text-primary-charcoal group-hover:text-white transition-colors duration-300">{feature.title}</h3>

                                <p className="text-text-muted leading-relaxed font-medium group-hover:text-white/80 transition-colors duration-300">
                                    {feature.description}
                                </p>

                                <div className="mt-8 flex items-center gap-2 text-action-blue font-bold opacity-0 group-hover:opacity-100 group-hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <span>اكتشف المزيد</span>
                                    <FiArrowLeft className="group-hover:-translate-x-2 transition-transform duration-300" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Scrolling Integration Section */}
            <section className="py-32 bg-primary-charcoal text-white overflow-hidden relative">
                <div className="container-custom text-center relative z-10 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">يتكامل بسلاسة مع أدواتك</h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            لا داعي لتغيير طريقة عملك. منصتنا تتكامل بانسيابية مع عشرات التطبيقات التي تعتمد عليها يومياً لتحقيق أقصى إنتاجية.
                        </p>
                    </motion.div>
                </div>

                {/* Infinite Marquee of Logos */}
                <div className="relative flex overflow-x-hidden">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-primary-charcoal to-transparent z-10"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-primary-charcoal to-transparent z-10"></div>

                    <motion.div
                        animate={{ x: [0, -2000] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                        className="flex gap-8 px-4 whitespace-nowrap"
                    >
                        {/* Duplicate lists for seamless loop */}
                        {[1, 2, 3].map((set) => (
                            <div key={set} className="flex gap-8 items-center">
                                {['Google Analytics', 'Zoom', 'Stripe', 'PayPal', 'Mailchimp', 'Zapier', 'Slack', 'Meta Pixel', 'TikTok Ads'].map((logo, idx) => (
                                    <div key={idx} className="text-2xl md:text-3xl font-bold border border-white/10 bg-white/5 backdrop-blur-sm px-10 py-5 rounded-2xl hover:bg-action-blue hover:text-white hover:border-action-blue hover:scale-105 transition-all duration-300 cursor-pointer">
                                        {logo}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Premium CTA */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="container-custom relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-action-blue to-purple-600 rounded-[3rem] p-12 md:p-20 shadow-[0_30px_60px_-15px_rgba(0,82,255,0.4)]"
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white font-heading">مستعد للبدء بقوة؟</h2>
                        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light">
                            انضم إلينا اليوم مجاناً، وابدأ في بناء إمبراطوريتك الرقمية مع أفضل الأدوات المتاحة في السوق.
                        </p>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                            <Link href="/register" className="bg-white text-action-blue font-bold text-xl px-12 py-5 rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-50 flex items-center gap-3 transition-all">
                                أنشئ حسابك المجاني الآن
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
