export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <section className="bg-gray-900 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
                    <p className="text-gray-400">نحن نلتزم بحماية بياناتك الشخصية</p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 prose prose-lg text-gray-700">
                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">1. المعلومات التي نجمعها</h2>
                    <p className="mb-6">
                        نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل (مثل الاسم، البريد الإلكتروني، ومعلومات الدفع) وكذا البيانات التي نجمعها تلقائياً عند استخدام خدماتنا.
                    </p>

                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">2. كيف نستخدم معلوماتك</h2>
                    <p className="mb-6">
                        نستخدم البيانات لتقديم خدماتنا وتحسينها، معالجة المعاملات، إرسال التنبيهات، ومنع الاحتيال.
                    </p>

                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">3. مشاركة البيانات</h2>
                    <p className="mb-6">
                        لا نقوم ببيع بياناتك لأطراف ثالثة. قد نشارك بعض البيانات مع مقدمي الخدمات الموثوقين (مثل بوابات الدفع والاستضافة) فقط لغرض تشغيل المنصة.
                    </p>

                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">4. أمن المعلومات</h2>
                    <p className="mb-6">
                        نستخدم تدابير أمنية متقدمة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الكشف.
                    </p>

                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">5. ملفات تعريف الارتباط (Cookies)</h2>
                    <p className="mb-6">
                        نستخدم ملفات تعريف الارتباط لتحسين تجربتك، تحليل حركة المرور، وتخصيص المحتوى.
                    </p>

                    <h2 className="text-2xl font-bold text-primary-charcoal mb-4">6. حقوقك</h2>
                    <p className="mb-6">
                        لديك الحق في الوصول إلى بياناتك الشخصية، تصحيحها، أو طلب حذفها في أي وقت عبر التواصل معنا.
                    </p>
                </div>
            </section>
        </div>
    );
}
