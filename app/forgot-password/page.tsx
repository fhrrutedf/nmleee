'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowRight, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function ForgotPasswordPage() {
    const router = useRouter();
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light relative overflow-hidden py-12 px-4">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-700/10 rounded-xl blur-[80px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-xl blur-[100px] -z-10 pointer-events-none"></div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo/Title */}
                <motion.div variants={fadeInUp} className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6">
                        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 shadow-accent/20">
                            <span className="text-3xl font-bold">م</span>
                        </div>
                    </Link>
                    <h1 className="text-4xl font-bold text-emerald-600 mb-3">نسيت كلمة المرور؟</h1>
                    <p className="text-text-muted text-lg">أدخل بريدك الإلكتروني لاستعادة الوصول لحسابك</p>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-lg shadow-emerald-600/20 border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-inner">
                                    <FiCheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">تم الإرسال بنجاح!</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابطاً لاستعادة كلمة المرور خلال دقائق.
                                    <span className="block mt-2 text-sm text-gray-400">(تحقق من مجلد الرسائل المزعجة Spam)</span>
                                </p>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
                                >
                                    العودة لتسجيل الدخول
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative group">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">البريد الإلكتروني</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 pr-12 font-semibold focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all ltr"
                                                placeholder="name@example.com"
                                            />
                                            <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-600 transition-colors" />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3 shadow-lg shadow-emerald-600/20">
                                            <FiAlertCircle className="mt-0.5 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full btn btn-primary py-4 rounded-xl text-lg font-bold shadow-lg shadow-emerald-600/20 shadow-accent/20 hover:shadow-accent/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none shadow-accent/30"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-xl animate-spin"></div>
                                                جاري الإرسال...
                                            </>
                                        ) : (
                                            <>
                                                <span>إرسال رابط الاستعادة</span>
                                                <FiArrowRight className="rotate-180" />
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center pt-6 border-t border-gray-100">
                                        <Link href="/login" className="text-sm font-bold text-text-muted hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 group">
                                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                            العودة لتسجيل الدخول
                                        </Link>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Back Link */}
                <motion.div variants={fadeInUp} className="text-center mt-8">
                    <Link href="/" className="text-text-muted hover:text-emerald-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 group">
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        العودة للمنصة الرئيسية
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
