'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: any; glow: string }> = {
    paid:    { label: 'مدفوع',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', glow: 'shadow-emerald-500/20', icon: FiCheckCircle },
    pending: { label: 'قيد الانتظار', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', glow: 'shadow-amber-500/20', icon: FiClock },
    failed:  { label: 'فشل',     cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20', glow: 'shadow-rose-500/20', icon: FiXCircle },
    expired: { label: 'منتهي',   cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20', glow: 'shadow-slate-500/20', icon: FiAlertTriangle },
};

const ACTION_LABELS: Record<string, string> = {
    CREATE_INVOICE:  'إنشاء فاتورة',
    VERIFY_PAYMENT:  'تحقق من دفع',
    CALLBACK:        'Callback',
};

export default function SamLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '30' });
            if (statusFilter) params.set('status', statusFilter);
            const data = await apiGet(`/api/admin/sam-logs?${params}`);
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch { setLogs([]); }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const stats = {
        total: logs.length,
        paid:    logs.filter(l => l.status === 'paid').length,
        pending: logs.filter(l => l.status === 'pending').length,
        failed:  logs.filter(l => l.status === 'failed').length,
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="relative">
                    <div className="absolute -right-4 top-0 w-1 h-full bg-emerald-500 rounded-full blur-sm opacity-50"></div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                            <FiSearch size={20} />
                        </span>
                        سجلات الدفع الآلي
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">نظام المراقبة الموحد لبوابات سيريتل وشام كاش</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchLogs} 
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <FiRefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        تحديث البيانات
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي العمليات', value: total, color: 'text-white', icon: FiSearch, bg: 'bg-white/5' },
                    { label: 'عمليات ناجحة', value: stats.paid, color: 'text-emerald-400', icon: FiCheckCircle, bg: 'bg-emerald-500/10' },
                    { label: 'قيد الانتظار', value: stats.pending, color: 'text-amber-400', icon: FiClock, bg: 'bg-amber-500/10' },
                    { label: 'عمليات فاشلة', value: stats.failed, color: 'text-rose-400', icon: FiXCircle, bg: 'bg-rose-500/10' },
                ].map(s => (
                    <div key={s.label} className={`relative overflow-hidden group ${s.bg} border border-white/10 rounded-[2rem] p-6 transition-all hover:border-white/20`}>
                        <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 opacity-70">{s.label}</p>
                            <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                        </div>
                        <s.icon size={80} className={`absolute -left-4 -bottom-4 opacity-[0.03] ${s.color} transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700`} />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {['', 'paid', 'pending', 'failed'].map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${statusFilter === s ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-[#111] border-white/10 text-gray-400 hover:border-emerald-600/40'}`}>
                        {s === '' ? 'الكل' : STATUS_STYLES[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Data Table View */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">كود الفاتورة</th>
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">الخدمة / البوابة</th>
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">العميل / الطلب</th>
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">المبلغ المحول</th>
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">الحالة الحالية</th>
                                <th className="text-right px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">وقت العملية</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-24">
                                    <FiRefreshCw size={30} className="animate-spin text-emerald-500/30 mx-auto mb-4" />
                                    <p className="text-gray-500 font-bold text-sm">جاري مزامنة السجلات...</p>
                                </td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-24">
                                    <FiAlertTriangle size={30} className="text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-600 font-bold text-sm">لا توجد عمليات مسجلة حالياً</p>
                                </td></tr>
                            ) : logs.map((log) => {
                                const st = STATUS_STYLES[log.status] || STATUS_STYLES['pending'];
                                const Icon = st.icon;
                                const isExpanded = expanded === log.id;
                                const isShamCash = log.Order?.paymentProvider === 'shamcash' || log.requestPayload?.method === 'shamcash' || log.paymentProvider === 'shamcash';
                                
                                return (
                                    <>
                                        <tr key={log.id} className={`group hover:bg-white/[0.02] transition-all ${isExpanded ? 'bg-white/[0.03]' : ''}`}>
                                            <td className="px-8 py-6">
                                                {log.samInvoiceId ? (
                                                    <a href={`https://www.sam-api.pro/pay/${log.samInvoiceId}`} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 font-mono text-emerald-500/80 hover:text-emerald-400 transition-colors text-xs bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                                        {log.samInvoiceId.slice(0, 8)} <FiExternalLink size={10} />
                                                    </a>
                                                ) : <span className="text-gray-600 font-mono">—</span>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black tracking-tighter uppercase border ${isShamCash ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                        {isShamCash ? '💚 Sham Cash' : '📱 Syriatel Cash'}
                                                    </span>
                                                    <span className="text-xs font-bold text-white/90">{ACTION_LABELS[log.action] || log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-white text-sm mb-1">{log.Order?.orderNumber || (log.orderId ? `Order #${log.orderId.slice(0,8)}` : 'N/A')}</div>
                                                {log.Order?.customerName && <div className="text-gray-500 text-[11px] font-medium">{log.Order.customerName}</div>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-lg font-black text-white">{log.amount ? log.amount.toLocaleString('ar-SY') : '—'}</div>
                                                <div className="text-[10px] text-gray-500 font-bold">ليرة سورية</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[11px] font-black uppercase tracking-tight shadow-lg ${st.glow} ${st.cls}`}>
                                                    <Icon size={14} /> {st.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-gray-500 text-[11px] font-bold">
                                                {new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.createdAt))}
                                            </td>
                                            <td className="px-8 py-6 text-left">
                                                <button onClick={() => setExpanded(isExpanded ? null : log.id)}
                                                    className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-180' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                                    <FiFilter size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${log.id}-exp`} className="bg-[#0d0d0d]">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Request Payload</p>
                                                            <pre className="text-xs text-emerald-400 bg-black/50 rounded-lg p-4 overflow-auto max-h-40 text-left dir-ltr">
                                                                {JSON.stringify(log.requestPayload, null, 2) || '—'}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Response Payload</p>
                                                            <pre className="text-xs text-blue-400 bg-black/50 rounded-lg p-4 overflow-auto max-h-40 text-left dir-ltr">
                                                                {JSON.stringify(log.responsePayload, null, 2) || '—'}
                                                            </pre>
                                                        </div>
                                                        {log.errorMessage && (
                                                            <div className="md:col-span-2">
                                                                <p className="text-[10px] text-red-400 uppercase tracking-widest mb-2">رسالة الخطأ</p>
                                                                <p className="text-xs text-red-300 bg-red-900/10 rounded-lg p-3">{log.errorMessage}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 30 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <p className="text-sm text-gray-400">إجمالي: {total} سجل</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold disabled:opacity-40 text-gray-300 hover:bg-white/5 transition-all">
                                السابق
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-400">صفحة {page}</span>
                            <button disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-sm font-bold disabled:opacity-40 text-gray-300 hover:bg-white/5 transition-all">
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
