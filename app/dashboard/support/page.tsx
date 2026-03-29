'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiPlus, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SellerSupportPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', category: 'GENERAL', message: '', attachmentUrl: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (session) fetchTickets();
    }, [session]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tickets');
            if (res.ok) setTickets(await res.json());
        } catch {
            toast.error('حدث خطأ أثناء تحميل التذاكر');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.message) {
            toast.error('يرجى كتابة العنوان والرسالة');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('تم فتح تذكرة دعم بنجاح');
                setShowNewModal(false);
                setNewTicket({ subject: '', category: 'GENERAL', message: '', attachmentUrl: '' });
                fetchTickets();
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch {
            toast.error('حدث خطأ أثناء إرسال التذكرة');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'CLOSED': return 'bg-gray-200 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'مفتوحة (قيد الانتظار)';
            case 'IN_PROGRESS': return 'جاري العمل عليها';
            case 'RESOLVED': return 'تم الحل';
            case 'CLOSED': return 'مغلقة';
            default: return status;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-ink dark:text-white flex items-center gap-3">
                        <FiMessageSquare className="text-accent" />
                        الدعم الفني
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">نحن هنا لمساعدتك! افتح تذكرة وسيقوم فريق الدعم بالرد عليك في أسرع وقت.</p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="btn btn-primary py-3 px-6 shadow-sm shadow-accent/20 flex items-center gap-2"
                >
                    <FiPlus /> تذكرة جديدة
                </button>
            </div>

            {/* Ticket List */}
            {tickets.length === 0 ? (
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500">
                    <FiCheckCircle className="text-green-500 mb-4 mx-auto" size={48} />
                    <h3 className="text-xl font-bold mb-2">ليس لديك أي تذاكر سابقة</h3>
                    <p>إذا واجهتك أي مشكلة في المنصة، لا تتردد في مراسلتنا!</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-500">رقم التذكرة</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">الموضوع</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">التصنيف</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">الحالة</th>
                                    <th className="px-6 py-4 font-bold text-gray-500">آخر تحديث</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-accent font-bold">
                                            {ticket.ticketNumber}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-ink dark:text-gray-100 max-w-xs truncate">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {ticket.category === 'FINANCE' ? 'عمليات مالية' :
                                                ticket.category === 'TECHNICAL' ? 'مشكلة تقنية' : 'استفسار عام'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                                            <FiClock /> {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={`/dashboard/support/${ticket.id}`} className="text-accent hover:text-blue-700 font-bold underline text-sm">
                                                عرض الردود ({ticket._count?.messages || 0})
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/60  z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h2 className="text-xl font-bold text-ink dark:text-white flex items-center gap-2">
                                <FiPlus className="text-accent" /> فتح تذكرة درعم جديدة
                            </h2>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-red-500">
                                <FiAlertCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اختر التصنيف</label>
                                <select
                                    className="input w-full"
                                    value={newTicket.category}
                                    onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                >
                                    <option value="GENERAL">استفسار عام</option>
                                    <option value="TECHNICAL">مشكلة تقنية (في الموقع / برمجية)</option>
                                    <option value="BILLING">سحوبات وأموال (أمور مالية)</option>
                                    <option value="ACCOUNT">حسابي وملفي الشخصي</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">موضوع التذكرة <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="مثال: تأخر وصول الحوالة المالية"
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تفاصيل المشكلة <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={5}
                                    className="input w-full resize-none"
                                    placeholder="يرجى كتابة كافة التفاصيل لمساعدتك بشكل أفضل وأسرع..."
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رابط المرفقات (اختياري)</label>
                                <input
                                    type="url"
                                    className="input w-full"
                                    placeholder="رابط لصورة أو ملف يوضح المشكلة..."
                                    value={newTicket.attachmentUrl}
                                    onChange={e => setNewTicket({ ...newTicket, attachmentUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowNewModal(false)}
                                disabled={submitting}
                                className="btn btn-outline"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleCreateTicket}
                                disabled={submitting}
                                className="btn btn-primary px-8"
                            >
                                {submitting ? 'يتم الإرسال...' : 'إرسال التذكرة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
