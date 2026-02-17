'use client';

import { FiCheck, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function PricingPage() {
    const plans = [
        {
            name: 'البداية',
            price: 'مجاناً',
            description: 'مثالية لتجربة المنصة والبدء في بيع أول منتج',
            features: [
                'عدد غير محدود من المنتجات',
                'عمولة منصة 10% فقط',
                'صفحة متجر احترافية',
                'دعم فني عبر البريد الإلكتروني',
                'استلام الأرباح شهرياً'
            ],
            missing: [
                'نطاق خاص (Domain)',
                'إزالة شعار المنصة',
                'تحليلات متقدمة',
                'كوبونات خصم'
            ],
            buttonText: 'ابدأ مجاناً',
            buttonLink: '/register',
            recommended: false
        },
        {
            name: 'المحترف',
            price: '$29 / شهرياً',
            description: 'لصناع المحتوى الجادين الذين يريدون تنمية أعمالهم',
            features: [
                'كل مميزات البداية',
                'عمولة منصة 5% فقط',
                'ربط نطاق خاص (Custom Domain)',
                'كوبونات خصم غير محدودة',
                'تحليلات مفصلة للمبيعات والزيارات',
                'دعم فني ذو أولوية'
            ],
            missing: [
                'إزالة شعار المنصة تماماً',
                'مدير حساب خاص'
            ],
            buttonText: 'اشترك الآن',
            buttonLink: '/register?plan=pro',
            recommended: true
        },
        {
            name: 'الشركات',
            price: '$99 / شهرياً',
            description: 'للشركات والمؤسسات التعليمية الكبيرة',
            features: [
                'كل مميزات المحترف',
                '0% عمولة منصة',
                'واجهة بيضاء (White Label)',
                'مدير حساب مخصص',
                'API للربط مع أنظمتك',
                'تصدير بيانات متقدم',
                'دعم فني عبر الهاتف'
            ],
            missing: [],
            buttonText: 'تواصل معنا',
            buttonLink: '/contact',
            recommended: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl font-bold text-primary-charcoal mb-6 font-heading">
                        خطط أسعار تناسب الجميع
                    </h1>
                    <p className="text-xl text-text-muted">
                        ابدأ مجاناً ورقّ حسابك كلما كبرت أعمالك. لا توجد رسوم خفية.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 transition-transform hover:-translate-y-2 ${plan.recommended ? 'border-action-blue scale-105 z-10' : 'border-transparent'}`}>
                            {plan.recommended && (
                                <div className="absolute top-0 right-0 left-0 bg-action-blue text-white text-center py-1 text-sm font-bold">
                                    الأكثر مبيعاً
                                </div>
                            )}
                            <div className="p-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold text-primary-charcoal mb-4">{plan.price}</div>
                                <p className="text-gray-500 mb-8">{plan.description}</p>

                                <Link href={plan.buttonLink} className={`block w-full py-3 rounded-lg text-center font-bold mb-8 transition-colors ${plan.recommended ? 'bg-action-blue text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                    {plan.buttonText}
                                </Link>

                                <div className="space-y-4">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3 text-gray-700">
                                            <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {plan.missing.map((missing, mIdx) => (
                                        <div key={mIdx} className="flex items-start gap-3 text-gray-400">
                                            <FiX className="mt-1 flex-shrink-0" />
                                            <span className="line-through">{missing}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">أسئلة شائعة</h2>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-2">هل يمكنني تغيير خطتي لاحقاً؟</h3>
                            <p className="text-gray-600">نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت من لوحة التحكم، وسيتم احتساب الفرق تلقائياً.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-2">كيف يتم تحويل الأرباح؟</h3>
                            <p className="text-gray-600">نقوم بتحويل الأرباح بشكل دوري (شهري أو أسبوعي حسب الخطة) إلى حسابك البنكي أو محفظتك الإلكترونية المفضلة.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg mb-2">هل أحتاج لبطاقة ائتمان للتسجيل؟</h3>
                            <p className="text-gray-600">لا، يمكنك البدء بالخطة المجانية دون الحاجة لإدخال أي بيانات دفع.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
