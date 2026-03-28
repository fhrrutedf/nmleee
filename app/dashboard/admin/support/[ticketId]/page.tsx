'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiSend, FiArrowRight, FiUser, FiInfo, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminTicketDetailsPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = use(params);
    const { data: session } = useSession();
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (session) fetchTicket();
    }, [session]);

    const fetchTicket = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data.ticket);
            } else {
                toast.error(data.error || 'تذكرة غير موجودة');
                router.push('/dashboard/admin/support');
            }
        } catch {
            toast.error('حدث خطأ أثناء تحميل التذكرة');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent, closeTicket = false) => {
        e.preventDefault();
        if (!message && !closeTicket) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reply',
                    message: message || (closeTicket ? 'تم الرد وإغلاق التذكرة بناءً على طلبكم. شكراً لتواصلكم.' : ''),
                    status: closeTicket ? 'RESOLVED' : 'IN_PROGRESS'
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('');
                if (closeTicket) toast.success('تم الرد وإغلاق التذكرة');
                else toast.success('تم إرسال الرد بنجاح');
                fetchTicket();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch {
            toast.error('حدث خطأ أثناء إرسال الرد');
        } finally {
            setSubmitting(false);
        }
    };

    const changeStatus = async (newStatus: string) => {
        setStatusUpdating(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateStatus', status: newStatus }),
            });
            if (res.ok) {
                toast.success('تم تحديث حالة التذكرة');
                fetchTicket();
            }
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
    );

    if (!ticket) return null;

    const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return { label: 'مفتوحة (قيد الانتظار)', css: 'bg-yellow-100 text-yellow-700' };
            case 'IN_PROGRESS': return { label: 'جاري العمل عليها', css: 'bg-blue-100 text-blue-700' };
            case 'RESOLVED': return { label: 'تم الحل', css: 'bg-green-100 text-green-700' };
            case 'CLOSED': return { label: 'مغلقة', css: 'bg-gray-200 text-gray-700' };
            default: return { label: status, css: 'bg-gray-100 text-gray-700' };
        }
    };

    const statusInfo = getStatusLabel(ticket.status);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <Link href="/dashboard/admin/support" className="flex items-center gap-2 text-accent hover:text-blue-700 font-bold mb-4 w-fit transition-colors">
                <FiArrowRight /> العودة لقائمة التذاكر (المشرف)
            </Link>

            <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row overflow-hidden">

                {/* User Info Sidebar */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-500 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">معلومات صاحب التذكرة</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 text-lg">
                                <FiUser />
                            </div>
                            <div>
                                <h4 className="font-bold text-ink dark:text-white line-clamp-1">{ticket.user.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{ticket.user.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">نوع المستخدم:</span>
                                <span className="font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">{ticket.user.role === 'SELLER' ? 'بائع / مدرب' : 'عميل'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">تصنيف التذكرة:</span>
                                <span className="font-bold">{ticket.category}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">تاريخ الإنشاء:</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">الحالة:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.css}`}>{statusInfo.label}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <h3 className="font-bold text-gray-500 mb-4">إجراءات الإدارة</h3>
                        <div className="space-y-2">
                            {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && (
                                <button disabled={statusUpdating} onClick={() => changeStatus('IN_PROGRESS')} className="btn btn-primary w-full py-2 bg-blue-500 hover:bg-blue-600 border-none shadow-md">
                                    تغيير لـ "جاري العمل"
                                </button>
                            )}
                            {ticket.status !== 'RESOLVED' && (
                                <button disabled={statusUpdating} onClick={() => changeStatus('RESOLVED')} className="btn btn-primary w-full py-2 bg-green-500 hover:bg-green-600 border-none shadow-md">
                                    تغيير لـ "تم الحل"
                                </button>
                            )}
                            {ticket.status !== 'CLOSED' && (
                                <button disabled={statusUpdating} onClick={() => changeStatus('CLOSED')} className="btn btn-outline w-full py-2 bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 border-gray-300">
                                    إغلاق نهائي
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="w-full md:w-2/3 p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-sm text-accent font-bold px-3 py-1 bg-accent/10 rounded-full">
                                {ticket.ticketNumber}
                            </span>
                            <h1 className="text-2xl font-bold text-ink dark:text-white line-clamp-1" title={ticket.subject}>
                                {ticket.subject}
                            </h1>
                        </div>

                        {/* Messages Chat View */}
                        <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {ticket.messages.map((msg: any) => {
                                const isAdmin = msg.senderRole === 'ADMIN';
                                return (
                                    <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-gradient-to-br from-accent to-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                            {isAdmin ? <FiInfo /> : <FiUser />}
                                        </div>
                                        <div className={`max-w-[85%] rounded-2xl p-5 ${isAdmin ? 'bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20 rounded-tl-none' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-tr-none'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`font-bold text-sm ${isAdmin ? 'text-accent' : 'text-ink dark:text-white'}`}>
                                                    {isAdmin ? 'أنت (فريق الدعم)' : 'المستخدم'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reply Form */}
                    {isClosed ? (
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col items-center gap-2 text-green-700 justify-center text-center mt-auto">
                            <FiCheckCircle className="text-3xl" />
                            <h3 className="font-bold text-lg">التذكرة محلولة ومغلقة</h3>
                            <p className="text-sm font-medium">قدمت الرد النهائي والحل للمستخدم. لا حاجة للرد مجدداً.</p>
                            <button onClick={() => changeStatus('IN_PROGRESS')} className="mt-4 text-xs font-bold underline hover:text-green-800">إعادة الفتح؟</button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => handleReply(e, false)} className="relative mt-auto border-t border-gray-100 dark:border-gray-800 pt-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رد الدعم الفني</label>
                            <textarea
                                rows={4}
                                className="input w-full pr-14 resize-none rounded-2xl focus:ring-2 focus:ring-accent bg-gray-50 dark:bg-gray-900"
                                placeholder="اكتب ردك ومساعدتك للمستخدم هنا للرد باسم الإدارة..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(e, false);
                                    }
                                }}
                            />
                            <div className="flex gap-2 mt-3 absolute top-12 left-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !message.trim()}
                                    className="h-10 px-4 bg-accent hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl flex items-center gap-2 transition-colors font-bold shadow-md shadow-accent/20"
                                >
                                    {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSend /> إرسال فقط</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleReply(e, true)}
                                    disabled={submitting || !message.trim()}
                                    className="h-10 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors font-bold shadow-md shadow-green-500/20"
                                    title="إرسال الرد وإغلاق التذكرة"
                                >
                                    <FiCheckCircle className="ml-1" /> إرسال وحل الدعم
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
