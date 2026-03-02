'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiDollarSign, FiShoppingCart, FiCheck, FiX, FiEye,
    FiRefreshCw, FiShield, FiCreditCard, FiDownload,
    FiActivity, FiBookOpen, FiLogIn, FiSlash, FiUnlock,
    FiSend, FiUsers, FiPercent, FiAlertTriangle, FiClock,
    FiCheckCircle
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';

const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const methodLabel: Record<string, string> = {
    bank: '🏦 بنك', paypal: '📦 PayPal', crypto: '🪙 كريبتو', syriatel: 'سيريتل', manual: 'يدوي',
};

function Tab({ id, active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap relative ${active ? 'bg-action-blue text-white shadow-md' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
            <Icon className="text-base" />{label}
            {badge > 0 && <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] min-w-[18px] px-1 rounded-full">{badge}</span>}
        </button>
    );
}

export default function AdminPayoutsPage() {
    const [activeTab, setActiveTab] = useState('payouts');
    const [payouts, setPayouts] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; type: 'payout' | 'course'; title: string } | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [txId, setTxId] = useState('');

    // Commission override modal
    const [commModal, setCommModal] = useState<{ userId: string; name: string; current: number | null } | null>(null);
    const [commRate, setCommRate] = useState('');

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [p, c, l] = await Promise.all([
                fetch('/api/admin/payouts').then(r => r.json()),
                fetch('/api/admin/courses-review?status=PENDING').then(r => r.json()),
                fetch('/api/admin/activity-logs?limit=30').then(r => r.json()),
            ]);
            setPayouts(Array.isArray(p) ? p : []);
            setCourses(Array.isArray(c) ? c : []);
            setLogs(l.logs ?? []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const approvePayout = async (payoutId: string) => {
        setProcessing(payoutId);
        const r = await fetch('/api/admin/payouts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payoutId, action: 'approve', transactionId: txId }),
        });
        const d = await r.json();
        if (r.ok) { showToast.success(d.message); setTxId(''); await loadAll(); }
        else showToast.error(d.error);
        setProcessing(null);
    };

    const rejectItem = async () => {
        if (!rejectModal) return;
        setProcessing(rejectModal.id);
        const api = rejectModal.type === 'payout' ? '/api/admin/payouts' : '/api/admin/courses-review';
        const body = rejectModal.type === 'payout'
            ? { payoutId: rejectModal.id, action: 'reject', note: rejectNote }
            : { courseId: rejectModal.id, action: 'reject', note: rejectNote };
        const r = await fetch(api, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await r.json();
        if (r.ok) { showToast.success(d.message); setRejectModal(null); setRejectNote(''); await loadAll(); }
        else showToast.error(d.error);
        setProcessing(null);
    };

    const approveCourse = async (courseId: string) => {
        setProcessing(courseId);
        const r = await fetch('/api/admin/courses-review', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, action: 'approve' }),
        });
        const d = await r.json();
        if (r.ok) { showToast.success(d.message); await loadAll(); }
        else showToast.error(d.error);
        setProcessing(null);
    };

    const loginAsUser = async (userId: string, name: string) => {
        if (!confirm(`هل تريد الدخول كـ "${name}"؟ ستنتهي صلاحيتك بعد ساعتين.`)) return;
        const r = await fetch(`/api/admin/impersonate/${userId}`, { method: 'POST' });
        const d = await r.json();
        if (r.ok) {
            showToast.success(`جاري الدخول كـ ${name}...`);
            // Store original session and redirect
            sessionStorage.setItem('adminImpersonating', JSON.stringify({
                targetUserId: userId,
                targetName: name,
                token: d.token,
            }));
            // Use the token to update session - redirect to dashboard
            window.location.href = `/api/admin/impersonate/${userId}/session?token=${d.token}`;
        } else showToast.error(d.error);
    };

    const saveCommission = async () => {
        if (!commModal) return;
        const rate = parseFloat(commRate);
        if (isNaN(rate) || rate < 0 || rate > 100) { showToast.error('نسبة غير صالحة'); return; }
        const r = await fetch(`/api/admin/users/${commModal.userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customCommissionRate: rate }),
        });
        if (r.ok) { showToast.success('تم حفظ العمولة المخصصة'); setCommModal(null); }
        else showToast.error('فشل الحفظ');
    };

    const exportPayoutsCSV = () => {
        const headers = ['رقم السحب', 'البائع', 'الإيميل', 'المبلغ', 'الطريقة', 'الحالة', 'التاريخ'];
        const rows = payouts.map((p: any) => [
            p.payoutNumber, p.seller?.name, p.seller?.email,
            p.amount, methodLabel[p.method] ?? p.method, p.status,
            new Date(p.createdAt).toLocaleDateString('ar-SA'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const pendingPayouts = payouts.filter((p: any) => p.status === 'PENDING');
    const pendingCourses = courses;

    const logActionIcon: Record<string, string> = {
        'order.approved': '✅', 'order.rejected': '❌', 'payout.approved': '💰',
        'payout.rejected': '🚫', 'course.approved': '📚', 'course.rejected': '📕',
        'user.banned': '🔴', 'user.activated': '🟢', 'user.commission_changed': '💹',
        'admin.impersonation_started': '👤', 'platform.settings_updated': '⚙️',
        'broadcast.sent': '📢',
    };

    return (
        <div className="space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                        <FiShield className="text-action-blue" /> أدوات الإدارة المتقدمة
                    </h1>
                    <p className="text-text-muted text-sm mt-0.5">عمولات · سحوبات · موافقات · سجل النشاط</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadAll} className="btn btn-outline py-2 px-3">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link href="/dashboard/admin" className="btn btn-outline py-2 px-3 text-sm">
                        ← لوحة الادمن
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <Tab id="payouts" active={activeTab === 'payouts'} onClick={setActiveTab} icon={FiCreditCard} label="السحوبات" badge={pendingPayouts.length} />
                <Tab id="courses" active={activeTab === 'courses'} onClick={setActiveTab} icon={FiBookOpen} label="مراجعة الكورسات" badge={pendingCourses.length} />
                <Tab id="commission" active={activeTab === 'commission'} onClick={setActiveTab} icon={FiPercent} label="العمولات المخصصة" badge={0} />
                <Tab id="logs" active={activeTab === 'logs'} onClick={setActiveTab} icon={FiActivity} label="سجل النشاط" badge={0} />
            </div>

            {/* ══════════════ PAYOUTS ══════════════ */}
            {activeTab === 'payouts' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-primary-charcoal dark:text-white">
                            طلبات السحب <span className="text-sm text-text-muted mr-2">({payouts.length})</span>
                        </h2>
                        <button onClick={exportPayoutsCSV}
                            className="btn bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 flex items-center gap-1.5">
                            <FiDownload /> تصدير CSV البنكي
                        </button>
                    </div>

                    {payouts.length === 0 ? (
                        <div className="card text-center py-12">
                            <FiCheckCircle className="text-5xl text-green-400 mx-auto mb-3" />
                            <p className="font-bold text-primary-charcoal dark:text-white">لا توجد طلبات سحب</p>
                        </div>
                    ) : payouts.map((p: any) => (
                        <div key={p.id} className={`card space-y-3 border-r-4 ${p.status === 'PENDING' ? 'border-orange-400' : p.status === 'COMPLETED' ? 'border-green-400' : 'border-red-400'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-action-blue font-bold">{p.payoutNumber}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.status === 'PENDING' ? '⏳ معلق' : p.status === 'COMPLETED' ? '✅ مكتمل' : '❌ مرفوض'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-text-muted mt-1">{fmtDate(p.createdAt)}</div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-2xl text-primary-charcoal dark:text-white">${fmt(p.amount)}</div>
                                    <div className="text-xs text-text-muted">{methodLabel[p.method] ?? p.method}</div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3 text-sm">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                    <div className="text-text-muted text-xs mb-1">البائع</div>
                                    <div className="font-semibold">{p.seller?.name}</div>
                                    <div className="text-xs text-text-muted">{p.seller?.email}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                    <div className="text-text-muted text-xs mb-1">بيانات التحويل</div>
                                    {p.seller?.payoutMethod === 'bank' && p.seller?.bankDetails && (
                                        <div className="text-xs space-y-0.5">
                                            {Object.entries((p.seller.bankDetails as any) || {}).map(([k, v]: any) => (
                                                <div key={k}><span className="text-text-muted">{k}:</span> {v}</div>
                                            ))}
                                        </div>
                                    )}
                                    {p.seller?.payoutMethod === 'paypal' && (
                                        <div className="text-xs font-mono">{p.seller.paypalEmail}</div>
                                    )}
                                    {p.seller?.payoutMethod === 'crypto' && (
                                        <div className="text-xs font-mono break-all">{p.seller.cryptoWallet}</div>
                                    )}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                    <div className="text-text-muted text-xs mb-1">رقم المعاملة</div>
                                    {p.status === 'PENDING' ? (
                                        <input type="text" value={txId} onChange={e => setTxId(e.target.value)}
                                            placeholder="ادخل رقم الحوالة..." className="input text-xs py-1 w-full" />
                                    ) : (
                                        <div className="text-xs font-mono text-action-blue">{p.transactionId || '—'}</div>
                                    )}
                                </div>
                            </div>

                            {p.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button onClick={() => approvePayout(p.id)} disabled={processing === p.id}
                                        className="flex-1 btn bg-green-500 hover:bg-green-600 text-white font-bold py-2 flex items-center justify-center gap-2">
                                        {processing === p.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck />}
                                        تم التحويل ✓
                                    </button>
                                    <button onClick={() => setRejectModal({ id: p.id, type: 'payout', title: `سحب $${fmt(p.amount)}` })}
                                        className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 flex items-center gap-1">
                                        <FiX /> رفض
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════ COURSES REVIEW ══════════════ */}
            {activeTab === 'courses' && (
                <div className="space-y-4">
                    <h2 className="font-bold text-lg text-primary-charcoal dark:text-white">
                        كورسات بانتظار المراجعة <span className="text-sm text-text-muted mr-2">({courses.length})</span>
                    </h2>

                    {courses.length === 0 ? (
                        <div className="card text-center py-12">
                            <FiCheckCircle className="text-5xl text-green-400 mx-auto mb-3" />
                            <p className="font-bold text-primary-charcoal dark:text-white">لا توجد كورسات بانتظار المراجعة</p>
                        </div>
                    ) : courses.map((c: any) => (
                        <div key={c.id} className="card space-y-3 border-r-4 border-blue-400">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-primary-charcoal dark:text-white">{c.title}</div>
                                    <div className="text-sm text-text-muted">المدرب: {c.user?.name} · {c._count?.sections ?? 0} أقسام</div>
                                    <div className="text-xs text-text-muted mt-1">{fmtDate(c.createdAt)}</div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-xl">${fmt(c.price ?? 0)}</div>
                                </div>
                            </div>

                            {c.description && (
                                <div className="text-sm text-text-muted bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl line-clamp-2">
                                    {c.description}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button onClick={() => approveCourse(c.id)} disabled={processing === c.id}
                                    className="flex-1 btn bg-green-500 hover:bg-green-600 text-white font-bold py-2 flex items-center justify-center gap-2">
                                    {processing === c.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck />}
                                    نشر الكورس ✓
                                </button>
                                <button onClick={() => setRejectModal({ id: c.id, type: 'course', title: c.title })}
                                    className="btn bg-red-500 hover:bg-red-600 text-white py-2 px-4 flex items-center gap-1">
                                    <FiX /> رفض مع ملاحظة
                                </button>
                                <Link href={`/dashboard/courses/${c.id}/edit`}
                                    className="btn btn-outline py-2 px-3 flex items-center gap-1 text-sm">
                                    <FiEye /> معاينة
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════ CUSTOM COMMISSION ══════════════ */}
            {activeTab === 'commission' && (
                <div className="card space-y-4">
                    <div>
                        <h2 className="font-bold text-xl text-primary-charcoal dark:text-white mb-1">عمولات مخصصة للبائعين</h2>
                        <p className="text-sm text-text-muted">تجاوز العمولة العالمية لبائعين محددين (يطبق على الطلبات الجديدة فقط)</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-text-muted text-xs">
                                    <th className="text-right py-3 px-3">البائع</th>
                                    <th className="text-right py-3 px-3">العمولة الحالية</th>
                                    <th className="text-right py-3 px-3">النوع</th>
                                    <th className="text-right py-3 px-3">تغيير</th>
                                    <th className="text-right py-3 px-3">انتحال الشخصية</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts
                                    .filter((_, i, arr) => arr.findIndex(p => p.seller?.id === payouts[i]?.seller?.id) === i)
                                    .map((p: any) => p.seller && (
                                        <tr key={p.seller.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="py-3 px-3">
                                                <div className="font-semibold">{p.seller.name}</div>
                                                <div className="text-xs text-text-muted">{p.seller.email}</div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="font-bold text-action-blue text-lg">
                                                    {p.seller.custom_commission_rate !== null && p.seller.custom_commission_rate !== undefined
                                                        ? `${p.seller.custom_commission_rate}%`
                                                        : 'افتراضي'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.seller.custom_commission_rate !== null ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {p.seller.custom_commission_rate !== null ? '🎯 مخصص' : '🌐 عالمي'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <button
                                                    onClick={() => {
                                                        setCommModal({ userId: p.seller.id, name: p.seller.name, current: p.seller.custom_commission_rate });
                                                        setCommRate(p.seller.custom_commission_rate?.toString() ?? '');
                                                    }}
                                                    className="btn bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs py-1.5 px-3 flex items-center gap-1">
                                                    <FiPercent /> تعديل
                                                </button>
                                            </td>
                                            <td className="py-3 px-3">
                                                <button
                                                    onClick={() => loginAsUser(p.seller.id, p.seller.name)}
                                                    className="btn bg-blue-50 hover:bg-blue-100 text-action-blue text-xs py-1.5 px-3 flex items-center gap-1">
                                                    <FiLogIn /> دخول كـ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {payouts.length === 0 && (
                            <div className="text-center py-8 text-text-muted">
                                <FiUsers className="text-4xl mx-auto mb-2 opacity-30" />
                                <p>لا يوجد بائعون بطلبات سحب</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════ ACTIVITY LOGS ══════════════ */}
            {activeTab === 'logs' && (
                <div className="card space-y-3">
                    <h2 className="font-bold text-xl text-primary-charcoal dark:text-white">📋 الصندوق الأسود - سجل النشاط</h2>
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-text-muted">
                            <FiActivity className="text-4xl mx-auto mb-2 opacity-30" />
                            <p>لا توجد أنشطة مسجلة بعد</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log: any) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="text-2xl mt-0.5">{logActionIcon[log.action] ?? '📌'}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-primary-charcoal dark:text-white text-sm">
                                                {log.actor_name ?? 'System'}
                                            </span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${log.actor_role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {log.actor_role}
                                            </span>
                                        </div>
                                        <div className="text-sm text-text-muted mt-0.5">
                                            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">{log.action}</span>
                                            {log.entity_type && <span className="mr-1">على {log.entity_type} #{log.entity_id?.slice(0, 8)}</span>}
                                        </div>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <div className="text-xs text-text-muted mt-1 font-mono">
                                                {JSON.stringify(log.details).slice(0, 100)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-text-muted whitespace-nowrap">{fmtDate(log.created_at)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════ REJECT MODAL ══════════════ */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiAlertTriangle className="text-red-500" />
                                رفض: {rejectModal.title}
                            </h2>
                            <button onClick={() => setRejectModal(null)} className="text-text-muted hover:text-red-500"><FiX /></button>
                        </div>
                        <div>
                            <label className="label">سبب الرفض (سيُرسل للبائع)</label>
                            <textarea rows={4} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                className="input w-full resize-none" placeholder="اشرح سبب الرفض وما يجب تعديله..." />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={rejectItem} disabled={processing !== null}
                                className="flex-1 btn bg-red-500 hover:bg-red-600 text-white font-bold py-2.5">
                                {processing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'تأكيد الرفض'}
                            </button>
                            <button onClick={() => setRejectModal(null)} className="btn btn-outline px-6">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ COMMISSION MODAL ══════════════ */}
            {commModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg text-primary-charcoal dark:text-white">
                                <FiPercent className="inline ml-2 text-purple-600" />
                                عمولة مخصصة لـ {commModal.name}
                            </h2>
                            <button onClick={() => setCommModal(null)} className="text-text-muted hover:text-red-500"><FiX /></button>
                        </div>
                        <div>
                            <label className="label">نسبة العمولة %</label>
                            <input type="number" min="0" max="100" step="0.5" value={commRate}
                                onChange={e => setCommRate(e.target.value)}
                                className="input w-full text-center text-2xl font-bold" placeholder="مثال: 7.5" />
                            <p className="text-xs text-text-muted mt-1">اتركها فارغة لاستخدام العمولة العالمية. يُطبق على الطلبات الجديدة فقط.</p>
                            {commRate && (
                                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm">
                                    على كل $100: البائع يأخذ <strong>${(100 - parseFloat(commRate || '0')).toFixed(2)}</strong> والمنصة <strong>${parseFloat(commRate || '0').toFixed(2)}</strong>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={saveCommission}
                                className="flex-1 btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5">
                                حفظ العمولة
                            </button>
                            <button onClick={() => setCommModal(null)} className="btn btn-outline px-6">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
