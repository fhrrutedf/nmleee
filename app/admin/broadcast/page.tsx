'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    FiSend, FiUsers, FiCalendar, FiClock, FiCheckCircle, 
    FiAlertCircle, FiLoader, FiSearch, FiTarget, FiInfo 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBroadcastPage() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newBroadcast, setNewBroadcast] = useState({
        subject: '',
        message: '',
        target: 'all',
        scheduledAt: ''
    });

    useEffect(() => {
        if (session) fetchJobs();
    }, [session]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/broadcast/list'); // I need to create this!
            if (res.ok) setJobs(await res.json());
        } catch {
            // toast.error('حدث خطأ أثناء تحميل سجل البث');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBroadcast.subject || !newBroadcast.message) {
            toast.error('يرجى كتابة العنوان والرسالة');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBroadcast),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'تمت جدولة البث بنجاح');
                setNewBroadcast({ subject: '', message: '', target: 'all', scheduledAt: '' });
                fetchJobs();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch {
            toast.error('فشل الاتصال بالسيرفر');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'SENDING': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'قيد الانتظار';
            case 'SENDING': return 'جاري الإرسال...';
            case 'COMPLETED': return 'تم الإرسال بنجاح';
            case 'FAILED': return 'فشل الإرسال';
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-action-blue px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                        <FiTarget /> نظام التواصل الجماعي
                    </span>
                    <h1 className="text-4xl font-black text-primary-charcoal">البث الجماعي وخدمة الإشعارات</h1>
                    <p className="text-text-muted font-medium text-lg">أداة احترافية لإرسال رسائل الإيميل والإشعارات لآلاف المستخدمين بضغطة واحدة.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchJobs} className="btn btn-outline flex items-center gap-2">
                        <FiLoader className={loading ? 'animate-spin' : ''} /> تحديث السجل
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* New Broadcast Form */}
                <div className="lg:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FiSend className="text-action-blue" /> إنشاء بث جديد
                            </h2>
                            <span className="text-xs text-text-muted font-bold px-3 py-1 bg-gray-50 rounded-lg">Powered by Resend Queue</span>
                        </div>
                        
                        <form onSubmit={handleCreateBroadcast} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">المستهدفين (Audience)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all appearance-none"
                                            value={newBroadcast.target}
                                            onChange={e => setNewBroadcast({...newBroadcast, target: e.target.value})}
                                        >
                                            <option value="all">كل المستخدمين النشطين</option>
                                            <option value="sellers">كل البائعين</option>
                                            <option value="high-earners">البائعين المميزين (+$1000)</option>
                                            <option value="new-users">المستخدمين الجدد (آخر 7 أيام)</option>
                                            <option value="admins">طاقم الإدارة فقط</option>
                                        </select>
                                        <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">توقيت الإرسال (Scheduling)</label>
                                    <div className="relative">
                                        <input 
                                            type="datetime-local" 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all"
                                            value={newBroadcast.scheduledAt}
                                            onChange={e => setNewBroadcast({...newBroadcast, scheduledAt: e.target.value})}
                                        />
                                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">عنوان الرسالة (Subject)</label>
                                <input 
                                    type="text" 
                                    placeholder="مثال: تحديث شروط الاستخدام الجديدة..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all"
                                    value={newBroadcast.subject}
                                    onChange={e => setNewBroadcast({...newBroadcast, subject: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">نص الرسالة (Content - HTML Supported)</label>
                                <textarea 
                                    rows={8}
                                    placeholder="اكتب رسالتك لجميع المستخدمين هنا..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-action-blue outline-none transition-all resize-none"
                                    value={newBroadcast.message}
                                    onChange={e => setNewBroadcast({...newBroadcast, message: e.target.value})}
                                />
                                <p className="text-[10px] text-gray-400 font-medium">* سيتم إرسال هذه الرسالة في قالب 'تمالين' الرسمي تلقائياً.</p>
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-action-blue hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-action-blue/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <FiLoader className="animate-spin text-2xl" /> : <FiSend className="text-xl" />}
                                {submitting ? 'جاري التحضير وجدولة المهام...' : 'إرسال البث الآن'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Tracking & Quick Stats */}
                <div className="space-y-8">
                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-primary-charcoal rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]" />
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <FiSearch className="text-blue-400" /> لمحة سريعة
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-gray-400 text-sm font-medium">إجمالي الحملات</span>
                                <span className="text-2xl font-black">{jobs.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <span className="text-gray-400 text-sm font-medium">إيميلات مرسلة بنجاح</span>
                                <span className="text-2xl font-black text-green-400">
                                    {jobs.reduce((acc, job) => acc + (job.sentCount || 0), 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3">
                                <FiInfo className="text-blue-300 shrink-0 mt-1" />
                                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                    يتم الإرسال على دفعات لتجنب تصنيف الرسائل كـ (Spam) ولضمان وصولها لصندوق الوارد الرئيسي.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Job Log */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold flex items-center gap-2">
                                <FiClock className="text-red-500" /> سجل العمليات الأخيرة
                            </h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                            {jobs.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 font-medium text-sm">
                                    لا يوجد سجل عمليات حالياً
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <div key={job.id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm truncate max-w-[150px]">{job.subject}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusStyle(job.status)}`}>
                                                {getStatusLabel(job.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold">
                                                <span className="flex items-center gap-1"><FiUsers /> {job.sentCount}/{job.recipientCount}</span>
                                                <span className="flex items-center gap-1"><FiCalendar /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500 transition-all duration-1000" 
                                                    style={{ width: `${(job.sentCount / job.recipientCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
