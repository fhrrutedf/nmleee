'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiAtSign } from 'react-icons/fi';
import { apiPost, handleApiError } from '@/lib/safe-fetch';
import showToast from '@/lib/toast';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            showToast.error('كلمات المرور غير متطابقة');
            return;
        }

        if (formData.password.length < 6) {
            showToast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            showToast.error('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
            return;
        }

        setLoading(true);

        try {
            await apiPost('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                username: formData.username.toLowerCase(),
                password: formData.password,
            });

            showToast.success('تم إنشاء حسابك بنجاح! جاري التحويل...');
            setTimeout(() => {
                router.push('/login?registered=true');
            }, 1000);
        } catch (err: any) {
            console.error('Registration failed:', err);
            showToast.error(handleApiError(err));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark py-12 px-4 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8">
                {/* Logo/Title */}
                <div className="text-center animate-fade-in">
                    <h1 className="text-4xl font-bold gradient-text mb-2">أنشئ حسابك المجاني</h1>
                    <p className="text-text-muted">ابدأ رحلتك في بيع المنتجات الرقمية</p>
                </div>

                {/* Register Form */}
                <div className="card shadow-xl animate-scale-in border border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3">
                                <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="label">
                                <FiUser className="inline ml-2" />
                                الاسم الكامل
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="محمد أحمد"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

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

                        {/* Username */}
                        <div>
                            <label className="label">
                                <FiAtSign className="inline ml-2" />
                                اسم المستخدم (للرابط الشخصي)
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                            />
                            <p className="text-xs text-text-muted mt-1 dir-ltr text-right">
                                platform.com/{formData.username || 'username'}
                            </p>
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

                        {/* Confirm Password */}
                        <div>
                            <label className="label">
                                <FiLock className="inline ml-2" />
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب مجاني'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
                        <p className="text-text-muted">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-action-blue hover:text-blue-700 font-bold transition-colors">
                                سجل دخولك
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
