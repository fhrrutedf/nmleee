import { FiUsers, FiShoppingCart, FiTrendingUp, FiAward, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-purple-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">عن منصة تمكين</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        منصة عربية رائدة لبيع المنتجات الرقمية والدورات التدريبية، نساعد المبدعين على تحقيق دخلهم من مهاراتهم
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUsers className="text-3xl text-blue-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
                            <p className="text-gray-600">مستخدم نشط</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShoppingCart className="text-3xl text-green-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">50,000+</h3>
                            <p className="text-gray-600">عملية بيع</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrendingUp className="text-3xl text-purple-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">5,000+</h3>
                            <p className="text-gray-600">منتج رقمي</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiAward className="text-3xl text-orange-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">98%</h3>
                            <p className="text-gray-600">رضا العملاء</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">رسالتنا</h2>
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                نؤمن بأن كل شخص لديه موهبة فريدة يمكن أن تحدث فرقاً. منصتنا توفر البيئة المثالية للمبدعين العرب لتحويل مهاراتهم ومعرفتهم إلى منتجات رقمية وخدمات قيّمة.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                من خلال توفير أدوات احترافية وبنية تحتية آمنة، نمكّن المبدعين من التركيز على ما يجيدونه بينما نتولى نحن الجوانب التقنية والإدارية.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
                                alt="فريق العمل"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">لماذا تختار تمكين؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'سهولة الاستخدام', desc: 'واجهة بسيطة وسهلة لإدارة منتجاتك ومبيعاتك' },
                            { title: 'أمان عالي', desc: 'نظام دفع آمن ومشفر لحماية معاملاتك وبياناتك' },
                            { title: 'دعم فني', desc: 'فريق دعم متاح 24/7 لمساعدتك في أي وقت' },
                            { title: 'عمولة منافسة', desc: 'نسبة عمولة منخفضة لزيادة أرباحك' },
                            { title: 'تقارير مفصلة', desc: 'تحليلات شاملة لمتابعة أداء منتجاتك' },
                            { title: 'مجتمع نشط', desc: 'تواصل مع آلاف المبدعين والمتعلمين' }
                        ].map((feature, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                                <FiCheckCircle className="text-3xl text-primary-600 mb-4" />
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-700">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">جاهز للبدء؟</h2>
                    <p className="text-xl mb-8">انضم إلى آلاف المبدعين الذين يحققون دخلهم من مهاراتهم</p>
                    <Link
                        href="/register"
                        className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                    >
                        ابدأ الآن مجاناً
                    </Link>
                </div>
            </section>
        </div>
    );
}
