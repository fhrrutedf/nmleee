'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: any }> = {
    paid:    { label: 'مدفوع',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: FiCheckCircle },
    pending: { label: 'قيد الانتظار', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: FiClock },
    failed:  { label: 'فشل',     cls: 'bg-red-500/15 text-red-400 border-red-500/30',     icon: FiXCircle },
    expired: { label: 'منتهي',   cls: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: FiAlertTriangle },
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">سجلات الدفع الآلي (سيريتل وشام كاش)</h1>
                    <p className="text-gray-400 text-sm mt-1">مراقبة كاملة لجميع عمليات الدفع الآلي</p>
                </div>
                <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all">
                    <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} /> تحديث
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي العمليات', value: total, color: 'text-white' },
                    { label: 'مدفوعة', value: stats.paid, color: 'text-emerald-400' },
                    { label: 'قيد الانتظار', value: stats.pending, color: 'text-yellow-400' },
                    { label: 'فشلت', value: stats.failed, color: 'text-red-400' },
                ].map(s => (
                    <div key={s.label} className="bg-[#111] border border-white/10 rounded-xl p-5">
                        <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
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

            {/* Table */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-[#111]">
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">رقم الفاتورة</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">العملية</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">الطلب</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">المبلغ (ل.س)</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">الحالة</th>
                                <th className="text-right px-4 py-3 text-gray-400 font-bold">التاريخ</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-500">جاري التحميل...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-500">لا توجد سجلات</td></tr>
                            ) : logs.map((log) => {
                                const st = STATUS_STYLES[log.status] || STATUS_STYLES['pending'];
                                const Icon = st.icon;
                                const isExpanded = expanded === log.id;
                                const isShamCash = log.Order?.paymentProvider === 'shamcash' || log.requestPayload?.method === 'shamcash';
                                const gatewayBadge = isShamCash ? 
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">💚 شام كاش</span> : 
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">📱 سيريتل</span>;

                                return (
                                    <>
                                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-[#10B981] text-xs">
                                                {log.samInvoiceId ? (
                                                    <a href={`https://www.sam-api.pro/pay/${log.samInvoiceId}`} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-1 hover:underline">
                                                        {log.samInvoiceId.slice(0, 12)}... <FiExternalLink size={11} />
                                                    </a>
                                                ) : <span className="text-gray-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {gatewayBadge}
                                                    <span className="text-xs font-bold">{ACTION_LABELS[log.action] || log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-white font-mono text-xs">{log.Order?.orderNumber || log.orderId?.slice(0, 8) + '...'}</div>
                                                {log.Order?.customerName && <div className="text-gray-500 text-xs">{log.Order.customerName}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-white font-bold">
                                                {log.amount ? log.amount.toLocaleString('ar-SY') : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${st.cls}`}>
                                                    <Icon size={12} /> {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">
                                                {new Date(log.createdAt).toLocaleString('ar-SY')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => setExpanded(isExpanded ? null : log.id)}
                                                    className="text-[10px] text-gray-500 hover:text-emerald-400 transition-colors font-bold">
                                                    {isExpanded ? 'إخفاء' : 'تفاصيل'}
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
