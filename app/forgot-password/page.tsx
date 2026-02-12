'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus('success');
            } else {
                const data = await res.json();
                throw new Error(data.error || 'حدث خطأ ما');
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">تم الإرسال بنجاح!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابطاً لاستعادة كلمة المرور خلال دقائق.
                        <br />
                        <span className="text-sm text-gray-400 block mt-2">(تحقق من مجلد الرسائل المزعجة Spam)</span>
                    </p>
                    <Link href="/login" className="btn btn-primary w-full block py-3">
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
                    <p className="text-gray-500">أدخل بريدك الإلكتروني لاستعادة الوصول لحسابك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            required
                            className="input w-full ltr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
                    >
                        {status === 'loading' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                جاري الإرسال...
                            </>
                        ) : (
                            'إرسال رابط الاستعادة'
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                            العودة لتسجيل الدخول
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
