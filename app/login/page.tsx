'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield, FiArrowLeft } from 'react-icons/fi';
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

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        await signIn('google', { callbackUrl });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                callbackUrl,
                redirect: false,
            });

            setLoading(false);
            if (res?.error) {
                setError('البيانات غير صحيحة، يرجى التأكد من البريد وكلمة المرور.');
                return;
            } else if (res?.ok) {
                window.location.href = res.url || callbackUrl;
                return;
            }
        } catch (err: any) {
            setLoading(false);
            setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12 px-6 selection:bg-accent/20">
            {/* Minimalist Professional Accents */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-md w-full relative z-10"
            >
                {/* Brand Identity Header */}
                <motion.div variants={fadeInUp} className="text-center mb-12">
                     <Link href="/" className="inline-block mb-10 group">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-ink flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-ink/20 group-hover:scale-110 transition-transform">
                            ت
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black text-ink mb-4 tracking-tighter">مرحباً بعودتك</h1>
                    <p className="text-gray-400 font-bold">وصول آمن وسريع إلى لوحة تحكم متجرك.</p>
                </motion.div>

                {/* Login Terminal / Form Card */}
                <motion.div variants={fadeInUp} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[80px] pointer-events-none"></div>

                    {/* Social Authentication */}
                    <div className="space-y-4 mb-10">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-2xl border border-gray-100 bg-white hover:border-ink hover:shadow-xl transition-all duration-300 font-bold text-gray-700 active:scale-95"
                        >
                            {googleLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-200 border-t-ink rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="text-xs uppercase tracking-widest font-black">CONTINUE WITH GOOGLE</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center mb-10">
                        <div className="flex-1 border-t border-gray-100"></div>
                        <span className="px-5 text-[10px] font-black text-gray-300 uppercase tracking-widest">OR EMAIL</span>
                        <div className="flex-1 border-t border-gray-100"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3 mb-6"
                                >
                                    <FiAlertCircle size={16} className="shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="relative">
                                <FiMail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-ink font-bold placeholder:text-gray-300 focus:bg-white focus:border-ink focus:ring-4 focus:ring-ink/5 transition-all text-sm outline-none"
                                    placeholder="البريد الإلكتروني"
                                />
                            </div>

                            <div className="relative">
                                <FiLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-ink font-bold placeholder:text-gray-300 focus:bg-white focus:border-ink focus:ring-4 focus:ring-ink/5 transition-all text-sm outline-none"
                                    placeholder="كلمة المرور"
                                />
                            </div>
                        </div>

                        <div className="flex justify-start pt-2">
                             <Link href="/forgot-password" disableAnchor className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-ink transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl
                                ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-ink text-white hover:bg-black shadow-ink/20 active:scale-95'}
                            `}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In Now</span>
                                    <FiArrowLeft className="rotate-180" size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs font-bold">
                            لا تملك حساباً؟ {' '}
                            <Link href="/register" className="text-accent underline underline-offset-4 decoration-accent/30 hover:decoration-accent transition-all">
                                أنشئ حسابك مجاناً
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Secure Trust Footer */}
                <motion.div variants={fadeInUp} className="text-center mt-12 space-y-6">
                    <p className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <FiShield className="text-accent" /> 256-bit Encrypted Connection
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-ink text-xs font-bold transition-all group">
                         Back to Platform <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-accent rounded-full animate-spin"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
