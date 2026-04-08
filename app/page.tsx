'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiArrowLeft, FiTrendingUp, FiShield, FiCheckCircle, FiGlobe, FiLock, FiSmartphone, FiZap, FiArrowRight, FiPlay, FiStar, FiUsers, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] selection:bg-emerald-500/30">
            <Hero />

            {/* Social Proof & Trusted Payments */}
            <section className="py-12 bg-[#0A0A0A] border-y border-white/5" aria-label="بوابات الدفع المدعومة">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="sr-only">بوابات الدفع الموثوقة والمدعومة في منصتكم</h2>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                         <div className="flex items-center gap-2 text-white font-bold text-xl italic" title="دفع عبر فواتيرك">FAWATERK</div>
                         <div className="flex items-center gap-2 text-white font-bold text-xl italic" title="الدفع بالعملات الرقمية">NOWPAYMENTS</div>
                         <div className="flex items-center gap-2 text-white font-bold text-xl italic" title="دفع عبر سترايب">STRIPE</div>
                         <div className="flex items-center gap-2 text-white font-bold text-xl italic" title="دفع عبر سبيس ريميت">SPACEREMIT</div>
                    </div>
                </div>
            </section>

            {/* Features SEO Optimized */}
            <section id="features" className="py-32 bg-[#0B0B0B] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-[12px] font-bold text-emerald-500 mb-4 uppercase tracking-[0.4em]">مميزات منصتك الرقمية</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white leading-snug">أدوات احترافية لبيع منتجاتك الرقمية</h3>
                        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            نقدم لك نظاماً متكاملاً لإدارة، حماية، وبيع منتجاتك الرقمية ودوراتك التدريبية. لا تقلق بشأن الأمور التقنية، وركز على صناعة المحتوى الرائع.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <FiShoppingBag />, title: 'بيع الملفات والكتب الإلكترونية', desc: 'استضف ملفاتك، قوالبك، وكتبك الإلكترونية بأمان. تسليم تلقائي ومباشر للعميل بمجرد الشراء.' },
                            { icon: <FiVideo />, title: 'منصة استضافة الدورات التدريبية', desc: 'نظام إدارة تعلم (LMS) شامل، مشغل فيديو محمي، تسلسل للدروس، وإدارة اشتراكات الطلاب.' },
                            { icon: <FiCalendar />, title: 'بيع الاستشارات وحجز المواعيد', desc: 'اربط جدولك بـ Google Calendar واسمح للعملاء بحجز استشاراتك المدفوعة بسهولة تامة.' },
                            { icon: <FiDollarSign />, title: 'بوابات دفع عربية وعالمية', desc: 'استقبل أرباحك في أي دولة عربية، دعم لوسائل الدفع المحلية والمحافظ والعملات المشفرة.' },
                            { icon: <FiTrendingUp />, title: 'نظام التسويق بالعمولة (الأفلييت)', desc: 'ضاعف مبيعاتك بنقرة زر! اسمح للآلاف من المسوقين ببيع منتجاتك الرقمية مقابل عمولة تحددها.' },
                            { icon: <FiLock />, title: 'حماية متقدمة للمحتوى الرقمي', desc: 'تشفير عسكري للملفات، منع تحميل الفيديوهات، وروابط تحميل مؤقتة لحماية حقوقك الفكرية.' },
                        ].map((f, i) => (
                            <article key={i} className="bg-[#0A0A0A] rounded-2xl p-10 border border-white/5 hover:border-emerald-500/30 hover:shadow-2xl transition-all duration-500 group">
                                <div className="w-14 h-14 rounded-2xl bg-[#111111] flex items-center justify-center text-emerald-500 text-2xl mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                    {f.icon}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">{f.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Semantic Structure */}
            <section className="py-32 bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-[10px] font-bold text-emerald-500 mb-4 uppercase tracking-[0.4em] block">دليل البدء خطوة بخطوة</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-snug">كيف تبدأ ببيع منتجاتك الرقمية؟</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { num: '01', title: 'أنشئ متجرك الرقمي', desc: 'قم بتسجيل حسابك مجاناً واحصل على رابط متجرك الخاص للبدء في استقبال العملاء.' },
                            { num: '02', title: 'ارفع محتواك الرقمي', desc: 'أضف الكورسات، القوالب، الكتب الإلكترونية (PDF)، أو خصص باقات الاستشارات بسهولة.' },
                            { num: '03', title: 'استقبل الأرباح', desc: 'شارك رابط متجرك مع جمهورك واستلم أموالك في حسابك البنكي أو محفظتك بلمح البصر.' },
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

            {/* SEO Focused FAQ Section */}
            <section className="py-24 bg-[#0B0B0B] border-y border-white/5" itemScope itemType="https://schema.org/FAQPage">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">الأسئلة الشائعة حول بيع المنتجات الرقمية</h2>
                        <p className="text-gray-500">كل ما تحتاج معرفته عن بدء تجارتك الرقمية عبر "منصتك الرقمية".</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { q: "ما هي المنتجات الرقمية التي يمكنني بيعها؟", a: "يمكنك بيع أي محتوى ملموس يدوياً كالملفات (PDF، قوالب تصميم، شيتات إكسيل)، الكورسات والدورات المسجلة، الاستشارات المباشرة والمواعيد، والأكواد المصدرية." },
                            { q: "كيف أستلم أرباحي من مبيعات دوراتي؟", a: "بمجرد بيع المنتج، تُضاف الأرباح إلى رصيدك. نقدم خيارات سحب متعددة تناسب المبدعين في العالم العربي مثل التحويلات البنكية، المحافظ الإلكترونية (فودافون كاش زين كاش وغيرها) عبر وسطاء مدمجين، والعملات الرقمية." },
                            { q: "هل تدعم المنصة حماية المحتوى من السرقة؟", a: "نعم! تتمتع منصتك الرقمية بنظام أمان قوي، حيث نقوم بتشفير الروابط، منع التحميل العشوائي لمقاطع الفيديو، وإلغاء تفعيل الروابط تلقائياً بعد مرور فترة محددة لحفظ حقوقك." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-2xl" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                <h3 className="text-lg font-bold text-white mb-3" itemProp="name">{faq.q}</h3>
                                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                    <p className="text-gray-400 text-sm leading-relaxed" itemProp="text">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Referral Mini-Banner */}
            <section className="max-w-5xl mx-auto px-6 mb-24 mt-24">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                    <div className="relative z-10 text-right">
                        <span className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">شراكة النجاح</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">شاركنا النجاح واربح 10$</h3>
                        <p className="text-emerald-500/60 font-bold text-sm">اربح مكافأة نقدية فورية عن كل بائع ينضم للمنصة من خلالك.</p>
                    </div>
                    <Link href="/register" className="relative z-10 px-8 py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95">
                        ابدأ الربح الآن
                    </Link>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 bg-emerald-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-snug">
                        جاهز لإطلاق متجرك الرقمي؟
                    </h2>
                    <p className="text-emerald-100 text-lg mb-12 max-w-xl mx-auto font-medium">
                        انضم لآلاف المبدعين العرب الذين اختاروا منصتكم لبناء مصدر دخل مستدام عن طريق بيع معارفهم ومنتجاتهم الرقمية.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto bg-black text-white px-12 py-6 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-4"
                        >
                            أنشئ حسابك مجاناً <FiArrowLeft className="text-xl" />
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
            
            <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8 }} 
                    className="inline-flex items-center gap-3 bg-white/[0.03] text-emerald-500/80 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-12 border border-white/5 backdrop-blur-md"
                >
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    أفضل منصة عربية لبيع المنتجات الرقمية
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1, delay: 0.2 }} 
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black text-white leading-[1.4] sm:leading-[1.3] mb-8 max-w-5xl mx-auto"
                >
                    حوّل شغفك ومعرفتك إلى <br />
                    <span className="text-emerald-500">أرباح رقمية مستدامة.</span>
                </motion.h1>

                <motion.h2 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
                >
                    أنشئ متجرك الإلكتروني في دقائق وابدأ ببيع الدورات التدريبية، الكتب الإلكترونية (PDF)، والاستشارات. نظام متكامل يدير لك المبيعات والدفع وحماية المحتوى بصفر تعقيد.
                </motion.h2>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
                >
                    <Link
                        href="/register"
                        className="w-full sm:w-auto px-12 py-5 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        ابدأ رحلتك مجاناً
                        <FiArrowLeft size={18} />
                    </Link>
                    <Link
                        href="/explore"
                        className="w-full sm:w-auto px-12 py-5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/5 transition-all backdrop-blur-sm"
                    >
                        تصفح متاجر المبدعين
                    </Link>
                </motion.div>

                {/* Proof bar SEO */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-gray-500 text-[11px] font-bold">
                    <span className="flex items-center gap-2"><FiShield className="text-emerald-500 text-base" /> حماية فائقة لمنتجاتك</span>
                    <span className="flex items-center gap-2"><FiZap className="text-emerald-500 text-base" /> تسليم آلي للطلبات</span>
                    <span className="flex items-center gap-2"><FiGlobe className="text-emerald-500 text-base" /> داعم لكافة العالم العربي</span>
                </div>
            </div>
        </section>
    );
}
