import { FiSearch, FiHelpCircle, FiBook, FiMessageCircle, FiMail } from 'react-icons/fi';
import Link from 'next/link';

export default function SupportPage() {
    const faqs = [
        {
            question: 'كيف أبدأ في بيع منتجاتي؟',
            answer: 'بعد إنشاء حساب، اذهب إلى لوحة التحكم واضغط على "إضافة منتج جديد". املأ التفاصيل وارفع ملف المنتج وستكون جاهزاً!'
        },
        {
            question: 'ما هي نسبة العمولة؟',
            answer: 'نحن نأخذ عمولة 10% فقط، وهي من أقل النسب في السوق. 90% من الأرباح تذهب إليك مباشرة.'
        },
        {
            question: 'كيف أستلم أرباحي؟',
            answer: 'يمكنك طلب سحب الأرباح من لوحة التحكم. نحن ندعم التحويل البنكي وPayPal.'
        },
        {
            question: 'هل يمكنني بيع دورات مباشرة؟',
            answer: 'نعم! المنصة تدعم بيع الدورات التدريبية المسجلة والمباشرة. يمكنك حجز مواعيد مع طلابك.'
        },
        {
            question: 'كيف أتابع مبيعاتي؟',
            answer: 'لوحة التحكم توفر تحليلات شاملة لمبيعاتك، عدد الزيارات، والأرباح بشكل يومي وشهري.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-4">مركز الدعم</h1>
                    <p className="text-xl text-gray-600">كيف يمكننا مساعدتك اليوم؟</p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="ابحث عن إجابة..."
                            className="input w-full pr-12 py-4 text-lg"
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Link href="/contact" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-center group">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FiMessageCircle className="text-3xl text-primary-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">تواصل معنا</h3>
                        <p className="text-gray-600 text-sm">أرسل رسالة للدعم الفني</p>
                    </Link>

                    <Link href="/about" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-center group">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FiBook className="text-3xl text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">دليل الاستخدام</h3>
                        <p className="text-gray-600 text-sm">تعلم كيفية استخدام المنصة</p>
                    </Link>

                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-center group">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FiMail className="text-3xl text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">البريد الإلكتروني</h3>
                        <p className="text-gray-600 text-sm">support@tmleen.com</p>
                    </div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <FiHelpCircle className="text-primary-600" />
                        الأسئلة الشائعة
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b pb-6 last:border-b-0">
                                <h3 className="font-bold text-lg mb-3 text-gray-900">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-700 rounded-xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">لم تجد ما تبحث عنه؟</h3>
                    <p className="text-lg mb-6">فريق الدعم جاهز لمساعدتك 24/7</p>
                    <Link
                        href="/contact"
                        className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        تواصل معنا الآن
                    </Link>
                </div>
            </div>
        </div>
    );
}
