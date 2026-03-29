'use client';

import { useState, useEffect } from 'react';
import { 
    FiShield, FiActivity, FiUser, FiClock, FiFileText, 
    FiSearch, FiRefreshCw, FiExternalLink, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { apiGet, handleApiError } from '@/lib/safe-fetch';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AuditLog {
    id: string;
    actor_id: string;
    actor_name: string;
    actor_role: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: any;
    ip_address: string;
    created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    'user.banned': { label: 'حظر مستخدم', color: 'bg-red-100 text-red-700' },
    'user.activated': { label: 'تفعيل مستخدم', color: 'bg-green-100 text-green-700' },
    'user.role_changed': { label: 'تغيير صلاحيات', color: 'bg-purple-100 text-purple-700' },
    'user.commission_changed': { label: 'تغيير عمولة', color: 'bg-blue-100 text-blue-700' },
    'order.approved': { label: 'قبول طلب', color: 'bg-green-100 text-green-700' },
    'order.rejected': { label: 'رفض طلب', color: 'bg-red-100 text-red-700' },
    'payout.approved': { label: 'قبول سحب', color: 'bg-green-100 text-green-700' },
    'payout.rejected': { label: 'رفض سحب', color: 'bg-red-100 text-red-700' },
    'course.approved': { label: 'قبول كورس', color: 'bg-indigo-100 text-indigo-700' },
    'broadcast.sent': { label: 'إرسال بث', color: 'bg-pink-100 text-pink-700' },
    'admin.impersonation_started': { label: 'بدء انتحال', color: 'bg-orange-100 text-orange-700' },
    'platform.payment_failed': { label: 'فشل دفع', color: 'bg-red-50 text-red-500' },
    'platform.settings_updated': { label: 'تحديث منصة', color: 'bg-emerald-700 text-white-50 text-[#10B981]-600' },
};

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(50);
    const [actorFilter, setActorFilter] = useState('');

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await apiGet<{ logs: AuditLog[], total: number }>(`/api/admin/activity-logs?limit=${limit}&offset=${page * limit}`);
            setLogs(data.logs || []);
        } catch (err) {
            console.error(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [page]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#10B981] dark:text-white flex items-center gap-2">
                        <FiShield className="text-[#10B981]" /> سجل الرقابة والأنشطة
                    </h1>
                    <p className="text-text-muted text-sm mt-1">تتبع جميع الحركات الحساسة التي تمت على المنصة</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadLogs} className="btn btn-outline py-2 px-3">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input 
                            type="text" 
                            placeholder="بحث بالادمن..." 
                            className="input pr-9 py-2 text-sm w-48"
                            value={actorFilter}
                            onChange={(e) => setActorFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-[#111111] dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <tr className="text-text-muted text-xs font-bold">
                                <th className="px-5 py-4">المنفذ</th>
                                <th className="px-5 py-4">النشاط</th>
                                <th className="px-5 py-4">الهدف</th>
                                <th className="px-5 py-4">التفاصيل</th>
                                <th className="px-5 py-4">IP</th>
                                <th className="px-5 py-4">الوقت</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="">
                                        <td colSpan={6} className="px-5 py-6 h-12 bg-[#111111]/50 dark:bg-gray-800/20"></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-20 text-center text-text-muted">
                                        <FiActivity className="text-5xl mx-auto mb-4 opacity-20" />
                                        لا توجد سجلات حالياً
                                    </td>
                                </tr>
                            ) : logs.filter(l => !actorFilter || l.actor_name.includes(actorFilter)).map((log) => (
                                <tr key={log.id} className="hover:bg-[#111111]/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white/10 text-[#10B981] flex items-center justify-center font-bold text-xs">
                                                {log.actor_name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold">{log.actor_name}</div>
                                                <div className="text-[10px] text-text-muted uppercase font-mono">{log.actor_role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded-xl text-[10px] font-bold ${ACTION_LABELS[log.action]?.color || 'bg-emerald-800 text-gray-400'}`}>
                                            {ACTION_LABELS[log.action]?.label || log.action}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {log.entity_type && (
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <span className="text-text-muted">{log.entity_type}:</span>
                                                <span className="font-mono text-[#10B981] truncate max-w-[100px]">{log.entity_id}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-[11px] text-[#10B981] dark:text-gray-300 max-w-xs truncate">
                                            {log.details ? JSON.stringify(log.details) : '—'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[10px] font-mono text-text-muted">
                                        {log.ip_address || 'Internal'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted whitespace-nowrap">
                                            <FiClock className="text-[10px]" />
                                            {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-[#111111] dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button 
                        disabled={page === 0 || loading}
                        onClick={() => setPage(p => p - 1)}
                        className="btn btn-outline py-1.5 px-3 flex items-center gap-1 text-xs disabled:opacity-50"
                    >
                        <FiChevronRight /> السابق
                    </button>
                    <span className="text-xs text-text-muted">الصفحة {page + 1}</span>
                    <button 
                        disabled={logs.length < limit || loading}
                        onClick={() => setPage(p => p + 1)}
                        className="btn btn-outline py-1.5 px-3 flex items-center gap-1 text-xs disabled:opacity-50"
                    >
                        التالي <FiChevronLeft />
                    </button>
                </div>
            </div>
        </div>
    );
}
