import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'شروط الاستخدام | منصة مناسة الرقمية',
    description: 'شروط وأحكام استخدام منصة مناسة الرقمية. يرجى قراءة هذه الشروط بعناية قبل استخدام الخدمات.',
    alternates: { canonical: 'https://manasadigital.com/terms' },
};

const lastUpdated = '08 مايو 2026';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A]" dir="rtl">
            {/* Hero */}
            <section className="relative bg-gradient-to-b from-gray-900 to-[#0A0A0A] text-white py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.08),transparent_60%)]" />
                <div className="max-w-4xl mx-auto px-6 text-center relative">
                    <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm mb-6">
                        📄 الشروط والأحكام
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">شروط الاستخدام</h1>
                    <p className="text-gray-400 text-lg">
                        آخر تحديث: <span className="text-white font-medium">{lastUpdated}</span>
                    </p>
                    <nav aria-label="breadcrumb" className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-violet-400 transition-colors">الرئيسية</Link>
                        <span>/</span>
                        <span className="text-gray-300">شروط الاستخدام</span>
                    </nav>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-4xl mx-auto px-6 space-y-12 text-gray-300">

                    {/* مقدمة */}
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6">
                        <p className="leading-relaxed">
                            باستخدامك منصة <strong className="text-white">مناسة الرقمية</strong> (manasadigital.com)، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                            إذا كنت لا توافق على أي من هذه الشروط، يرجى التوقف عن استخدام المنصة فوراً.
                        </p>
                    </div>

                    <TermsSection num="1" title="تعريف الخدمة">
                        <p>
                            منصة مناسة الرقمية هي سوق إلكتروني يتيح للبائعين (المنشئين) رفع وبيع المنتجات الرقمية
                            (كتب، كورسات، قوالب، ملفات) للمشترين. تعمل المنصة كوسيط تقني وليست طرفاً في العقد
                            بين البائع والمشتري.
                        </p>
                    </TermsSection>

                    <TermsSection num="2" title="شروط إنشاء الحساب">
                        <ul>
                            <li>يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام المنصة</li>
                            <li>يجب تقديم معلومات دقيقة وصحيحة عند التسجيل</li>
                            <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور وأمان الحساب</li>
                            <li>يُحظر إنشاء أكثر من حساب واحد لنفس الشخص أو الكيان</li>
                            <li>يُحظر مشاركة بيانات الدخول مع أطراف أخرى</li>
                        </ul>
                    </TermsSection>

                    <TermsSection num="3" title="شروط البائعين (المنشئين)">
                        <ul>
                            <li>يجب أن تكون المنتجات المرفوعة من إنتاجك الأصلي أو لديك الحق القانوني لبيعها</li>
                            <li>يُحظر رفع أي محتوى ينتهك حقوق الملكية الفكرية لأطراف أخرى</li>
                            <li>يُحظر رفع محتوى مسيء أو غير قانوني أو إباحي</li>
                            <li>يجب أن يكون وصف المنتج دقيقاً ويعكس محتواه الفعلي</li>
                            <li>تحتفظ المنصة بحق إزالة أي منتج يخالف هذه الشروط دون سابق إنذار</li>
                        </ul>
                        <div className="mt-4 bg-white/5 rounded-xl p-4 text-sm">
                            <strong className="text-white">العمولات:</strong> تُحدَّد عمولات المنصة وفق خطة الاشتراك المختارة.
                            تُودَع الأرباح في رصيد البائع بعد فترة ضمان 7 أيام من تاريخ الشراء.
                        </div>
                    </TermsSection>

                    <TermsSection num="4" title="شروط المشترين">
                        <ul>
                            <li>المنتجات الرقمية غير قابلة للاسترجاع بعد التحميل إلا في حالات الغش أو المحتوى الخاطئ</li>
                            <li>يُمنع إعادة توزيع أو بيع المنتجات المشتراة لأطراف أخرى</li>
                            <li>الترخيص الممنوح هو للاستخدام الشخصي فقط ما لم يُذكر خلاف ذلك</li>
                            <li>يُحظر استخدام المنتجات لأغراض غير قانونية</li>
                        </ul>
                    </TermsSection>

                    <TermsSection num="5" title="المدفوعات والأسعار">
                        <ul>
                            <li>جميع الأسعار تُعرض بالدولار الأمريكي (USD) ما لم يُذكر خلاف ذلك</li>
                            <li>تُعالَج المدفوعات عبر بوابات دفع آمنة (OxaPay، SpaceRemit وغيرها)</li>
                            <li>المنصة غير مسؤولة عن رسوم التحويل المصرفي الخارجية</li>
                            <li>الحد الأدنى للسحب يُحدَّد وفق إعدادات المنصة الحالية</li>
                            <li>تُودَع مبالغ السحب خلال 2-5 أيام عمل بعد الموافقة</li>
                        </ul>
                    </TermsSection>

                    <TermsSection num="6" title="حقوق الملكية الفكرية">
                        <p>
                            تحتفظ بحقوق الملكية الكاملة لمحتواك. بتحميلك المحتوى على المنصة، تمنحنا ترخيصاً
                            محدوداً وغير حصري لعرضه وتسليمه للمشترين ضمن إطار المنصة.
                        </p>
                        <p className="mt-3">
                            العلامات التجارية ومحتوى المنصة نفسها (التصاميم، الكود، الشعار) محمية بحقوق النشر
                            ولا يجوز استخدامها دون إذن كتابي.
                        </p>
                    </TermsSection>

                    <TermsSection num="7" title="إنهاء الحساب">
                        <p>نحتفظ بالحق في تعليق أو إنهاء حسابك فوراً وبدون إشعار مسبق في الحالات التالية:</p>
                        <ul>
                            <li>انتهاك أي من هذه الشروط</li>
                            <li>الاشتباه في نشاط احتيالي أو غسيل أموال</li>
                            <li>رفع محتوى غير قانوني أو ضار</li>
                            <li>إساءة استخدام نظام الشكاوى أو التقييمات</li>
                        </ul>
                        <p className="mt-3">عند الإنهاء، يحق لك سحب رصيدك المتاح خلال 30 يوماً.</p>
                    </TermsSection>

                    <TermsSection num="8" title="حدود المسؤولية">
                        <p>
                            تُقدَّم الخدمة &quot;كما هي&quot; (as-is). لا تتحمل المنصة المسؤولية عن:
                        </p>
                        <ul>
                            <li>جودة أو دقة المنتجات المباعة من قِبل البائعين</li>
                            <li>الأضرار غير المباشرة أو التبعية</li>
                            <li>انقطاع الخدمة لأسباب خارجة عن إرادتنا</li>
                            <li>خسائر ناجمة عن استخدام المنتجات الرقمية</li>
                        </ul>
                    </TermsSection>

                    <TermsSection num="9" title="القانون المطبَّق">
                        <p>
                            تخضع هذه الشروط لأحكام القانون المعمول به في المملكة العربية السعودية.
                            أي نزاع ينشأ عن استخدام المنصة يُحسم وفق الإجراءات القانونية المعمول بها.
                        </p>
                    </TermsSection>

                    <TermsSection num="10" title="التواصل معنا">
                        <p>لأي استفسار حول هذه الشروط:</p>
                        <div className="mt-4 flex flex-col gap-2 text-sm">
                            <div>📧 <a href="mailto:legal@manasadigital.com" className="text-violet-400">legal@manasadigital.com</a></div>
                            <div>🌐 <a href="https://manasadigital.com/contact" className="text-violet-400">manasadigital.com/contact</a></div>
                        </div>
                    </TermsSection>

                    <div className="border-t border-white/10 pt-8 flex flex-wrap gap-4 text-sm">
                        <Link href="/privacy" className="text-violet-400 hover:underline">🔒 سياسة الخصوصية</Link>
                        <Link href="/contact" className="text-violet-400 hover:underline">✉️ تواصل معنا</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function TermsSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div className="scroll-mt-24" id={`section-${num}`}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm font-bold flex items-center justify-center">
                    {num}
                </span>
                {title}
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-3 pr-11 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pr-5">
                {children}
            </div>
        </div>
    );
}
