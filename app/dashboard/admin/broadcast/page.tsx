'use client';

import { useState } from 'react';
import { FiSend, FiUsers, FiTarget, FiActivity, FiMail, FiCheckCircle, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { apiPost, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TARGET_SEGMENTS = [
    { id: 'all', name: 'الجميع', icon: FiUsers, color: 'text-gray-500' },
    { id: 'sellers', name: 'البائعين فقط', icon: FiZap, color: 'text-[#10B981]-500' },
    { id: 'inactive-sellers', name: 'بائعين غير نشطين (>30 يوم)', icon: FiActivity, color: 'text-orange-500' },
    { id: 'high-earners', name: 'الأكثر ربحاً (> $1000)', icon: FiTarget, color: 'text-[#10B981]-500' },
    { id: 'new-users', name: 'المسجلين الجدد (الأسبوع الأخير)', icon: FiCheckCircle, color: 'text-sky-500' },
    { id: 'admins', name: 'فريق الإدارة', icon: FiMail, color: 'text-rose-500' },
];

export default function AdminBroadcastPage() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async () => {
        if (!subject || !message) return toast.error('يرجى ملء جميع الحقول');
        
        const confirmResult = window.confirm(`هل أنت متأكد من إرسال هذا البث لـ ${TARGET_SEGMENTS.find(s => s.id === target)?.name}؟`);
        if (!confirmResult) return;

        setSending(true);
        setResult(null);
        try {
            const data = await apiPost('/api/admin/broadcast', { subject, message, target });
            setResult(data);
            toast.success('تم إرسال البث بنجاح');
            // Reset form
            setSubject('');
            setMessage('');
        } catch (err) {
            handleApiError(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="text-center md:text-right">
                <h1 className="text-3xl font-extrabold text-white dark:text-white flex items-center justify-center md:justify-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                         <FiSend className="text-primary" />
                    </div>
                    نظام البث الذكي والمستهدف
                </h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-2xl">أرسل رسائل مخصصة لشرائح معينة من مستخدمين "تمالين" بدقة عالية لزيادة التفاعل.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Form */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-[#0A0A0A] dark:bg-emerald-700 text-white/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-lg shadow-[#10B981]/20">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">عنوان البث (الإيميل)</label>
                                <input 
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="مثال: ميزة جديدة حصرية لك يا غالي! 🚀"
                                    className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3.5 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">محتوى الرسالة (يدعم نص حر)</label>
                                <textarea 
                                    rows={10}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اكتب رسالتك الجميلة هنا لكل المنصة..."
                                    className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
                                    <FiAlertTriangle className="text-[#10B981]-500" />
                                    تذكير: سيتم وضع محتوى رسالتك داخل "قالب تمالين الرسمي" الموحد لضمان الاحترافية.
                                </p>
                            </div>

                            <button 
                                onClick={handleSend}
                                disabled={sending || !subject || !message}
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#10B981]/20 shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                <FiSend className={sending ? '' : ''} />
                                {sending ? 'جاري التحليق وبث الرسائل...' : 'إرسال البث الآن لكل المستهدفين'}
                            </button>
                        </div>
                    </section>

                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-700 text-white-50 dark:bg-emerald-700 text-white-500/10 border border-blue-100 dark:border-emerald-600-500/20 p-6 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-emerald-700 text-white-500/20 text-[#10B981]-600 dark:text-blue-400 rounded-xl">
                                    <FiCheckCircle className="text-2xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300">تم إكمال البث بنجاح!</h4>
                                    <p className="text-sm text-[#10B981]-600 dark:text-[#10B981]-500/80">وصلت رسائلك لـ {result.sent} شخص ({result.total} مستهدف).</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-[#10B981]-600 dark:text-blue-400">%{Math.round((result.sent / result.total) * 100) || 100}</span>
                                <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">دقة الوصول</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Targeting Segments */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-emerald-700 text-white border border-slate-800 rounded-xl p-6 shadow-lg shadow-[#10B981]/20 overflow-hidden">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <FiTarget className="text-primary" />
                            اختر الجمهور المستهدف
                        </h3>
                        
                        <div className="space-y-3">
                            {TARGET_SEGMENTS.map((segment) => (
                                <button 
                                    key={segment.id}
                                    onClick={() => setTarget(segment.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-right group ${target === segment.id ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]' : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-emerald-700 text-white hover:border-slate-700'}`}
                                >
                                    <div className={`p-2.5 rounded-xl transition-all ${target === segment.id ? 'bg-primary text-white scale-110' : 'bg-slate-800 text-gray-500 group-hover:scale-105'}`}>
                                        <segment.icon className="text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-sm font-bold transition-colors ${target === segment.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{segment.name}</div>
                                        <div className="text-[11px] opacity-50 mt-0.5">سمة هذا الجمهور</div>
                                    </div>
                                    {target === segment.id && (
                                        <div className="w-2 h-2 rounded-xl bg-primary shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800/50">
                             <div className="flex items-start gap-4 p-4 bg-emerald-700 text-white/10 border border-amber-500/20 rounded-xl">
                                <FiAlertTriangle className="text-[#10B981]-500 mt-1 shrink-0" />
                                <p className="text-[11px] text-[#10B981]-500/80 leading-relaxed font-medium">
                                    تحذير: البث العشوائي والمتكرر قد يؤدي إلى تصنيف خادم الإيميلات كـ Spam. استخدم "البث الذكي" فقط للرسائل الهامة.
                                </p>
                             </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
