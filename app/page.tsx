'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiArrowLeft, FiTrendingUp, FiShield, FiCheckCircle, FiGlobe, FiLock, FiSmartphone, FiZap, FiArrowRight, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            <Hero />

            {/* How It Works */}
            <section className="py-24 bg-[#0A0A0A] border-b border-white/10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-500 mb-3 tracking-wide">كيف يعمل؟</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">ثلاث خطوات فقط للبدء</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16">
                        {[
                            { num: '01', title: 'أنشئ حسابك', desc: 'سجّل مجاناً واختر اسم متجرك. لا تحتاج بطاقة ائتمان أو خبرة تقنية.' },
                            { num: '02', title: 'ارفع منتجاتك', desc: 'أضف ملفاتك الرقمية، دوراتك، أو خدماتك الاستشارية. نتكفل بالاستضافة والحماية.' },
                            { num: '03', title: 'شارك وابدأ البيع', desc: 'شارك رابط متجرك واستقبل الطلبات. أرباحك تصل لحسابك بشكل مباشر.' },
                        ].map((step) => (
                            <div key={step.num} className="text-center">
                                <div className="text-5xl font-bold text-white/5 mb-4 font-inter" dir="ltr">{step.num}</div>
                                <h3 className="text-xl font-bold text-emerald-500 mb-3">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-[15px]">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-500 mb-3 tracking-wide">المميزات</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">كل ما تحتاجه في مكان واحد</h2>
                        <p className="text-gray-400 mt-4 max-w-xl mx-auto">لا تحتاج أدوات متفرقة. تمالين تجمع لك المتجر، الدورات، الحجوزات، والدفع في منصة واحدة.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <FiShoppingBag />, title: 'متجر رقمي كامل', desc: 'بع الكتب، القوالب، الملفات، أو أي منتج رقمي آخر. متجرك جاهز خلال دقائق.' },
                            { icon: <FiVideo />, title: 'دورات تدريبية', desc: 'أنشئ دورات بالفيديو مع نظام متابعة تقدم الطلاب والشهادات.' },
                            { icon: <FiCalendar />, title: 'استشارات ومواعيد', desc: 'بع وقتك بالساعة مع تقويم ذكي مربوط بـ Google Calendar.' },
                            { icon: <FiDollarSign />, title: 'دفع عالمي', desc: 'استقبل مدفوعات من أي مكان. ندعم بوابات دفع محلية وعالمية.' },
                            { icon: <FiTrendingUp />, title: 'تسويق بالعمولة', desc: 'فعّل نظام المسوقين بالعمولة وخلّ الآخرين يبيعون عنك.' },
                            { icon: <FiLock />, title: 'حماية المحتوى', desc: 'نحمي ملفاتك من النسخ والتحميل غير المصرح به.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-[#111] rounded-2xl p-8 border border-white/10 hover:border-emerald-500/30 hover:shadow-glow transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl mb-6 shadow-inner">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof / Trust */}
            <section className="py-20 bg-[#0A0A0A] border-y border-white/10">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 'مجاني', label: 'للبدء — بدون بطاقة ائتمان' },
                            { value: '0%', label: 'رسوم اشتراك شهري' },
                            { value: '24/7', label: 'دعم فني متواصل' },
                            { value: 'عالمي', label: 'بوابات دفع لكل الدول' },
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="text-2xl md:text-3xl font-bold text-emerald-500 mb-2">{s.value}</div>
                                <div className="text-sm text-gray-400">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who is this for? */}
            <section className="py-24 bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-emerald-500 mb-3 tracking-wide">لمن هذه المنصة؟</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">تمالين مصممة لأصحاب المعرفة</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { emoji: '🎓', title: 'المدربون والمعلمون', desc: 'أنشئ أكاديميتك الرقمية مع نظام إدارة طلاب متكامل' },
                            { emoji: '✍️', title: 'الكتّاب والمصممون', desc: 'بع كتبك وقوالبك وملفاتك الرقمية بسهولة تامة' },
                            { emoji: '💼', title: 'المستشارون والخبراء', desc: 'نظّم مواعيدك وبع استشاراتك بالساعة مع تقويم ذكي' },
                        ].map((p, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl border border-white/10 bg-[#111] hover:bg-[#161616] transition-all">
                                <div className="text-4xl mb-4">{p.emoji}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-[#0A0A0A] border-t border-white/10">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ابدأ ببيع منتجاتك الرقمية اليوم
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                        أنشئ حسابك مجاناً واحصل على متجرك الرقمي خلال دقائق. لا تحتاج خبرة تقنية.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link
                            href="/register"
                            className="w-full md:w-auto bg-emerald-600 text-white px-12 py-6 rounded-xl font-bold text-xs uppercase tracking-[0.3em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            Launch store <FiArrowRight className="text-xl group-hover:translate-x-2 transition-transform text-white" />
                        </Link>
                        <Link
                            href="/about"
                            className="w-full md:w-auto bg-transparent text-white border border-white/10 px-12 py-6 rounded-xl font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white/5 transition-all shadow-lg group"
                        >
                            Explore Platform <FiPlay className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

function Hero() {
    return (
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-[#0A0A0A] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-40 text-center relative z-10 antialiased">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-3 bg-white/5 text-gray-400 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border border-white/10 shadow-2xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Strategic Growth Infrastructure
                </motion.div>
                
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-6xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tighter mb-10 max-w-5xl mx-auto">
                    Elevate Local Expertise <br />
                    <span className="text-emerald-500">Globally.</span>
                </motion.h1>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    أنشئ متجرك، ارفع دوراتك وكتبك ومنتجاتك الرقمية، واستقبل
                    الأرباح مباشرة — بدون رسوم اشتراك وبدون تعقيد.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-glow transition-all"
                    >
                        ابدأ مجاناً
                        <FiArrowLeft />
                    </Link>
                    <Link
                        href="#features"
                        className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/5 transition-all"
                    >
                        تعرف على المميزات
                    </Link>
                </div>

                {/* Trust Bar */}
                <div className="flex items-center justify-center gap-6 text-gray-500 text-xs">
                    <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-500" /> مجاني للبدء</span>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <span className="flex items-center gap-1.5"><FiShield className="text-emerald-500" /> دفع آمن ومشفر</span>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <span className="flex items-center gap-1.5"><FiGlobe className="text-emerald-500" /> دعم عربي وعالمي</span>
                </div>
            </div>
        </section>
    );
}

