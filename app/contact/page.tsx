'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // محاكاة إرسال
        await new Promise(resolve => setTimeout(resolve, 2000));

        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);

        // إخفاء رسالة النجاح بعد فترة
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden selection:bg-emerald-600/20">
            {/* Minimalist Professional Accents */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-600/5 rounded-xl blur-[150px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="text-center mb-24 max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-emerald-600 shadow-sm">
                        Strategic Support Unit
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold text-ink mb-10 tracking-tighter leading-[1.05]">
                        تحدث معنا <br/> <span className="text-emerald-600 underline underline-offset-[12px] decoration-accent/10">مباشرة</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-bold leading-relaxed">
                        سواء كان لديك استفسار تقني أو استراتيجي... فريقنا المتخصص في نمو المبدعين جاهز للرد عليك.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 xl:gap-12">
                    {/* Contact Info (Left Side - RTL) */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-6 lg:order-2"
                    >
                        {[
                            {
                                icon: <FiMail className="text-2xl text-emerald-600" />,
                                title: 'البريد الإلكتروني',
                                lines: ['support@tmleen.com', 'info@tmleen.com'],
                                bg: 'bg-gray-50',
                                delay: 0.1
                            },
                            {
                                icon: <FiPhone className="text-2xl text-emerald-600" />,
                                title: 'الدعم التقني',
                                lines: ['+966 50 123 4567'],
                                sub: 'السبت - الخميس: 9 صباحاً - 6 مساءً',
                                bg: 'bg-gray-50',
                                delay: 0.2
                            },
                            {
                                icon: <FiMapPin className="text-2xl text-emerald-600" />,
                                title: 'المقر الرقمي',
                                lines: ['عن بُعد، حول العالم العربي'],
                                bg: 'bg-gray-50',
                                delay: 0.3
                            }
                        ].map((info, idx) => (
                            <motion.div
                                key={idx}
                                variants={slideInRight}
                                whileHover={{ x: -10, scale: 1.02 }}
                                className="bg-white rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 border border-gray-50 flex items-start gap-6 group transition-all"
                            >
                                <div className={`w-14 h-14 ${info.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    {info.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-3 text-ink">{info.title}</h3>
                                    {info.lines.map((line, i) => (
                                        <p key={i} className="text-text-muted font-medium mb-1" dir={info.title === 'الهاتف الساخن' ? 'ltr' : 'rtl'}>{line}</p>
                                    ))}
                                    {info.sub && <p className="text-gray-400 text-sm mt-3">{info.sub}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Contact Form (Right Side - RTL) */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={slideInLeft}
                        className="lg:col-span-2 lg:order-1 relative"
                    >
                        <div className="bg-white rounded-[2.5rem] shadow-sm p-10 md:p-16 border border-gray-100 overflow-hidden relative">
                            {/* Decorative element inside form */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-bl-[100px] pointer-events-none"></div>

                            <h2 className="text-2xl font-bold mb-10 text-ink tracking-tight uppercase">SEND ENQUIRY</h2>

                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full px-5 py-4 text-ink bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all peer"
                                            placeholder=" "
                                            required
                                        />
                                        <label htmlFor="name" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                            الاسم الكامل <span className="text-red-500">*</span>
                                        </label>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full px-5 py-4 text-ink bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all peer"
                                            placeholder=" "
                                            required
                                        />
                                        <label htmlFor="email" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                            البريد الإلكتروني <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="block w-full px-5 py-4 text-ink bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all peer"
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="subject" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                        عنوان الرسالة <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="block w-full px-6 py-5 text-ink bg-gray-50 border border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-emerald-600 transition-all peer"
                                        placeholder=" "
                                        rows={6}
                                        required
                                    />
                                    <label htmlFor="message" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-8 peer-focus:top-6 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                        تفاصيل الرسالة... <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || success}
                                    className={`w-full text-[10px] font-bold uppercase tracking-[0.3em] py-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm
                                        ${success ? 'bg-emerald-600 text-white shadow-accent/20' : 'bg-ink text-white hover:bg-black shadow-ink/20'}
                                        ${loading ? 'opacity-80 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-xl animate-spin"></div>
                                    ) : success ? (
                                        <>
                                            <FiCheckCircle className="text-xl" />
                                            <span>SUCCESSFULLY SENT</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSend className="text-lg" />
                                            <span>INITIATE CONTACT</span>
                                        </>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center text-green-600 font-medium mt-4 bg-green-50 py-3 rounded-lg"
                                        >
                                            شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
