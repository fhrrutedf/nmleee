'use client';

import Link from 'next/link';
import { FiShoppingBag, FiVideo, FiCalendar, FiDollarSign, FiCheckCircle, FiArrowLeft, FiTrendingUp, FiLayers, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-light">
            {/* Header */}
            <header className="glass-effect sticky top-0 z-50 shadow-sm border-b border-gray-100">
                <nav className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-12">
                            <Link href="/" className="text-2xl font-bold text-primary-charcoal flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-action-blue flex items-center justify-center text-white">
                                    <FiLayers />
                                </span>
                                منصتي الرقمية
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-8">
                                <Link href="/features" className="text-gray-600 hover:text-action-blue font-medium transition-colors">المميزات</Link>
                                <Link href="/pricing" className="text-gray-600 hover:text-action-blue font-medium transition-colors">الأسعار</Link>
                                <Link href="/showcase" className="text-gray-600 hover:text-action-blue font-medium transition-colors">نماذج</Link>
                                <Link href="/blog" className="text-gray-600 hover:text-action-blue font-medium transition-colors">المدونة</Link>
                                <Link href="/about" className="text-gray-600 hover:text-action-blue font-medium transition-colors">عن المنصة</Link>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/login" className="btn btn-secondary font-medium hover:bg-gray-50 border-transparent shadow-none hover:shadow-sm">
                                دخول
                            </Link>
                            <Link href="/register" className="btn btn-primary shadow-lg hover:shadow-xl hover:scale-105 transition-transform">
                                ابدأ الآن مجاناً
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-transparent opacity-50 z-0"></div>
                <div className="container-custom relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-right animate-fade-in">
                            <div className="inline-block px-4 py-2 bg-blue-50 text-action-blue rounded-full text-sm font-bold mb-6 border border-blue-100">
                                ✨ المنصة الأسرع نمواً لصناع المحتوى
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-heading text-primary-charcoal leading-tight">
                                حول شغفك  <br />
                                إلى <span className="text-action-blue relative">
                                    دخل مستدام
                                    <svg className="absolute w-full h-3 -bottom-1 right-0 text-yellow-300 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-xl text-text-muted mb-10 leading-relaxed max-w-lg">
                                لا تحتاج لخبرة تقنية. ابدأ بيع دوراتك، كتبك الإلكترونية، وخدماتك الاستشارية في دقائق معدودة.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register" className="btn btn-primary text-lg px-10 py-4 shadow-xl shadow-blue-500/20">
                                    أنشئ متجرك الآن
                                </Link>
                                <Link href="#features" className="btn btn-secondary text-lg px-8 py-4 bg-white border border-gray-200">
                                    كيف يعمل؟
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center gap-4 text-sm text-text-muted">
                                <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> تجربة مجانية</span>
                                <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> بدون بطاقة ائتمان</span>
                                <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> إلغاء في أي وقت</span>
                            </div>
                        </div>

                        {/* Flat Illustration Composition */}
                        <div className="relative h-[500px] hidden lg:block">
                            {/* Main Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute top-10 left-10 right-10 bottom-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-10 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                                </div>
                                <div className="flex gap-6 mb-6">
                                    <div className="w-1/3 bg-gray-50 rounded-xl h-32 animate-pulse"></div>
                                    <div className="w-1/3 bg-gray-50 rounded-xl h-32 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1/3 bg-gray-50 rounded-xl h-32 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-50 rounded w-full"></div>
                                </div>
                            </motion.div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-20 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <FiDollarSign className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">تم استلام دفعة</p>
                                    <p className="font-bold text-gray-800">+ $150.00</p>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [10, -10, 10] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 -left-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-20 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-action-blue">
                                    <FiVideo className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">مشترك جديد</p>
                                    <p className="font-bold text-gray-800">دورة التصميم</p>
                                </div>
                            </motion.div>

                            {/* Decorative Background Blobs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Stats */}
            <section className="bg-primary-charcoal text-white py-12">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-700 divide-x-reverse">
                        <div>
                            <div className="text-4xl font-bold mb-2 text-action-blue">+10k</div>
                            <div className="text-gray-400">صانع محتوى</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2 text-action-blue">$5M+</div>
                            <div className="text-gray-400">أرباح موزعة</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2 text-action-blue">0%</div>
                            <div className="text-gray-400">رسوم تأسيس</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2 text-action-blue">24/7</div>
                            <div className="text-gray-400">دعم فني</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <span className="text-action-blue font-bold tracking-wider uppercase text-sm mb-2 block">مميزات لا تضاهى</span>
                        <h2 className="text-4xl font-bold mb-6 font-heading text-primary-charcoal">كل الأدوات التي تحتاجها للنجاح</h2>
                        <p className="text-xl text-text-muted">صممنا المنصة لتمنحك حرية الإبداع وقوة التجارة الإلكترونية في مكان واحد، دون تعقيدات.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FiShoppingBag className="text-2xl" />,
                                title: "متجر متكامل باسمك",
                                desc: "امتلك هويتك الرقمية بالكامل مع متجر احترافي يعكس علامتك التجارية ويجذب جمهورك.",
                                color: "blue"
                            },
                            {
                                icon: <FiDollarSign className="text-2xl" />,
                                title: "بوابات دفع عالمية",
                                desc: "استقبل مدفوعاتك من أي مكان في العالم بكل العملات وبدون أي تعقيدات تقنية.",
                                color: "green"
                            },
                            {
                                icon: <FiTrendingUp className="text-2xl" />,
                                title: "عمولات وتسويق",
                                desc: "ضاعف مبيعاتك من خلال نظام المسوقين بالعمولة المدمج وشبكة شركاء النجاح.",
                                color: "purple"
                            },
                            {
                                icon: <FiVideo className="text-2xl" />,
                                title: "استضافة الفيديو",
                                desc: "نظام آمن ومحمي لرفع دوراتك ومحتواك المرئي مع منع التحميل والنسخ غير المصرح به.",
                                color: "red"
                            },
                            {
                                icon: <FiCalendar className="text-2xl" />,
                                title: "حجوزات واستشارات",
                                desc: "نظم وقتك وبع استشاراتك بالساعة مع تقويم ذكي متزامن مع Google Calendar.",
                                color: "orange"
                            },
                            {
                                icon: <FiShield className="text-2xl" />,
                                title: "حماية حقوقك",
                                desc: "تقنيات متقدمة لحماية منتجاتك الرقمية من القرصنة وإعادة التوزيع.",
                                color: "indigo"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="card group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-50 text-${feature.color}-600 group-hover:bg-${feature.color}-600 group-hover:text-white transition-colors duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-primary-charcoal">{feature.title}</h3>
                                <p className="text-text-muted leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6 font-heading text-primary-charcoal">كيف تبدأ رحلتك؟</h2>
                        <p className="text-xl text-text-muted">الانطلاق أسهل مما تتخيل</p>
                    </div>

                    <div className="relative grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className="hidden md:block absolute top-12 right-[16%] left-[16%] h-1 bg-gray-200 -z-10"></div>

                        {[
                            {
                                step: "01",
                                title: "أنشئ حسابك",
                                desc: "سجل مجاناً في ثوانٍ. لا نطلب أي رسوم تأسيس أو بيانات بنكية."
                            },
                            {
                                step: "02",
                                title: "ارفع منتجك",
                                desc: "سواء كان كتاباً، دورة، أو استشارة. أدواتنا تجعل الرفع سهلاً."
                            },
                            {
                                step: "03",
                                title: "ابدأ البيع",
                                desc: "شارك رابط متجرك واستقبل أول عملية بيع، ثم اسحب أرباحك."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-white group-hover:border-action-blue transition-colors duration-300 relative z-20">
                                    <span className="text-3xl font-bold text-gray-300 group-hover:text-action-blue transition-colors">{item.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-primary-charcoal">{item.title}</h3>
                                <p className="text-text-muted max-w-xs mx-auto">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary-charcoal text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 font-heading">لا تنتظر اللحظة المثالية<br /><span className="text-action-blue">اصنعها الآن</span></h2>
                    <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto">
                        انضم لآلاف المبدعين الذين حققوا استقلالهم المالي من خلال بيع خبراتهم.
                    </p>
                    <Link href="/register" className="btn bg-action-blue text-white hover:bg-white hover:text-action-blue text-xl px-12 py-5 shadow-2xl rounded-full transition-all hover:scale-105">
                        ابدأ رحلتك المجانية
                    </Link>
                    <p className="mt-8 text-sm text-gray-500">تجربة مجانية بالكامل • لا تتطلب بطاقة ائتمان</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <FiLayers className="text-action-blue" />
                                منصتي الرقمية
                            </div>
                            <p className="leading-relaxed mb-6">
                                الشريك التقني الأول لصناع المحتوى العربي. نمنحك الأدوات لتكبر وتنتشر.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Icons Placeholders */}
                                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-action-blue transition-colors cursor-pointer"></div>
                                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-action-blue transition-colors cursor-pointer"></div>
                                <div className="w-8 h-8 rounded bg-gray-800 hover:bg-action-blue transition-colors cursor-pointer"></div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">المنتج</h4>
                            <ul className="space-y-4">
                                <li><Link href="/features" className="hover:text-action-blue transition-colors">المميزات</Link></li>
                                <li><Link href="/pricing" className="hover:text-action-blue transition-colors">الأسعار</Link></li>
                                <li><Link href="/showcase" className="hover:text-action-blue transition-colors">نماذج أعمال</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">الشركة</h4>
                            <ul className="space-y-4">
                                <li><Link href="/about" className="hover:text-action-blue transition-colors">من نحن</Link></li>
                                <li><Link href="/blog" className="hover:text-action-blue transition-colors">المدونة</Link></li>
                                <li><Link href="/contact" className="hover:text-action-blue transition-colors">تواصل معنا</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">قانوني</h4>
                            <ul className="space-y-4">
                                <li><Link href="/privacy" className="hover:text-action-blue transition-colors">الخصوصية</Link></li>
                                <li><Link href="/terms" className="hover:text-action-blue transition-colors">الشروط والأحكام</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2024 منصتي الرقمية. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
