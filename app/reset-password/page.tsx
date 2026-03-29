'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import showToast from '@/lib/toast';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !email) {
            showToast.error('رابط غير صالح أو مفقود');
            return;
        }

        if (password.length < 8) {
            showToast.error('كلمة المرور يجب أن لا تقل عن 8 أحرف');
            return;
        }

        if (password !== confirmPassword) {
            showToast.error('كلمات المرور غير متطابقة');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password })
            });

            if (res.ok) {
                setSuccess(true);
                showToast.success('تم تغيير كلمة المرور بنجاح!');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                const data = await res.json();
                showToast.error(data.error || 'فشل إعادة تعيين كلمة المرور');
            }
        } catch (error) {
            showToast.error('حدث خطأ أثناء الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="text-center p-8 bg-white dark:bg-card-white rounded-3xl shadow-sm max-w-md w-full border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAlertCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-4 dark:text-white">رابط غير صالح</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">رابط إعادة التعيين هذا غير صالح أو قد انتهت صلاحيته. يرجى طلب رابط جديد.</p>
                <button onClick={() => router.push('/forgot-password')} className="btn btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    <FiArrowRight /> اطلب رابطاً جديداً
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center p-8 bg-white dark:bg-card-white rounded-3xl shadow-sm max-w-md w-full border border-gray-100 dark:border-gray-800 animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-4 dark:text-white">تم بنجاح!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">لقد تم تحديث كلمة المرور الخاصة بك. سيتم تحويلك لصفحة تسجيل الدخول تلقائياً.</p>
                <button onClick={() => router.push('/login')} className="btn btn-primary w-full py-4 rounded-xl font-bold">
                    تسجيل الدخول الآن
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full animate-fade-in-up">
            <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="h-2 w-full bg-gradient-to-r from-accent to-purple-600"></div>
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent-50 dark:bg-blue-900/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-800/30">
                            <FiLock size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إعادة تعيين كلمة المرور</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pr-11 font-semibold focus:ring-2 focus:ring-accent outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تأكيد كلمة المرور</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 font-semibold focus:ring-2 focus:ring-accent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-4 rounded-xl text-lg font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>جاري التحديث...</span>
                                </div>
                            ) : 'تحديث كلمة المرور'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold ">جاري التحميل...</p>
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
