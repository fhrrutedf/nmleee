'use client';

import Link from 'next/link';

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-surface py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-emerald-600 mb-6">قصص النجاح</h1>
        <p className="text-muted text-lg mb-16">انضم إلى آلاف المبدعين الذين بنوا إمبراطورياتهم الرقمية عبر تمالين.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right" dir="rtl">
          <div className="card border-emerald-100 bg-emerald-50/30">
            <div className="w-12 h-12 bg-emerald-700 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold mb-2">محمد أ. (مدرب برمجة)</h3>
            <p className="text-sm text-muted">"حققت أكثر من $5000 في أول شهر من بيع كورس رياكت على تمالين. الدفع كان سلساً جداً."</p>
          </div>
          <div className="card">
             <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <h3 className="text-xl font-bold mb-2">سارة م. (مصممة جرافيك)</h3>
            <p className="text-sm text-muted">"قوالب السوشيال ميديا الخاصة بي تباع يومياً بشكل آلي تماماً. تمالين وفرت عليّ عناء المتابعة اليدوية."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
