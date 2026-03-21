'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiCheckCircle, FiArrowLeft, FiTrendingUp, FiLayers, FiShield, FiArrowDown, FiEdit3, FiGlobe } from 'react-icons/fi';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { RevealText } from '@/components/animations/RevealText';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { TiltCard } from '@/components/animations/TiltCard';
import Testimonials from '@/components/sections/Testimonials';

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <Hero />
            
            {/* How It Works Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-primary-indigo-600 font-bold text-sm tracking-widest uppercase bg-indigo-50 px-4 py-2 rounded-full inline-block mb-4"
                        >
                            كيف نبدأ؟
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-slate-900"
                        >
                            حوّل معرفتك لمنتج بضغطة زر
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                        {/* Step 1 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative group flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-primary-indigo-50 text-primary-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-premium">
                                <FiEdit3 />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">أنشئ متجرك</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">خطوات بسيطة وسريعة لتجهيز ملفك الشخصي وربط حسابك البنكي بكل سهولة.</p>
                            
                            {/* Connector Line (Desktop Only) */}
                            <div className="hidden lg:block absolute top-12 left-full w-20 h-0.5 border-t-2 border-dashed border-slate-100 -translate-x-10 -translate-y-4" />
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative group flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-glow">
                                <FiGlobe />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">ارفع ملفاتك</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">ارفع دروسك، كتبك، أو قوالبك على خوادمنا الآمنة والمستقرة والمحمية تماماً.</p>
                            
                            {/* Connector Line (Desktop Only) */}
                            <div className="hidden lg:block absolute top-12 left-full w-20 h-0.5 border-t-2 border-dashed border-slate-100 -translate-x-10 -translate-y-4" />
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative group flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 bg-primary-indigo-50 text-primary-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-premium">
                                <FiTrendingUp />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">ابدأ البيع</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">شارك رابط متجرك مع جمهورك واستقبل الأرباح مباشرة عبر وسائل دفع محلية.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Testimonials />

            {/* Bottom CTA Section */}
            <section className="py-24 container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-primary-indigo-600 rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-glow"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
                    
                    <h2 className="text-4xl lg:text-6xl font-black mb-8 relative z-10">هل أنت مستعد لمشاركة عالمك؟</h2>
                    <p className="text-xl lg:text-2xl text-white/80 font-medium mb-12 max-w-2xl mx-auto relative z-10">
                        انضم إلى آلاف المبدعين الذين حولوا خبراتهم لمنتجات رقمية ناجحة.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 relative z-10">
                        <Link href="/auth/register" className="px-12 py-5 bg-white text-primary-indigo-600 rounded-3xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl shadow-indigo-900/10">
                            سجل حسابك مجاناً
                        </Link>
                        <Link href="/how-it-works" className="px-10 py-5 bg-primary-indigo-700/50 backdrop-blur-md text-white border border-white/10 rounded-3xl font-black text-lg hover:bg-primary-indigo-700/80 transition-all">
                            تحدث مع مستشارنا
                        </Link>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}

function Hero() {
    // Scroll Progress for Parallax
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <main className="min-h-screen bg-bg-light overflow-hidden relative cursor-default">



            {/* Dynamic Hero Section - 2026 Redesign */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden flex items-center bg-[#fcfcfd]">
                
                {/* Advanced Animated Background (Mesh Gradient & Grain) */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            x: [0, 100, 0],
                            y: [0, -50, 0]
                        }} 
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary-indigo-100/40 rounded-full blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            x: [0, -80, 0],
                            y: [0, 60, 0]
                        }} 
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-action-secondary-light/30 rounded-full blur-[100px]" 
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* Text Content - Right Side (Arabic) */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 text-right"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-indigo-50 border border-primary-indigo-100 text-primary-indigo-600 rounded-full text-sm font-bold mb-8 shadow-sm"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-indigo-600"></span>
                                </span>
                                منصة "تمالين" — الخيار الأول للمبدعين العرب
                            </motion.div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-heading text-slate-900 leading-[1.1] tracking-tight">
                                حول خبرتك الرقمية إلى <br />
                                <span className="relative inline-block text-primary-indigo-600">
                                    إمبراطورية رابحة
                                    <motion.span 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: 0.8, duration: 1.2 }}
                                        className="absolute bottom-2 left-0 h-3 bg-primary-indigo-100 -z-10"
                                    />
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-medium"
                            >
                                لا تكتفِ ببيع المنتجات، ابنِ علامتك التجارية. نوفر لك البنية التحتية المتكاملة لبيع الدورات، الكتب، والخدمات الاستشارية في دقائق.
                            </motion.p>

                            <div className="flex flex-col sm:flex-row-reverse justify-end gap-4">
                                <Link href="/register">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-primary-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 flex items-center gap-3 group"
                                    >
                                        انطلق الآن مجاناً
                                        <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" />
                                    </motion.div>
                                </Link>
                                <Link href="#features">
                                    <motion.div
                                        whileHover={{ backgroundColor: '#f1f5f9' }}
                                        className="bg-white border border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg shadow-sm"
                                    >
                                        مشاهدة العرض الحي
                                    </motion.div>
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-12 flex items-center justify-end gap-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <FiShield className="text-2xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">دفع آمن</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <FiCheckCircle className="text-2xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">موثق رسمياً</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <FiTrendingUp className="text-2xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">دعم 24/7</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Visual Mockups - Left Side (Desktop Only) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, x: -50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="lg:col-span-5 relative hidden lg:block"
                        >
                            {/* Main Dashboard Card */}
                            <TiltCard className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-premium border border-white/50 relative z-20 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-primary-indigo-50 rounded-lg text-[10px] font-bold text-primary-indigo-600">DASHBOARD</div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-50">
                                        <p className="text-xs text-slate-400 font-bold mb-1">إجمالي المبيعات (اليوم)</p>
                                        <p className="text-3xl font-black text-slate-900">$2,840.00</p>
                                        <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }} animate={{ width: '70%' }} 
                                                transition={{ duration: 2, delay: 1 }}
                                                className="h-full bg-primary-indigo-500" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <FiShoppingBag className="text-emerald-600 mb-2" />
                                            <p className="text-xs text-emerald-800 font-bold">128 طلب</p>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <FiLayers className="text-blue-600 mb-2" />
                                            <p className="text-xs text-blue-800 font-bold">12 منتج</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Abstract Glow Effect */}
                                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 blur-[60px] rounded-full"></div>
                            </TiltCard>

                            {/* Floating Sales Badge */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 z-30 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <FiDollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold">بدأ للتو مبيع</p>
                                    <p className="text-sm font-black text-slate-800">450.00 $</p>
                                </div>
                            </motion.div>

                            {/* Floating User Badge */}
                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-10 -left-20 z-30 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4"
                            >
                                <div className="flex -space-x-4 space-x-reverse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold">انضم لمجتمعنا</p>
                                    <p className="text-sm font-black text-slate-800">+10,000 مبدع</p>
                                </div>
                            </motion.div>

                            {/* Background Elements */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-slate-100 rounded-full opacity-50"></div>
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-slate-50 rounded-full opacity-30"></div>
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Features Stats (Parallax Number Counters) */}
            <motion.section
                className="bg-primary-charcoal text-white py-20 relative overflow-hidden"
            >
                {/* Dynamic Grid Background */}
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0.2, 0.5], [0, 200]) }}
                    className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"
                />

                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-gray-700/50 divide-x-reverse">
                        {[
                            { value: "متنامية", label: "منصة تنمو باستمرار مع صناع المحتوى", delay: 0 },
                            { value: "0%", label: "رسوم تأسيس أو تكاليف خفية للانطلاق", delay: 0.1 },
                            { value: "غير محدود", label: "حرية الإبداع ونمو الأرباح لشركائنا", delay: 0.2 },
                            { value: "24/7", label: "فريق دعم فني جاهز لخدمتك دوماً", delay: 0.3 }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ type: "spring", stiffness: 100, damping: 20, delay: stat.delay }}
                                className="group cursor-default"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, color: '#3B82F6' }}
                                    className="text-5xl md:text-6xl font-bold mb-4 text-white transition-colors duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-gray-400 font-medium leading-relaxed group-hover:text-gray-300 transition-colors max-w-xs mx-auto">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Features Grid with Hover Cards */}
            <section id="features" className="py-32 bg-gray-50 relative">
                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20 max-w-3xl mx-auto"
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-block py-1 px-3 rounded-full bg-blue-100 text-action-blue font-bold tracking-wider uppercase text-xs mb-6"
                        >
                            قوة لا محدودة
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading text-primary-charcoal">كل الأدوات التي تحتاجها <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-600">للنجاح في مكان واحد</span></h2>
                        <p className="text-xl text-gray-500 font-medium">صممنا المنصة لتمنحك حرية الإبداع وقوة التجارة الإلكترونية، بدون أي تعقيدات برمجية.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <FiShoppingBag />, title: "متجر متكامل باسمك", desc: "امتلك هويتك الرقمية بالكامل مع متجر احترافي يعكس علامتك التجارية ويجذب جمهورك.", color: "from-blue-500 to-cyan-400" },
                            { icon: <FiDollarSign />, title: "بوابات دفع عالمية", desc: "استقبل مدفوعاتك من أي مكان في العالم بكل العملات وبدون أي تعقيدات تقنية.", color: "from-green-500 to-emerald-400" },
                            { icon: <FiTrendingUp />, title: "تسويق وعمولات", desc: "ضاعف مبيعاتك من خلال نظام المسوقين بالعمولة المدمج وشبكة شركاء النجاح.", color: "from-purple-500 to-pink-500" },
                            { icon: <FiVideo />, title: "استضافة الفيديو", desc: "نظام آمن ومحمي لرفع دوراتك ومحتواك المرئي مع منع التحميل والنسخ غير المصرح به.", color: "from-red-500 to-orange-500" },
                            { icon: <FiCalendar />, title: "حجوزات واستشارات", desc: "نظم وقتك وبع استشاراتك بالساعة مع تقويم ذكي متزامن مع Google Calendar.", color: "from-orange-400 to-yellow-400" },
                            { icon: <FiShield />, title: "حماية حقوقك", desc: "تقنيات متقدمة لحماية منتجاتك الرقمية من القرصنة وإعادة التوزيع بفضل التشفير القوي.", color: "from-indigo-500 to-blue-600" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group relative bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100/80 overflow-hidden"
                            >
                                {/* Animated Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="relative w-16 h-16 mb-8 group-hover:scale-110 transition-transform duration-500 ease-out">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500`} />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg -rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-primary-charcoal group-hover:text-action-blue transition-colors duration-300">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>

                                {/* Bottom Accent Line */}
                                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-700 ease-in-out`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="py-32 relative overflow-hidden bg-gray-900 border-t-4 border-action-blue">
                {/* Static Glowing Background */}
                <div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
                    style={{
                        background: `radial-gradient(circle 800px at 50% 50%, rgba(59, 130, 246, 0.15), transparent 80%)`
                    }}
                />

                <div className="container-custom text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 font-heading text-white leading-tight">
                            ابدأ في تحقيق أرباحك <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">من اليوم الأول</span>
                        </h2>
                        <p className="text-2xl mb-12 text-gray-400 max-w-2xl mx-auto font-medium">
                            انضم لآلاف المبدعين، المنصة مجانية تماماً للتجربة ولا تحتاج بطاقة ائتمانية.
                        </p>

                        <div
                            className="inline-block"
                        >
                            <Link href="/register">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-tilt"></div>
                                    <div className="relative flex items-center gap-4 bg-gray-900 px-12 py-6 rounded-full leading-none text-white text-2xl font-bold">
                                        انطلق الآن
                                        <FiArrowLeft className="group-hover:-translate-x-2 transition-transform duration-300" />
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>


        </main>
    );
}
