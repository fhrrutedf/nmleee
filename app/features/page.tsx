import { FiShoppingBag, FiCreditCard, FiBarChart2, FiGlobe, FiSmartphone, FiShield, FiUsers, FiCpu } from 'react-icons/fi';
import Link from 'next/link';

export default function FeaturesPage() {
    const features = [
        {
            icon: <FiShoppingBag className="text-4xl text-blue-600" />,
            title: 'متجر إلكتروني متكامل',
            description: 'احصل على متجر خاص بك بهوية علامتك التجارية، مع صفحات منتجات احترافية وسلة تسوق سلسة.'
        },
        {
            icon: <FiCreditCard className="text-4xl text-green-600" />,
            title: 'بوابات دفع عالمية ومحلية',
            description: 'اقبل المدفوعات عبر Visa, MasterCard, PayPal, وعملات رقمية، بالإضافة إلى المحافظ المحلية.'
        },
        {
            icon: <FiBarChart2 className="text-4xl text-purple-600" />,
            title: 'لوحة تحكم وتحليلات',
            description: 'تابع مبيعاتك، زوارك، وأداء منتجاتك من خلال لوحة تحكم سهلة الاستخدام وتقارير مفصلة.'
        },
        {
            icon: <FiGlobe className="text-4xl text-orange-600" />,
            title: 'دعم متعدد اللغات والعملات',
            description: 'بع منتجاتك للعالم أجمع مع دعم كامل للغات المتعددة والعملات المختلفة.'
        },
        {
            icon: <FiSmartphone className="text-4xl text-indigo-600" />,
            title: 'متوافق مع الجوال',
            description: 'تجربة مستخدم ممتازة على جميع الأجهزة، مما يضمن سهولة الشراء لعملائك من هواتفهم.'
        },
        {
            icon: <FiShield className="text-4xl text-red-600" />,
            title: 'حماية وتشفير',
            description: 'نظام حماية متقدم لمنتجاتك الرقمية يمنع التحميل غير المصرح به ويحمي حقوقك.'
        },
        {
            icon: <FiUsers className="text-4xl text-teal-600" />,
            title: 'نظام المسوقين (Affiliate)',
            description: 'دع الآخرين يسوقون لمنتجاتك مقابل عمولة تحددها أنت، وضاعف مبيعاتك.'
        },
        {
            icon: <FiCpu className="text-4xl text-pink-600" />,
            title: 'أتمتة المهام',
            description: 'أرسل المنتجات تلقائياً بعد الدفع، واربط متجرك مع تطبيقات خارجية عبر Zapier.'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-primary-900 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-5xl font-bold mb-6 font-heading">مميزات تفوق التوقعات</h1>
                    <p className="text-xl opacity-80 max-w-2xl mx-auto">
                        كل ما تحتاجه لنجاح مشروعك الرقمي في منصة واحدة قوية ومرنة.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-start p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow bg-gray-50 hover:bg-white">
                                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-primary-charcoal">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-4xl font-bold mb-8">عملنا سهل، ونتكامل مع أدواتك المفضلة</h2>
                    <p className="text-xl opacity-70 mb-12 max-w-3xl mx-auto">
                        لا داعي لتغيير طريقة عملك. منصتنا تتكامل بسلاسة مع الأدوات التي تستخدمها يومياً.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Fake Logos for demo */}
                        <div className="text-2xl font-bold border border-white/20 px-6 py-3 rounded-lg">Google Analytics</div>
                        <div className="text-2xl font-bold border border-white/20 px-6 py-3 rounded-lg">Zoom</div>
                        <div className="text-2xl font-bold border border-white/20 px-6 py-3 rounded-lg">Stripe</div>
                        <div className="text-2xl font-bold border border-white/20 px-6 py-3 rounded-lg">Mailchimp</div>
                        <div className="text-2xl font-bold border border-white/20 px-6 py-3 rounded-lg">Zapier</div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-action-blue text-white text-center">
                <div className="container-custom">
                    <h2 className="text-4xl font-bold mb-8">هل أنت مستعد لتجربة هذه المميزات؟</h2>
                    <Link href="/register" className="btn bg-white text-action-blue hover:bg-gray-100 text-xl px-12 py-4 shadow-lg rounded-full">
                        أنشئ حسابك المجاني الآن
                    </Link>
                </div>
            </section>
        </div>
    );
}
