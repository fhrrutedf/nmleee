'use client';

import { FiUsers, FiShoppingCart, FiTrendingUp, FiAward, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function AboutPage() {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <div className="min-h-screen bg-bg-light overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-charcoal to-gray-900 text-white py-32 overflow-hidden items-center flex">
                {/* Decorative Background */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-96 h-96 bg-action-blue/20 rounded-full mix-blend-screen filter blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], x: [0, -100, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px]"
                />

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10 w-full">
                    <motion.div style={{ y: yHero, opacity: opacityHero }}>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                            className="text-5xl md:text-7xl font-bold mb-6 font-heading"
                        >
                            عن <span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-400">منصتنا</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300 font-medium"
                        >
                            منصة عربية رائدة لبيع المنتجات الرقمية والدورات التدريبية، نساعد المبدعين على تحقيق دخلهم من مهاراتهم باحترافية وسهولة.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { icon: <FiUsers className="text-3xl text-action-blue" />, value: "10,000+", label: "مستخدم نشط", border: "border-blue-100", bg: "bg-blue-50" },
                            { icon: <FiShoppingCart className="text-3xl text-green-500" />, value: "50,000+", label: "عملية بيع", border: "border-green-100", bg: "bg-green-50" },
                            { icon: <FiTrendingUp className="text-3xl text-purple-500" />, value: "5,000+", label: "منتج رقمي", border: "border-purple-100", bg: "bg-purple-50" },
                            { icon: <FiAward className="text-3xl text-orange-500" />, value: "98%", label: "رضا العملاء", border: "border-orange-100", bg: "bg-orange-50" }
                        ].map((stat, idx) => (
                            <motion.div key={idx} variants={scaleIn} whileHover={{ y: -10 }} className="text-center group p-6 rounded-3xl border border-gray-50 hover:shadow-xl hover:border-gray-100 transition-all duration-300">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`w-20 h-20 ${stat.bg} ${stat.border} border-2 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors`}
                                >
                                    {stat.icon}
                                </motion.div>
                                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                                <p className="text-text-muted font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={staggerContainer}
                        >
                            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-8 font-heading text-primary-charcoal">
                                رسالتنا <span className="text-action-blue">و رؤيتنا</span>
                            </motion.h2>
                            <motion.p variants={fadeInUp} className="text-lg text-text-muted mb-6 leading-relaxed">
                                نؤمن بأن كل شخص لديه موهبة فريدة يمكن أن تحدث فرقاً. منصتنا توفر البيئة المثالية للمبدعين العرب لتحويل مهاراتهم ومعرفتهم إلى منتجات رقمية وخدمات قيّمة تصل إلى الملايين.
                            </motion.p>
                            <motion.p variants={fadeInUp} className="text-lg text-text-muted leading-relaxed mb-8">
                                من خلال توفير أدوات احترافية وبنية تحتية آمنة، نمكّن المبدعين من التركيز على ما يجيدونه (صناعة المحتوى) بينما نتولى نحن كافة الجوانب التقنية والإدارية والمالية.
                            </motion.p>
                            <motion.div variants={fadeInUp}>
                                <ul className="space-y-4">
                                    {['تمكين صناع القرار', 'توسيع نطاق المعرفة', 'تسهيل التجارة الرقمية'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-primary-charcoal font-medium">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-action-blue">
                                                <FiCheckCircle />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            {/* Decorative Frame */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-action-blue/30 to-purple-500/30 rounded-3xl blur-2xl -z-10"></div>

                            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.5 }}
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                                    alt="فريق العمل"
                                    className="w-full h-[500px] object-cover"
                                />
                            </div>

                            {/* Floating Badge on Image */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 hidden md:flex"
                            >
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 font-medium">تأسست عام</div>
                                    <div className="text-2xl font-bold text-action-blue">2024</div>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-action-blue rounded-full flex items-center justify-center">
                                    <FiAward className="text-2xl" />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-primary-charcoal mb-6 font-heading">لماذا تختار <span className="text-action-blue">منصتنا؟</span></h2>
                        <p className="text-xl text-text-muted">صممت بعناية لتكون الشريك المثالي لنجاحك الرقمي</p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            { title: 'سهولة الاستخدام', desc: 'واجهة بسيطة وسهلة لإدارة منتجاتك ومبيعاتك وبناء فروع متجرك كالمحترفين.', color: 'blue' },
                            { title: 'أمان عالي', desc: 'نظام دفع آمن ومشفر لحماية معاملاتك وبياناتك وبيانات عملائك.', color: 'green' },
                            { title: 'دعم فني جاهز', desc: 'فريق دعم فني متواجد 24/7 لمساعدتك في أي وقت وأي عقبة.', color: 'purple' },
                            { title: 'بدون تكاليف مخفية', desc: 'لا توجد رسوم تأسيس، نخصم نسبة عمولة منخفضة وتنافسية جداً فقط عند البيع.', color: 'orange' },
                            { title: 'تحليلات دقيقة', desc: 'تقارير مفصلة وتحليلات شاملة لمتابعة أداء منتجاتك ومعرفة ما يهم جمهورك.', color: 'indigo' },
                            { title: 'مجتمع نشط', desc: 'تواصل وتفاعل مع آلاف المبدعين والمتعلمين من كافة أرجاء الوطن العربي.', color: 'red' }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                className="p-8 bg-gray-50 border border-transparent hover:border-gray-200 rounded-3xl transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 bg-${feature.color}-100 text-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <FiCheckCircle className="text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-primary-charcoal group-hover:text-action-blue transition-colors">{feature.title}</h3>
                                <p className="text-text-muted font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-primary-charcoal to-gray-900 overflow-hidden relative">
                <motion.div
                    animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"
                />
                <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">هل أنت جاهز للبدء؟</h2>
                        <p className="text-xl mb-10 text-gray-300 font-medium">انضم إلى آلاف المبدعين الذين يحققون دخلهم من مهاراتهم كل يوم</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                            <Link
                                href="/register"
                                className="bg-action-blue text-white shadow-xl shadow-action-blue/30 px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-action-blue transition-colors flex items-center gap-3 group"
                            >
                                ابدأ الآن مجاناً
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
