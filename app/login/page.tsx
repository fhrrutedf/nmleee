'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            setLoading(true);

            // Let NextAuth handle the redirect automatically
            await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                callbackUrl: '/dashboard',
                redirect: true, // Let NextAuth redirect automatically
            });

            // This code won't execute if redirect succeeds
        } catch (err: any) {
            setLoading(false);
            setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark py-12 px-4 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8">
                {/* Logo/Title */}
                <div className="text-center animate-fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">مرحباً بعودتك!</h1>
                    <p className="text-text-muted">سجل دخولك لإدارة منصتك</p>
                </div>

                {/* Login Form */}
                <div className="card shadow-xl animate-scale-in border border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
                                <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="label">
                                <FiMail className="inline ml-2" />
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">
                                <FiLock className="inline ml-2" />
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {/* Forgot Password */}
                        <div className="text-left">
                            <Link href="/forgot-password" className="text-action-blue hover:text-blue-700 text-sm font-medium transition-colors">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
                        <p className="text-text-muted">
                            ليس لديك حساب؟{' '}
                            <Link href="/register" className="text-action-blue hover:text-blue-700 font-bold transition-colors">
                                أنشئ حسابك المجاني
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Link href="/" className="text-text-muted hover:text-primary-charcoal dark:hover:text-white transition-colors text-sm">
                        ← العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
