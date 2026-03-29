'use client';

import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    { q: "ما هي تمالين؟", a: "تمالين هي منصة متكاملة لبيع المنتجات الرقمية والكورسات للمبدعين العرب." },
    { q: "ما هي نسبة العموله؟", a: "نأخذ عمولة 5% فقط على كل عملية بيع ناجحة." },
    { q: "كيف أستلم أرباحي؟", a: "يمكنك سحب أرباحك عبر بايونير، المحافظ الإلكترونية، أو العملات الرقمية." }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#10B981] mb-12 text-center">الأسئلة الشائعة</h1>
        <div className="space-y-6" dir="rtl">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-bold text-[#10B981] mb-2">{faq.q}</h3>
              <p className="text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
