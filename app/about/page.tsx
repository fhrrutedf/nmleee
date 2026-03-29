'use client';

import { FiUsers, FiShoppingCart, FiTrendingUp, FiAward, FiCheckCircle, FiGlobe, FiRadio } from 'react-icons/fi';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AboutPage() {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    return (
        <div className="min-h-screen bg-white overflow-hidden selection:bg-accent/20">
            {/* Minimalist Corporate Hero */}
            <section className="relative bg-ink text-white py-32 md:py-48 flex items-center overflow-hidden">
                {/* Subtle Refined Accents */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10 w-full">
                    <motion.div style={{ y: yHero, opacity: opacityHero }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-accent"
                        >
                            Our Mission & Vision
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter"
                        >
                            نحن نصنع <span className="text-accent">مستقبل</span> التعليم الرقمي
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-2xl max-w-2xl mx-auto text-gray-400 font-bold leading-relaxed"
                        >
                            تمالين هي البنية التحتية المتكاملة للمبدعين العرب، حيث نجمع بين قوة التكنولوجيا وسهولة التجارة الرقمية لتحويل المعرفة إلى قيمة.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* High-Contrast Stats */}
            <section className="py-32 bg-white relative z-20 -mt-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-12"
                    >
                        {[
                            { value: "10K+", label: "مستخدم نشط", icon: FiUsers },
                            { value: "50K+", label: "عملية بيع آمنة", icon: FiCheckCircle },
                            { value: "5K+", label: "منتج رقمي فريد", icon: FiTrendingUp },
                            { value: "99%", label: "معدل الرضا", icon: FiAward }
                        ].map((stat, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="text-right p-8 bg-gray-50 border border-gray-100 rounded-3xl hover:border-accent/20 transition-all group">
                                <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-ink mb-6 group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                    <stat.icon className="text-xl" />
                                </div>
                                <h3 className="text-4xl font-black text-ink font-inter tracking-tighter mb-2">{stat.value}</h3>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Strategic Mission Content */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-ink mb-10 tracking-tight">الرؤية <span className="text-accent">الاستراتيجية</span></h2>
                            <p className="text-lg text-gray-500 font-bold leading-relaxed mb-8">
                                في تمالين، لا نكتفي بكوننا منصة بيع، بل نحن "مسرع نمو" للمبدع العربي. رسالتنا هي القضاء على التعقيدات التقنية وتمكينك من التركيز عما تبدعه فقط.
                            </p>
                            <div className="space-y-6 mb-12">
                                {[
                                    { t: 'تمكين المبدعين', d: 'توفير أدوات قوية لبيع الكتب، الدورات، والخدمات الاستشارية.' },
                                    { t: 'بنية مالية آمنة', d: 'تسهيل استقبال المدفوعات من كافة أرجاء الوطن العربي والعالم.' },
                                    { t: 'تحليلات ذكية', d: 'مساعدتك في فهم سلوك عملائك وزيادة مبيعاتك عبر البيانات.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                                            <FiCheckCircle size={14} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-ink mb-1">{item.t}</h4>
                                            <p className="text-sm text-gray-400 font-bold">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/register" className="inline-flex py-4 px-10 bg-ink text-white rounded-2xl font-bold hover:bg-black transition-all shadow-sm shadow-ink/10">
                                ابدأ رحلتك معنا اليوم
                            </Link>
                        </motion.div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-accent/5 rounded-[3rem] blur-2xl group-hover:bg-accent/10 transition-all"></div>
                            <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80"
                                    alt="Tmleen Team"
                                    className="w-full h-[600px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            {/* Professional Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5 }}
                                className="absolute -bottom-8 -right-8 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm z-20 hidden md:block"
                            >
                                <div className="text-ink font-black text-4xl font-inter tracking-tighter">2024</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Founding Year</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Corporate Features List */}
            <section className="py-32 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-ink tracking-tight mb-4">الركائز <span className="text-accent">التقنية</span></h2>
                        <p className="text-gray-400 text-lg font-bold">لماذا يعتمد علينا كبار المبدعين في المنطقة؟</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'أمان مدعوم بالسحاب', desc: 'بنية تحتية مشفرة بالكامل لحماية منتجاتك الرقمية من القرصنة.', icon: FiRadio },
                            { title: 'دعم فني استباقي', desc: 'فريقنا متواجد ليضمن استقرار متجرك على مدار الساعة.', icon: FiGlobe },
                            { title: 'عمولات تنافسية', desc: 'أفضل نظام عمولات للمحتوى الرقمي، لكي تحقق أقصى ربح ممكن.', icon: FiTrendingUp }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white border border-gray-100 p-10 rounded-3xl hover:border-accent/20 transition-all group shadow-sm">
                                <div className="w-14 h-14 bg-gray-50 text-ink rounded-2xl flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                    <feature.icon className="text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-ink mb-4">{feature.title}</h3>
                                <p className="text-gray-400 font-bold leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA */}
            <section className="py-24 bg-ink relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8">جاهز لتحويل خبرتك لمنتج؟</h2>
                    <p className="text-gray-400 text-xl font-bold mb-12">انضم لمئات المبدعين الذين اختاروا التميز والاستقلالية المالية.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="px-12 py-5 bg-accent text-white rounded-2xl font-bold hover:bg-accent-hover transition-all shadow-sm shadow-accent/20">
                            أنشئ متجرك مجاناً
                        </Link>
                        <Link href="/market" className="px-12 py-5 bg-white/10 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all">
                            استكشف المنصة
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
