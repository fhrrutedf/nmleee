'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

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
        <div className="min-h-screen flex items-center justify-center bg-bg-light relative overflow-hidden py-12 px-4 transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-action-blue/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo/Title */}
                <motion.div variants={fadeInUp} className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white shadow-xl shadow-action-blue/20"
                        >
                            <span className="text-3xl font-bold">م</span>
                        </motion.div>
                    </Link>
                    <h1 className="text-4xl font-bold text-primary-charcoal mb-3 font-heading">مرحباً بعودتك!</h1>
                    <p className="text-text-muted text-lg">سجل دخولك لإدارة متجرك ومنتجاتك</p>
                </motion.div>

                {/* Login Form */}
                <motion.div variants={fadeInUp} className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-action-blue/5 to-transparent rounded-bl-[100px] pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' }}
                                    className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm shadow-red-100"
                                >
                                    <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                                    <p className="font-medium text-sm leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
                        <div className="relative group">
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer"
                                placeholder=" "
                            />
                            <label htmlFor="email" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4 flex items-center gap-2">
                                <FiMail className="text-lg" />
                                البريد الإلكتروني
                            </label>
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <input
                                type="password"
                                id="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer"
                                placeholder=" "
                            />
                            <label htmlFor="password" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4 flex items-center gap-2">
                                <FiLock className="text-lg" />
                                كلمة المرور
                            </label>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-left py-1">
                            <Link href="/forgot-password" className="text-action-blue hover:text-blue-700 text-sm font-bold transition-colors inline-block relative border-b border-transparent hover:border-blue-700">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full text-lg py-5 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 shadow-xl text-white
                                ${loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-action-blue hover:bg-blue-700 shadow-action-blue/30'}
                            `}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    تسجيل الدخول
                                    <FiArrowRight className="rotate-180" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-text-muted font-medium">
                            ليس لديك حساب؟{' '}
                            <Link href="/register" className="text-action-blue hover:text-blue-700 font-bold transition-colors">
                                أنشئ حسابك المجاني
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Back to Home */}
                <motion.div variants={fadeInUp} className="text-center mt-8">
                    <Link href="/" className="text-text-muted hover:text-primary-charcoal transition-colors text-sm font-medium flex items-center justify-center gap-2 group">
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        العودة للمنصة
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
