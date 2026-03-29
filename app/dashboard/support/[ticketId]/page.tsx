'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiSend, FiArrowRight, FiUser, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TicketDetailsPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = use(params);
    const { data: session } = useSession();
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (session) fetchTicket();
    }, [session]);

    const fetchTicket = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data.ticket);
            } else {
                toast.error(data.error || 'تذكرة غير موجودة');
                router.push('/dashboard/support');
            }
        } catch {
            toast.error('حدث خطأ أثناء تحميل التذكرة');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, attachmentUrl }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('');
                setAttachmentUrl('');
                fetchTicket(); // Refresh to get the new message
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch {
            toast.error('حدث خطأ أثناء إرسال الرد');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin" />
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
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <Link href="/dashboard/support" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-600 font-bold mb-4 w-fit transition-colors">
                <FiArrowRight /> العودة لمركز الدعم
            </Link>

            <div className="bg-white dark:bg-card-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm text-emerald-600 font-bold px-3 py-1 bg-emerald-600/10 rounded-xl">
                                {ticket.ticketNumber}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-xl ${statusInfo.css}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-ink dark:text-white">
                            {ticket.subject}
                        </h1>
                    </div>
                    <div className="text-left text-sm text-gray-500 font-medium whitespace-nowrap">
                        آخر تحديث: {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')}
                    </div>
                </div>

                {/* Messages Chat View */}
                <div className="space-y-6 mb-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {ticket.messages.map((msg: any) => {
                        const isAdmin = msg.senderRole === 'ADMIN';
                        return (
                            <div key={msg.id} className={`flex gap-4 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? 'bg-ink' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                    {isAdmin ? <FiMessageSquare className="text-white" /> : <FiUser className="text-gray-500" />}
                                </div>
                                <div className={`max-w-[80%] rounded-xl p-5 ${isAdmin ? 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-tr-none' : 'bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 rounded-tl-none'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`font-bold text-sm ${isAdmin ? 'text-ink dark:text-white' : 'text-emerald-600'}`}>
                                            {isAdmin ? 'فريق الدعم (المنصة)' : 'أنت'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-gray-700 dark:text-gray-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {msg.message}
                                    </p>
                                    {msg.attachmentUrl && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <a 
                                                href={msg.attachmentUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 hover:border-emerald-600 transition-colors"
                                            >
                                                📂 عرض المرفقات
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reply Form */}
                {isClosed ? (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 text-gray-500 justify-center">
                        <FiInfo className="text-xl" />
                        <p className="font-bold">هذه التذكرة مغلقة ولا يمكن إضافة المزيد من الردود عليها.</p>
                    </div>
                ) : (
                    <form onSubmit={handleReply} className="space-y-4 mt-8">
                        <div className="relative">
                            <textarea
                                rows={3}
                                className="input w-full pr-14 resize-none rounded-xl focus:ring-2 focus:ring-accent"
                                placeholder="اكتب ردك هنا..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={submitting || !message.trim()}
                                className="absolute top-3 left-4 w-10 h-10 bg-emerald-600 hover:bg-emerald-600-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-md"
                            >
                                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-xl animate-spin" /> : <FiSend />}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="url" 
                                className="input text-xs py-2 h-auto" 
                                placeholder="رابط مرفق جديد (اختياري)..."
                                value={attachmentUrl}
                                onChange={(e) => setAttachmentUrl(e.target.value)}
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
