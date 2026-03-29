'use client';

import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-subtle py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl border border-gray-100 shadow-sm" dir="rtl">
        <h1 className="text-3xl font-bold text-ink mb-8">سياسة الكوكيز (Cookies Policy)</h1>
        <div className="prose prose-emerald max-w-none text-muted leading-relaxed">
          <p>نحن نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على منصة تمالين. هذه الملفات تساعدنا في:</p>
          <ul className="list-disc pr-6 mt-4 space-y-2">
            <li>بقاءك مسجلاً في حسابك الشخصي.</li>
            <li>فهم كيفية استخدامك للموقع لتطوير المميزات.</li>
            <li>تأمين العمليات المالية وحمايتها من الاحتيال.</li>
          </ul>
          <p className="mt-6">باستخدامك للمنصة، أنت توافق على استخدامنا لملفات تعريف الارتباط وفقاً لهذه السياسة.</p>
        </div>
      </div>
    </div>
  );
}
