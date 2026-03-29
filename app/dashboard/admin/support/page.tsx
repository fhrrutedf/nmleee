'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiMessageSquare, FiFilter, FiClock, FiUser, FiInfo, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminSupportPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('OPEN'); // default to open

    useEffect(() => {
        if (session) fetchTickets(statusFilter);
    }, [session, statusFilter]);

    const fetchTickets = async (status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tickets?status=${status}`);
            if (res.ok) setTickets(await res.json());
        } catch {
            toast.error('حدث خطأ أثناء تحميل التذاكر');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'CLOSED': return 'bg-gray-200 text-gray-300';
            default: return 'bg-emerald-800 text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'مفتوحة (جديدة)';
            case 'IN_PROGRESS': return 'جاري العمل';
            case 'RESOLVED': return 'تم الحل';
            case 'CLOSED': return 'مغلقة';
            default: return status;
        }
    };

    const countByStatus = (status: string) => tickets.filter(t => t.status === status).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#10B981] dark:text-white flex items-center gap-3">
                        <FiMessageSquare className="text-[#10B981]" />
                        نظام تذاكر الدعم الفني
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">إدارة تذاكر البائعين والعملاء والإجابة على الاستفسارات</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0A0A0A] dark:bg-card-white shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800 rounded-xl p-1">
                    <button onClick={() => setStatusFilter('OPEN')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${statusFilter === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-[#111111]'}`}>جديدة</button>
                    <button onClick={() => setStatusFilter('IN_PROGRESS')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${statusFilter === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-[#111111]'}`}>جاري العمل</button>
                    <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${statusFilter === 'ALL' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:bg-[#111111]'}`}>الكل</button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-[#0A0A0A] dark:bg-card-white rounded-xl shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800 p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
                    <FiMessageSquare className="text-gray-300 dark:text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold mb-2 text-[#10B981] dark:text-white">لا توجد تذاكر حالياً</h3>
                    <p>لا يوجد تذاكر دعم فني تتطابق مع التصفية الحالية ({getStatusLabel(statusFilter)})</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-[#0A0A0A] dark:bg-card-white rounded-xl shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800 p-6 flex flex-col justify-between hover:shadow-lg shadow-[#10B981]/20 transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-xl ${getStatusStyle(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                    <span className="font-mono text-xs text-gray-400 bg-[#111111] dark:bg-gray-800 px-2 py-1 rounded-md flex items-center gap-1">
                                        <FiHash /> {ticket.ticketNumber.replace('TKT-', '')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-[#10B981] dark:text-white mb-2 line-clamp-2" title={ticket.subject}>
                                    {ticket.subject}
                                </h3>
                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-white shrink-0">
                                        <FiUser />
                                    </div>
                                    <span className="truncate">{ticket.user.name}</span>
                                    <span className="text-gray-300 dark:text-gray-300 mx-1">•</span>
                                    <span className="truncate">{ticket.user.role === 'SELLER' ? 'بائع' : 'عميل'}</span>
                                </div>
                            </div>

                            <div className="border-t border-white/10 dark:border-gray-800 pt-4 mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                    <FiClock /> {new Date(ticket.updatedAt).toLocaleDateString('ar-SA')} ({ticket._count?.messages || 0} ردود)
                                </div>
                                <Link href={`/dashboard/admin/support/${ticket.id}`} className="btn btn-primary py-1.5 px-4 text-sm shadow-md shadow-accent/20">
                                    معاينة و رد
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
