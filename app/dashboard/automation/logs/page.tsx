'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiCheck, FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

type EmailLog = {
    id: string;
    type: string;
    toEmail: string;
    toName?: string;
    subject: string;
    status: string;
    errorMessage?: string;
    createdAt: string;
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    welcome: { label: 'ترحيب', color: 'bg-green-100 text-green-700' },
    cart_reminder_1: { label: 'سلة - 1', color: 'bg-yellow-100 text-yellow-700' },
    cart_reminder_2: { label: 'سلة - 2', color: 'bg-orange-100 text-orange-700' },
    cart_reminder_3: { label: 'سلة - 3', color: 'bg-red-100 text-red-700' },
    post_purchase_7: { label: 'تقييم 7 أيام', color: 'bg-blue-100 text-blue-700' },
    post_purchase_30: { label: 'Upsell 30 يوم', color: 'bg-purple-100 text-purple-700' },
    report: { label: 'تقرير', color: 'bg-indigo-100 text-indigo-700' },
    sub_reminder: { label: 'اشتراك', color: 'bg-cyan-100 text-cyan-700' },
    edu_followup: { label: 'تعليمي', color: 'bg-teal-100 text-teal-700' },
    marketing: { label: 'تسويقي', color: 'bg-pink-100 text-pink-700' },
};

export default function EmailLogsPage() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'sent' | 'failed'>('all');

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/automation/email-logs');
            if (res.ok) setLogs(await res.json());
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter);

    const stats = {
        total: logs.length,
        sent: logs.filter(l => l.status === 'sent').length,
        failed: logs.filter(l => l.status === 'failed').length,
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/automation" className="flex items-center gap-2 text-text-muted hover:text-[#10B981] text-sm mb-2 transition-colors">
                        <FiArrowLeft /> العودة للأتمتة
                    </Link>
                    <h1 className="text-2xl font-bold text-[#10B981] dark:text-white">📬 سجل الإيميلات</h1>
                    <p className="text-text-muted text-sm mt-1">آخر 100 إيميل تم إرسالها</p>
                </div>
                <button onClick={load} className="btn btn-outline flex items-center gap-2">
                    <FiRefreshCw /> تحديث
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'إجمالي', value: stats.total, color: 'text-gray-700' },
                    { label: 'مُرسَل', value: stats.sent, color: 'text-green-600' },
                    { label: 'فشل', value: stats.failed, color: 'text-red-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-[#0A0A0A] dark:bg-card-white rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-text-muted text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {(['all', 'sent', 'failed'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-emerald-700 text-white' : 'bg-emerald-800 dark:bg-gray-800 text-gray-400 dark:text-gray-400'}`}>
                        {f === 'all' ? 'الكل' : f === 'sent' ? 'مُرسَل ✓' : 'فشل ✗'}
                    </button>
                ))}
            </div>

            {/* Logs Table */}
            <div className="bg-[#0A0A0A] dark:bg-card-white rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-xl animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-text-muted">
                        <FiMail className="text-4xl mx-auto mb-3 opacity-30" />
                        <p>لا توجد إيميلات بعد</p>
                        <p className="text-xs mt-1">فعّل الإيميلات التلقائية من صفحة الأتمتة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#111111] dark:bg-gray-800/50 text-right">
                                    <th className="px-4 py-3 text-text-muted font-semibold">النوع</th>
                                    <th className="px-4 py-3 text-text-muted font-semibold">المستلم</th>
                                    <th className="px-4 py-3 text-text-muted font-semibold">الموضوع</th>
                                    <th className="px-4 py-3 text-text-muted font-semibold">الحالة</th>
                                    <th className="px-4 py-3 text-text-muted font-semibold">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filtered.map(log => {
                                    const typeInfo = TYPE_LABELS[log.type] || { label: log.type, color: 'bg-emerald-800 text-gray-700' };
                                    return (
                                        <tr key={log.id} className="hover:bg-[#111111] dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-[#10B981] dark:text-white">{log.toName || log.toEmail}</p>
                                                <p className="text-xs text-text-muted">{log.toEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 dark:text-gray-400 max-w-[200px] truncate">{log.subject}</td>
                                            <td className="px-4 py-3">
                                                {log.status === 'sent' ? (
                                                    <span className="flex items-center gap-1 text-green-600 font-semibold text-xs"><FiCheck /> مُرسَل</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-500 font-semibold text-xs" title={log.errorMessage}><FiAlertCircle /> فشل</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-text-muted text-xs">
                                                {format(new Date(log.createdAt), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
