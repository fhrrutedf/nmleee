import { FiExternalLink, FiUser, FiShoppingBag, FiStar } from 'react-icons/fi';
import Link from 'next/link';

export default function ShowcasePage() {
    const showcases = [
        {
            title: 'أكاديمية التصميم الحديث',
            owner: 'أحمد علي',
            type: 'دورات تعليمية',
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60',
            stats: 'بيع 5000+ دورة',
            desc: 'منصة تعليمية متخصصة في الدورات المسجلة لتعليم الجرافيك ديزاين والموشن جرافيك.'
        },
        {
            title: 'متجر الكتب الرقمية',
            owner: 'سارة محمد',
            type: 'منتجات رقمية',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=60',
            stats: '20,000+ تحميل',
            desc: 'متجر متخصص في بيع الملخصات والكتب الإلكترونية بتنسيق PDF جاهز للتحميل الفوري.'
        },
        {
            title: 'استشارات قانونية أونلاين',
            owner: 'مكتب العدالة',
            type: 'خدمات استشارية',
            image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=60',
            stats: '300+ عميل',
            desc: 'حجز جلسات استشارية قانونية عبر الفيديو باستخدام نظام الحجوزات المدمج في المنصة.'
        },
        {
            title: 'ورشة الفخار',
            owner: 'ليلى حسن',
            type: 'ورش عمل وبيع منتجات',
            image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&auto=format&fit=crop&q=60',
            stats: 'بيع كامل للمقاعد',
            desc: 'بيع تذاكر حضور ورش العمل الفنية بالإضافة إلى بيع الأدوات والمعدات الفنية.'
        },
        {
            title: 'مدير المهام الاحترافي',
            owner: 'TechFlow',
            type: 'قوالب Notion',
            image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600&auto=format&fit=crop&q=60',
            stats: 'الأكثر مبيعاً',
            desc: 'بيع قوالب ونماذج إنتاجية جاهزة للاستخدام على برامج إدارة المهام.'
        },
        {
            title: 'وصفات الشيف',
            owner: 'الشيف عمر',
            type: 'كتب طبخ وفيديو',
            image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=600&auto=format&fit=crop&q=60',
            stats: 'مجتمع نشط',
            desc: 'بيع وصفات حصرية وفيديوهات تعليمية للطهي المنزلي الاحترافي.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <section className="bg-primary-900 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-5xl font-bold mb-6 font-heading">قصص نجاح ملهمة</h1>
                    <p className="text-xl opacity-80 max-w-2xl mx-auto">
                        شاهد كيف يستخدم آلاف المبدعين منصتنا لبناء مشاريعهم الرقمية وتحقيق أحلامهم.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {showcases.map((item, idx) => (
                            <div key={idx} className="group rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 bg-white">
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-700">
                                        {item.type}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-action-blue transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <FiUser /> <span>{item.owner}</span>
                                        <span className="mx-2">•</span>
                                        <FiStar className="text-yellow-400" /> <span>{item.stats}</span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {item.desc}
                                    </p>
                                    <Link href="#" className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-primary-50 text-primary-600 rounded-lg font-bold transition-colors">
                                        زيارة المتجر <FiExternalLink />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 bg-gray-50 rounded-3xl p-12 text-center">
                        <h2 className="text-3xl font-bold mb-6">هل لديك فكرة مشروع؟</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            لا تدع أفكارك تبقى حبيسة الأدراج. ابدأ اليوم وحول شغفك إلى مشروع حقيقي.
                        </p>
                        <Link href="/register" className="btn btn-primary text-lg px-10 py-4 shadow-xl">
                            ابدأ قصتك الآن
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
