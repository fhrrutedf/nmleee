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
        <div className="min-h-screen bg-bg-light relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-action-blue/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32 relative z-10">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="text-center mb-20 max-w-3xl mx-auto"
                >
                    <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100/50 text-action-blue font-bold tracking-wider text-sm mb-6 border border-blue-200">
                        نحن دائماً في الخدمة
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-primary-charcoal mb-6 font-heading">
                        لنبقَ على <span className="text-transparent bg-clip-text bg-gradient-to-r from-action-blue to-purple-600">تواصل</span>
                    </h1>
                    <p className="text-xl text-text-muted font-light leading-relaxed">
                        سواء كان لديك استفسار، تعليق، أو تحتاج إلى مساعدة... فريقنا جاهز للرد عليك في أسرع وقت ممكن.
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
                                icon: <FiMail className="text-2xl text-action-blue" />,
                                title: 'البريد الإلكتروني',
                                lines: ['support@tmleen.com', 'info@tmleen.com'],
                                bg: 'bg-blue-50',
                                delay: 0.1
                            },
                            {
                                icon: <FiPhone className="text-2xl text-green-600" />,
                                title: 'الهاتف الساخن',
                                lines: ['+20 123 456 7890 (مصر)', '+966 50 123 4567 (السعودية)'],
                                sub: 'السبت - الخميس: 9 صباحاً - 6 مساءً',
                                bg: 'bg-green-50',
                                delay: 0.2
                            },
                            {
                                icon: <FiMapPin className="text-2xl text-purple-600" />,
                                title: 'المقر الرئيسي',
                                lines: ['المعادي - شارع 9', 'القاهرة، جمهورية مصر العربية'],
                                bg: 'bg-purple-50',
                                delay: 0.3
                            }
                        ].map((info, idx) => (
                            <motion.div
                                key={idx}
                                variants={slideInRight}
                                whileHover={{ x: -10, scale: 1.02 }}
                                className="bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 border border-gray-50 flex items-start gap-6 group transition-all"
                            >
                                <div className={`w-14 h-14 ${info.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    {info.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-3 text-primary-charcoal">{info.title}</h3>
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
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 overflow-hidden relative">
                            {/* Decorative element inside form */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-action-blue/10 to-transparent rounded-bl-[100px] pointer-events-none"></div>

                            <h2 className="text-3xl font-bold mb-8 text-primary-charcoal">أرسل لنا رسالة المباشرة</h2>

                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer"
                                            placeholder=" "
                                            required
                                        />
                                        <label htmlFor="name" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                            الاسم الكامل <span className="text-red-500">*</span>
                                        </label>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer"
                                            placeholder=" "
                                            required
                                        />
                                        <label htmlFor="email" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
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
                                        className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer"
                                        placeholder=" "
                                        required
                                    />
                                    <label htmlFor="subject" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                        عنوان الرسالة <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer resize-none"
                                        placeholder=" "
                                        rows={6}
                                        required
                                    />
                                    <label htmlFor="message" className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-8 peer-focus:top-6 peer-focus:scale-75 peer-focus:-translate-y-4 right-4">
                                        تفاصيل الرسالة... <span className="text-red-500">*</span>
                                    </label>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || success}
                                    className={`w-full text-lg py-5 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 shadow-xl
                                        ${success ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-action-blue text-white hover:bg-blue-700 shadow-action-blue/30'}
                                        ${loading ? 'opacity-80 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : success ? (
                                        <>
                                            <FiCheckCircle className="text-2xl" />
                                            <span>تم الإرسال بنجاح!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiSend className="text-xl" />
                                            <span>إرسال الرسالة الآن</span>
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
