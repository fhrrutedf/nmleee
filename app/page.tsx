'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiArrowLeft, FiTrendingUp, FiShield, FiCheckCircle, FiGlobe, FiLock, FiSmartphone, FiZap, FiArrowRight, FiPlay, FiStar, FiUsers, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] selection:bg-emerald-500/30">
            <Hero />

            {/* Trust Section - Social Proof */}
            <section className="py-12 bg-[#0A0A0A] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                         <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-xl italic">FAWATERK</div>
                         <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-xl italic">NOWPAYMENTS</div>
                         <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-xl italic">STRIPE</div>
                         <div className="flex items-center gap-2 text-white font-bold tracking-tighter text-xl italic">SPACEREMIT</div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-bold text-emerald-500 mb-4 uppercase tracking-[0.4em]">المسار السريع</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">أطلق مشروعك في 3 دقائق</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { num: '01', title: 'تأسيس الهوية', desc: 'أنشئ حسابك المهني واختر نطاق متجرك الخاص. التفعيل فوري ومجاني.' },
                            { num: '02', title: 'حقن المحتوى', desc: 'ارفع كتبك، دوراتك، أو خدماتك. نحن نتكفل بالاستضافة السحابية الآمنة.' },
                            { num: '03', title: 'حصد الأرباح', desc: 'استقبل مدفوعاتك عبر المحافظ الإلكترونية أو العملات الرقمية بكل سلاسة.' },
                        ].map((step) => (
                            <div key={step.num} className="relative group">
                                <div className="text-8xl font-black text-white/[0.02] absolute -top-10 -right-4 font-inter select-none group-hover:text-emerald-500/[0.05] transition-colors">{step.num}</div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-emerald-500 mb-4">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Referral Mini-Banner */}
            <section className="max-w-5xl mx-auto px-6 mb-24">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                    <div className="relative z-10 text-right">
                        <span className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Partner Program</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">شاركنا النجاح واربح 10$</h2>
                        <p className="text-emerald-500/60 font-bold text-sm">اربح مكافأة نقدية فورية عن كل بائع ينضم لتمالين من خلالك.</p>
                    </div>
                    <Link href="/register" className="relative z-10 px-8 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95">
                        ابدأ الربح الآن
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 bg-[#0B0B0B] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-bold text-emerald-500 mb-4 uppercase tracking-[0.4em]">البنية التحتية</p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">قوة مؤسسية بين يديك</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <FiShoppingBag />, title: 'متاجر النخبة', desc: 'واجهة بيع سينمائية مصممة لرفع معدل التحويل لمنتجاتك الرقمية.' },
                            { icon: <FiVideo />, title: 'أكاديمية مغلقة', desc: 'نظام إدارة دورات (LMS) متطور مع حماية قصوى لمحتواك المرئي.' },
                            { icon: <FiCalendar />, title: 'استشارات ذكية', desc: 'بع خبرتك بنظام الساعة مع ربط تلقائي بـ Google Calendar وزووم.' },
                            { icon: <FiDollarSign />, title: 'سيولة بلا حدود', desc: 'استقبل أموالك في سوريا، مصر، والعراق عبر Sham Cash و USDT.' },
                            { icon: <FiTrendingUp />, title: 'جيش من المسوقين', desc: 'فعّل نظام الأفلييت ودع المئات يسوقون لمنتجاتك مقابل عمولة تحددها.' },
                            { icon: <FiLock />, title: 'تشفير عسكري', desc: 'حماية كاملة لملفاتك وروابط تحميل آمنة تنتهي صلاحيتها آلياً.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-[#0A0A0A] rounded-2xl p-10 border border-white/5 hover:border-emerald-500/30 hover:shadow-2xl transition-all duration-500 group">
                                <div className="w-14 h-14 rounded-2xl bg-[#111111] flex items-center justify-center text-emerald-500 text-2xl mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials / Stats */}
            <section className="py-32 bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { icon: FiUsers, value: '+2,500', label: 'رائد أعمال رقمي' },
                            { icon: FiAward, value: '100%', label: 'ضمان حقوق البائع' },
                            { icon: FiStar, value: '4.9/5', label: 'تقييم المستخدمين' },
                        ].map((s, i) => (
                            <div key={i} className="space-y-4">
                                <div className="text-emerald-500 flex justify-center text-3xl opacity-20"><s.icon /></div>
                                <div className="text-4xl font-black text-white font-inter">{s.value}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 bg-emerald-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        إمبراطوريتك تنتظرك.
                    </h2>
                    <p className="text-emerald-100 text-lg mb-12 max-w-xl mx-auto font-medium">
                        انضم لآلاف المبدعين العرب الذين اختاروا تمالين لبناء مستقبلهم المالي الرقمي.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto bg-black text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4"
                        >
                            أطلق متجرك الآن <FiArrowLeft className="text-xl" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

function Hero() {
    return (
        <section className="pt-40 pb-32 lg:pt-56 lg:pb-48 bg-[#0A0A0A] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-emerald-500/5 blur-[140px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/[0.02] blur-[100px] rounded-full"></div>
            
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8 }} 
                    className="inline-flex items-center gap-3 bg-white/[0.03] text-emerald-500/80 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-12 border border-white/5 backdrop-blur-md"
                >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    Digital Empire Infrastructure
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1, delay: 0.2 }} 
                    className="text-5xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.85] tracking-tighter mb-12 max-w-6xl mx-auto"
                >
                    ابنِ إمبراطوريتك <br />
                    <span className="text-emerald-500">الرقمية.</span>
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-16 leading-relaxed font-medium"
                >
                    البنية التحتية المتكاملة لبيع الدورات والمنتجات الرقمية في الوطن العربي. 
                    استقبل أرباحك فوراً، بأمان تام، وبدون تعقيدات برمجية.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
                >
                    <Link
                        href="/register"
                        className="w-full sm:w-auto px-12 py-6 bg-emerald-500 text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        ابدأ مجاناً
                        <FiArrowLeft size={18} />
                    </Link>
                    <Link
                        href="#features"
                        className="w-full sm:w-auto px-12 py-6 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/5 transition-all backdrop-blur-sm"
                    >
                        المميزات الاستراتيجية
                    </Link>
                </motion.div>

                {/* Proof bar */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><FiShield className="text-emerald-500" /> Secure Escrow</span>
                    <span className="flex items-center gap-2"><FiZap className="text-emerald-500" /> Instant Payouts</span>
                    <span className="flex items-center gap-2"><FiGlobe className="text-emerald-500" /> Pan-Arab Support</span>
                </div>
            </div>
        </section>
    );
}
