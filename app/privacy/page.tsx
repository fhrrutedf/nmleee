import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'سياسة الخصوصية | منصة مناسة الرقمية',
    description: 'سياسة الخصوصية الشاملة لمنصة مناسة الرقمية. نلتزم بحماية بياناتك وفق أعلى المعايير الدولية ومتطلبات نظام حماية البيانات الشخصية.',
    alternates: { canonical: 'https://manasadigital.com/privacy' },
};

const lastUpdated = '08 مايو 2026';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A]" dir="rtl">
            {/* Hero */}
            <section className="relative bg-gradient-to-b from-gray-900 to-[#0A0A0A] text-white py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08),transparent_60%)]" />
                <div className="max-w-4xl mx-auto px-6 text-center relative">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm mb-6">
                        🔒 حماية البيانات الشخصية
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
                    <p className="text-gray-400 text-lg">
                        آخر تحديث: <span className="text-white font-medium">{lastUpdated}</span>
                    </p>
                    <nav aria-label="breadcrumb" className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-emerald-400 transition-colors">الرئيسية</Link>
                        <span>/</span>
                        <span className="text-gray-300">سياسة الخصوصية</span>
                    </nav>
                </div>
            </section>

            {/* محتوى السياسة */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-6 space-y-12 text-gray-300">

                    {/* تنبيه PDPL */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                        <h2 className="text-emerald-400 font-bold text-lg mb-2">📋 الامتثال لنظام حماية البيانات الشخصية (PDPL)</h2>
                        <p className="text-sm leading-relaxed">
                            تلتزم منصة مناسة الرقمية بأحكام نظام حماية البيانات الشخصية السعودي الصادر بالمرسوم الملكي رقم م/19 لعام 1443هـ،
                            واللوائح والتوجيهات الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).
                        </p>
                    </div>

                    <Section num="1" title="المعلومات التي نجمعها">
                        <p>نجمع البيانات التالية عند استخدامك للمنصة:</p>
                        <ul>
                            <li><strong>بيانات التسجيل:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، كلمة المرور (مشفّرة)</li>
                            <li><strong>بيانات الدفع:</strong> تُشفَّر ببروتوكول AES-256 ولا تُخزَّن بصيغتها الأصلية أبداً</li>
                            <li><strong>بيانات الاستخدام:</strong> الصفحات التي تزورها، الوقت، الجهاز، عنوان IP</li>
                            <li><strong>المحتوى الذي ترفعه:</strong> الملفات الرقمية والصور المرتبطة بمنتجاتك</li>
                            <li><strong>بيانات المعاملات:</strong> الطلبات والمدفوعات والمسترجعات</li>
                        </ul>
                    </Section>

                    <Section num="2" title="الأساس القانوني لمعالجة البيانات">
                        <p>نعالج بياناتك استناداً إلى الأسس القانونية التالية وفق نظام PDPL:</p>
                        <ul>
                            <li><strong>الموافقة الصريحة:</strong> عند تسجيلك في المنصة</li>
                            <li><strong>تنفيذ العقد:</strong> لمعالجة الطلبات والمدفوعات</li>
                            <li><strong>الالتزامات القانونية:</strong> الامتثال للأنظمة الضريبية والمالية</li>
                            <li><strong>المصلحة المشروعة:</strong> منع الاحتيال وتحسين الأمان</li>
                        </ul>
                    </Section>

                    <Section num="3" title="كيف نستخدم بياناتك">
                        <ul>
                            <li>تشغيل المنصة وتقديم الخدمات</li>
                            <li>معالجة المدفوعات وتحويل الأرباح للبائعين</li>
                            <li>إرسال إشعارات المعاملات والتحديثات الجوهرية</li>
                            <li>منع الاحتيال وحماية أمن الحسابات</li>
                            <li>تحسين تجربة المستخدم وأداء المنصة</li>
                            <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                        </ul>
                    </Section>

                    <Section num="4" title="مشاركة البيانات مع أطراف ثالثة">
                        <p>لا نبيع بياناتك أبداً. قد نشارك بيانات محدودة مع:</p>
                        <ul>
                            <li><strong>بوابات الدفع:</strong> OxaPay، SpaceRemit — لمعالجة المعاملات فقط</li>
                            <li><strong>خدمات الاستضافة:</strong> Vercel (الكود)، Supabase (قاعدة البيانات)</li>
                            <li><strong>خدمات البريد:</strong> Resend — لإرسال الإشعارات التشغيلية</li>
                            <li><strong>الجهات الحكومية:</strong> عند الطلب الرسمي وفق الإجراءات القانونية</li>
                        </ul>
                    </Section>

                    <Section num="5" title="أمان البيانات">
                        <ul>
                            <li>تشفير AES-256 لجميع البيانات المالية الحساسة</li>
                            <li>اتصالات HTTPS مع HSTS Preload</li>
                            <li>Row Level Security (RLS) في قاعدة البيانات — كل مستخدم يرى بياناته فقط</li>
                            <li>Rate Limiting على جميع نقاط API لمنع هجمات Brute Force</li>
                            <li>فحص المحتوى عند رفع الملفات</li>
                        </ul>
                    </Section>

                    <Section num="6" title="ملفات تعريف الارتباط (Cookies)">
                        <p>نستخدم ثلاثة أنواع من الكوكيز:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse mt-4">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-right py-2 pr-4 text-white">النوع</th>
                                        <th className="text-right py-2 pr-4 text-white">الغرض</th>
                                        <th className="text-right py-2 pr-4 text-white">المدة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        ['ضرورية', 'تسجيل الدخول والجلسة والأمان', 'حتى إغلاق المتصفح'],
                                        ['تحليلية', 'تحسين أداء المنصة وفهم سلوك الاستخدام', '12 شهراً'],
                                        ['تسويقية', 'عرض محتوى مخصص وإعلانات ذات صلة', '6 أشهر'],
                                    ].map(([type, purpose, duration]) => (
                                        <tr key={type}>
                                            <td className="py-2 pr-4 font-medium text-emerald-400">{type}</td>
                                            <td className="py-2 pr-4">{purpose}</td>
                                            <td className="py-2 pr-4 text-gray-400">{duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <Section num="7" title="حقوقك وفق نظام PDPL">
                        <p>يمنحك نظام حماية البيانات الشخصية الحقوق التالية:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {[
                                ['📋', 'حق الاطلاع', 'الوصول إلى جميع بياناتك المخزّنة'],
                                ['✏️', 'حق التصحيح', 'تصحيح أي بيانات غير دقيقة'],
                                ['🗑️', 'حق الحذف', 'طلب حذف حسابك وبياناتك بالكامل'],
                                ['📦', 'حق النقل', 'تصدير بياناتك بصيغة قابلة للقراءة'],
                                ['🚫', 'حق الاعتراض', 'الاعتراض على معالجة معينة لبياناتك'],
                                ['⏸️', 'حق التقييد', 'تقييد معالجة بياناتك في حالات معينة'],
                            ].map(([icon, right, desc]) => (
                                <div key={right} className="flex gap-3 bg-white/5 rounded-xl p-4">
                                    <span className="text-xl">{icon}</span>
                                    <div>
                                        <div className="font-semibold text-white text-sm">{right}</div>
                                        <div className="text-gray-400 text-xs mt-0.5">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm">
                            لممارسة أي من هذه الحقوق، تواصل معنا على:{' '}
                            <a href="mailto:privacy@manasadigital.com" className="text-emerald-400 hover:underline">
                                privacy@manasadigital.com
                            </a>
                        </p>
                    </Section>

                    <Section num="8" title="الاحتفاظ بالبيانات">
                        <ul>
                            <li>بيانات الحساب النشط: طوال فترة النشاط</li>
                            <li>سجلات المعاملات: 7 سنوات (متطلبات ضريبية)</li>
                            <li>سجلات الأمان: 90 يوماً</li>
                            <li>بيانات التسويق: حتى إلغاء الاشتراك</li>
                        </ul>
                    </Section>

                    <Section num="9" title="التغييرات على هذه السياسة">
                        <p>
                            قد نحدّث هذه السياسة دورياً. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار بارز في المنصة قبل 30 يوماً من تطبيقها.
                        </p>
                    </Section>

                    <Section num="10" title="التواصل معنا">
                        <p>
                            لأي استفسارات تتعلق بالخصوصية أو لممارسة حقوقك:
                        </p>
                        <div className="mt-4 flex flex-col gap-2 text-sm">
                            <div>📧 البريد: <a href="mailto:privacy@manasadigital.com" className="text-emerald-400">privacy@manasadigital.com</a></div>
                            <div>🌐 الموقع: <a href="https://manasadigital.com/contact" className="text-emerald-400">manasadigital.com/contact</a></div>
                        </div>
                    </Section>

                    {/* روابط سريعة */}
                    <div className="border-t border-white/10 pt-8 flex flex-wrap gap-4 text-sm">
                        <Link href="/terms" className="text-emerald-400 hover:underline">📄 شروط الاستخدام</Link>
                        <Link href="/cookies" className="text-emerald-400 hover:underline">🍪 سياسة الكوكيز</Link>
                        <Link href="/contact" className="text-emerald-400 hover:underline">✉️ تواصل معنا</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div className="scroll-mt-24" id={`section-${num}`}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-center">
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
