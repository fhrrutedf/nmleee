import Link from 'next/link';
import { FiPlay, FiBook, FiShoppingCart, FiVideo, FiUsers, FiTrendingUp, FiCheckCircle, FiStar } from 'react-icons/fi';

export default function DemoPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-6xl font-bold mb-6">مرحباً بك في تمكين! 🚀</h1>
                    <p className="text-2xl mb-8 max-w-3xl mx-auto">
                        منصة عربية متكاملة لبيع المنتجات الرقمية والدورات التدريبية
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg">
                            ابدأ الآن مجاناً
                        </Link>
                        <Link href="/courses" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg">
                            تصفح الدورات
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUsers className="text-4xl text-blue-600" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-2">10K+</h3>
                            <p className="text-gray-600">مستخدم نشط</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiShoppingCart className="text-4xl text-green-600" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-2">50K+</h3>
                            <p className="text-gray-600">عملية بيع</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiBook className="text-4xl text-purple-600" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-2">5K+</h3>
                            <p className="text-gray-600">دورة ومنتج</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiStar className="text-4xl text-orange-600" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 mb-2">4.9</h3>
                            <p className="text-gray-600">تقييم المستخدمين</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">ميزات المنصة</h2>
                        <p className="text-xl text-gray-600">كل ما تحتاجه لبدء عملك الرقمي</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <FiShoppingCart className="text-3xl text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">بيع المنتجات</h3>
                            <p className="text-gray-600 leading-relaxed">
                                بع منتجاتك الرقمية (كتب، قوالب، برمجيات) بسهولة وأمان
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <FiVideo className="text-3xl text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">الدورات التدريبية</h3>
                            <p className="text-gray-600 leading-relaxed">
                                أنشئ وبع دوراتك التدريبية مع نظام إدارة متكامل
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FiTrendingUp className="text-3xl text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">تحليلات شاملة</h3>
                            <p className="text-gray-600 leading-relaxed">
                                تابع مبيعاتك وأرباحك بتقارير مفصلة ولحظية
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">كيف تبدأ؟</h2>
                        <p className="text-xl text-gray-600">3 خطوات بسيطة فقط</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-3">أنشئ حسابك</h3>
                            <p className="text-gray-600">
                                سجّل مجاناً واملأ بيانات ملفك الشخصي
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-3">أضف منتجاتك</h3>
                            <p className="text-gray-600">
                                ارفع منتجاتك أو دوراتك بسهولة من لوحة التحكم
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-3">ابدأ البيع</h3>
                            <p className="text-gray-600">
                                شارك روابطك وابدأ بتحقيق الدخل فوراً
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Products */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">أمثلة من المنتجات</h2>
                        <p className="text-xl text-gray-600">اكتشف ما يمكنك بيعه على المنصة</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'دورة تطوير المواقع',
                                category: 'برمجة',
                                price: '499',
                                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'
                            },
                            {
                                title: 'كتاب التسويق الرقمي',
                                category: 'تسويق',
                                price: '99',
                                image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400'
                            },
                            {
                                title: 'قوالب تصميم احترافية',
                                category: 'تصميم',
                                price: '199',
                                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
                            }
                        ].map((product, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow group">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="p-6">
                                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-2">
                                        {product.category}
                                    </span>
                                    <h3 className="font-bold text-xl mb-2">{product.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="text-sm text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-bold text-primary-600">{product.price} ج.م</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/products" className="btn btn-primary px-8 py-3 text-lg">
                            تصفح جميع المنتجات
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-700">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-5xl font-bold mb-6">جاهز للبدء؟</h2>
                    <p className="text-2xl mb-8">انضم إلى آلاف المبدعين الذين يحققون دخلهم من مهاراتهم</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/register"
                            className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg"
                        >
                            ابدأ مجاناً الآن
                        </Link>
                        <Link
                            href="/about"
                            className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg"
                        >
                            اعرف المزيد
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
