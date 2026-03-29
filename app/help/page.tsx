'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-subtle py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-ink mb-6">مركز المساعدة</h1>
        <p className="text-muted text-lg mb-12">نحن هنا للإجابة على استفساراتك ومساعدتك في بناء متجرك الرقمي.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right" dir="rtl">
          <div className="card">
            <h3 className="text-xl font-bold mb-3">كيف أبدأ؟</h3>
            <p className="text-sm text-muted">يمكنك البدء بإنشاء حساب بائع ورفع أول منتج رقمي لك في أقل من 5 دقائق.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-3">طرق الدفع</h3>
            <p className="text-sm text-muted">ندعم الدفع عبر البطاقات البنكية، والمحافظ الإلكترونية، والعملات الرقمية.</p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/contact" className="btn btn-primary px-8 py-3">تواصل مع الدعم الفني</Link>
        </div>
      </div>
    </div>
  );
}
