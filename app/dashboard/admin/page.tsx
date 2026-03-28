'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp,
    FiAlertCircle, FiCheck, FiX, FiEye, FiRefreshCw,
    FiShield, FiGrid, FiList, FiCreditCard, FiGlobe,
    FiBarChart2, FiActivity, FiUserCheck, FiPackage,
    FiDownload, FiSend, FiSlash, FiUnlock, FiTag, FiLink, FiTarget,
    FiPlusCircle, FiPieChart, FiSearch, FiUser, FiStar
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// ─── Helpers ───────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
const methodLabel: Record<string, string> = {
    stripe: 'بطاقة Stripe', manual: 'تحويل يدوي', crypto: 'كريبتو',
    free: 'مجاني', paypal: 'PayPal',
};
const statusBadge: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700', PAID: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-purple-100 text-purple-700',
};
const statusLabel: Record<string, string> = {
    PENDING: 'معلق', PAID: 'مدفوع', COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي', REFUNDED: 'مسترجع',
};

// ─── Components ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className={`card ${color} text-white transition-all hover:scale-[1.02] cursor-default`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">{label}</span>
                <div className="p-2 bg-white/20 rounded-lg"><Icon className="text-xl" /></div>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            {sub && <div className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-wider">{sub}</div>}
        </div>
    );
}

function Tab({ id, active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap relative ${active
                ? 'bg-action-blue text-white shadow-xl shadow-action-blue/20'
                : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <Icon className="text-base" />
            {label}
            {badge > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {badge}
                </span>
            )}
        </button>
    );
}

// ─── Main Admin Dashboard ───────────────────────────────────
export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [period, setPeriod] = useState('30');
    const [verifying, setVerifying] = useState<string | null>(null);
    const [userFilter, setUserFilter] = useState('');
    const [togglingUser, setTogglingUser] = useState<string | null>(null);
    const [marketingLoading, setMarketingLoading] = useState(false);

    // Dynamic Lists State
    const [allCoupons, setAllCoupons] = useState<any[]>([]);
    const [allAffiliates, setAllAffiliates] = useState<any[]>([]);
    const [allBroadcasts, setAllBroadcasts] = useState<any[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [payoutStats, setPayoutStats] = useState<any>(null);

    // Impersonation Support
    const [impersonating, setImpersonating] = useState<string | null>(null);
    const [masterKey, setMasterKey] = useState('');
    const [showMasterKeyModal, setShowMasterKeyModal] = useState<string | null>(null);

    // Broadcast Engine Support
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcast, setBroadcast] = useState({ subject: '', message: '', target: 'sellers' });
    const [sending, setSending] = useState(false);

    const load = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setIsRefreshing(true);
        try {
            const r = await fetch(`/api/admin/dashboard?period=${period}`);
            setData(await r.json());
        } catch { } finally { setLoading(false); setIsRefreshing(false); }
    }, [period]);

    useEffect(() => { load(); }, [load]);

    // Active Tab Data Loaders
    useEffect(() => {
        const fetchers: any = {
            coupons: () => fetch('/api/admin/coupons').then(r => r.json()).then(setAllCoupons),
            affiliates: () => fetch('/api/admin/affiliates').then(r => r.json()).then(setAllAffiliates),
            broadcasts: () => fetch('/api/admin/broadcast/list').then(r => r.json()).then(setAllBroadcasts),
            verification: () => fetch('/api/admin/verification').then(r => r.json()).then(d => setVerificationRequests(d.requests)),
            payouts: () => fetch('/api/admin/payouts?limit=50&status=PENDING').then(r => r.json()).then(d => {
                setPayouts(d.payouts || []);
                setPayoutStats(d.stats);
            })
        };

        if (fetchers[activeTab]) {
            setMarketingLoading(true);
            fetchers[activeTab]().finally(() => setMarketingLoading(false));
        }
    }, [activeTab]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            load(false);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, load]);

    const toggleUser = async (userId: string, isActive: boolean) => {
        setTogglingUser(userId);
        try {
            const r = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            });
            if (r.ok) {
                // Optimistic UI update
                setData((prev: any) => ({
                    ...prev,
                    recentUsers: prev.recentUsers.map((u: any) =>
                        u.id === userId ? { ...u, isActive } : u
                    ),
                }));
                showToast.success(isActive ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب');
            }
        } catch { showToast.error('فشل التحديث'); }
        finally { setTogglingUser(null); }
    };

    const sendBroadcast = async () => {
        if (!broadcast.subject || !broadcast.message) {
            showToast.error('العنوان والرسالة مطلوبان'); return;
        }
        setSending(true);
        try {
            const r = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(broadcast),
            });
            const res = await r.json();
            if (r.ok) {
                showToast.success(res.message ?? 'تم الإرسال!');
                setShowBroadcast(false);
                setBroadcast({ subject: '', message: '', target: 'sellers' });
            } else showToast.error(res.error ?? 'فشل الإرسال');
        } catch { showToast.error('حدث خطأ'); }
        finally { 
            setSending(false); 
            fetch('/api/admin/broadcast/list').then(r => r.json()).then(setAllBroadcasts);
        }
    };

    const cancelBroadcast = async (id: string) => {
        if (!confirm('هل أنت متأكد من إيقاف هذا البث؟ لن تُرسل الرسائل المتبقية.')) return;
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'stop' })
            });
            if (res.ok) {
                showToast.success('تم إيقاف البث بنجاح');
                fetch('/api/admin/broadcast/list').then(r => r.json()).then(setAllBroadcasts);
            } else {
                showToast.error('فشل في إيقاف البث');
            }
        } catch(e) { showToast.error('حدث خطأ بالاتصال'); }
    };

    const verifyOrder = async (orderId: string, action: 'approve' | 'reject') => {
        setVerifying(orderId);
        try {
            await fetch(`/api/admin/orders/${orderId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            await load();
            showToast.success(action === 'approve' ? 'تم تأكيد الطلب' : 'تم رفض الطلب');
        } catch { showToast.error('حدث خطأ أثناء المعالجة'); }
        finally { setVerifying(null); }
    };

    const ov = data?.overview ?? {};
    const pendingManual = data?.recentOrders?.filter((o: any) => o.paymentMethod === 'manual' && o.status === 'PENDING') ?? [];

    const tabs = [
        { id: 'overview', icon: FiGrid, label: 'الرئيسية', badge: 0 },
        { id: 'sales', icon: FiShoppingCart, label: 'المبيعات', badge: 0 },
        { id: 'manual', icon: FiCreditCard, label: 'التحويلات', badge: pendingManual.length },
        { id: 'payouts', icon: FiDollarSign, label: 'السحوبات المالية', badge: 0 },
        { id: 'broadcasts', icon: FiSend, label: 'البث المباشر', badge: 0 },
        { id: 'verification', icon: FiShield, label: 'التوثيق', badge: ov.pendingVerifications || 0 },
        { id: 'users', icon: FiUsers, label: 'المستخدمون', badge: 0 },
    ];

    if (loading && !data) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-action-blue/30 border-t-action-blue rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                        <FiShield className="text-action-blue" /> مركز الإدارة الموحد
                    </h1>
                    <p className="text-text-muted text-sm font-bold opacity-80 mt-1">إدارة شاملة لجميع فعاليات المنصة من مكان واحد</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 font-bold text-xs outline-none">
                        <option value="7">آخر 7 أيام</option>
                        <option value="30">آخر 30 يوم</option>
                        <option value="365">آخر سنة</option>
                    </select>
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className={`btn font-bold text-[10px] px-4 py-2 ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>البث الحي {autoRefresh ? 'نشط' : 'متوقف'}</button>
                    <button onClick={() => load(true)} className="btn btn-outline border-gray-100 py-2 px-3 shadow-sm transition-transform active:rotate-180"><FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} /></button>
                </div>
            </div>

            {/* Platform Management Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {tabs.map(t => (
                    <Tab key={t.id} id={t.id} active={activeTab === t.id} onClick={setActiveTab} icon={t.icon} label={t.label} badge={t.badge} />
                ))}
            </div>

            {/* TAB CONTENT MAPPING */}
            <div className="animate-in slide-in-from-bottom-5 duration-500">
                {/* 1. OVERVIEW (Dashboard) */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={FiUsers} label="إجمالي المستخدمين" color="bg-gradient-to-br from-action-blue to-blue-600" value={fmt(ov.totalUsers ?? 0)} sub={`+${ov.newUsers ?? 0} جديد`} />
                            <StatCard icon={FiDollarSign} label="إيرادات المنصة" color="bg-gradient-to-br from-green-500 to-green-700" value={`$${fmt(ov.totalRevenue ?? 0)}`} sub={`الصافي: $${fmt(ov.platformFees ?? 0)}`} />
                            <StatCard icon={FiShoppingCart} label="الطلبات الكلية" color="bg-gradient-to-br from-purple-500 to-purple-700" value={fmt(ov.totalOrders ?? 0)} sub={`${ov.periodOrders ?? 0} فترة الطلب`} />
                            <StatCard icon={FiAlertCircle} label="تحويلات معلقة" color="bg-gradient-to-br from-orange-500 to-red-600" value={ov.pendingManual ?? 0} sub="تحتاج مراجعة فورية" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <div className="card-glass p-6 rounded-xl border border-white/20 min-h-[400px]">
                                <h3 className="font-bold text-xl mb-6">منحنى نمو الإيرادات</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data?.dailyRevenue}>
                                        <defs><linearGradient id="clr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                                        <XAxis dataKey="date" />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#clr)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="card p-6 rounded-xl border border-gray-100 h-full">
                                <h3 className="font-bold text-xl mb-6">توزيع الطلبات</h3>
                                <div className="space-y-4">
                                    {(data?.ordersByMethod || []).map((m: any) => (
                                        <div key={m.method} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl">
                                            <div className="font-bold">{methodLabel[m.method] || m.method}</div>
                                            <div className="font-bold text-action-blue">${fmt(m.total)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TOP SELLERS LEADERBOARD (Consolidated from legacy) */}
                        <div className="card p-8 rounded-2xl border border-gray-100 dark:border-gray-800 mt-8">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <FiStar className="text-yellow-400 fill-yellow-400" /> نجوم المنصة (أعلى البائعين)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(data?.topSellers || []).map((s: any, idx: number) => (
                                    <div key={s.id} className="relative group bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-xl border border-transparent hover:border-action-blue/20 transition-all flex items-center gap-4">
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-action-blue flex items-center justify-center font-bold text-xs shadow-lg">{idx + 1}</div>
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                                            {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-lg group-hover:text-action-blue transition-colors truncate">{s.name}</div>
                                            <div className="text-xs font-bold text-text-muted opacity-60 uppercase truncate">{s.email}</div>
                                            <div className="mt-2 flex items-center gap-3">
                                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold">${fmt(s.totalEarnings || 0)}</div>
                                                <div className="text-[10px] font-bold text-gray-400">{s._count?.sellerOrders || 0} طلبات</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MANUAL ORDERS (Bank Transfers etc) */}
                {activeTab === 'manual' && (
                    <div className="card space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-2xl">طلبات بانتظار التحقق البنكي 🏦</h2>
                            <div className="text-xs font-bold text-text-muted">الرجاء التحقق من وصول المبلغ قبل التأكيد</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-100/50 text-[10px] font-bold uppercase text-text-muted">
                                    <tr><th className="py-4 px-3">رقم الطلب</th><th className="py-4 px-3">العميل</th><th className="py-4 px-3">المبلغ</th><th className="py-4 px-3">التفاصيل</th><th className="py-4 px-3">الإجراء</th></tr>
                                </thead>
                                <tbody>
                                    {pendingManual.length === 0 ? <tr><td colSpan={5} className="py-20 text-center opacity-40 font-bold">لا توجد طلبات معلقة 🚀</td></tr> : pendingManual.map((o: any) => (
                                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-4 px-3 font-mono font-bold">{o.orderNumber}</td>
                                            <td className="py-4 px-3">
                                                <div className="font-bold">{o.customerName}</div>
                                                <div className="text-[10px] opacity-60 uppercase">{o.customerEmail}</div>
                                            </td>
                                            <td className="py-4 px-3 font-bold text-green-600">${fmt(o.amount)}</td>
                                            <td className="py-4 px-3 max-w-[200px] truncate opacity-80">{o.productTitle}</td>
                                            <td className="py-4 px-3 flex gap-2">
                                                <button onClick={() => verifyOrder(o.id, 'approve')} disabled={verifying === o.id} className="btn bg-green-500 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-green-600 transition-all">{verifying === o.id ? 'جاري...' : 'تأكيد القبض'}</button>
                                                <button onClick={() => verifyOrder(o.id, 'reject')} disabled={verifying === o.id} className="btn bg-red-50 text-red-500 py-2 px-4 rounded-xl text-xs hover:bg-red-100 transition-all">رفض</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 2. SALES LOG */}
                {activeTab === 'sales' && (
                    <div className="card p-0 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-xl">سجل المبيعات الكامل</h3>
                            <button onClick={() => {}} className="btn btn-primary py-2 px-4 shadow-xl"><FiDownload /> تصدير مالي</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-100/50 text-[10px] font-bold uppercase text-text-muted">
                                    <tr><th className="py-4 px-6">الطلب</th><th className="py-4 px-6">العميل</th><th className="py-4 px-6">المنتج</th><th className="py-4 px-6">المبلغ</th><th className="py-4 px-6">الحالة</th></tr>
                                </thead>
                                <tbody>
                                    {(data?.recentOrders || []).map((o: any) => (
                                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="py-4 px-6 font-mono font-bold">{o.orderNumber}</td><td className="py-4 px-6 font-bold">{o.customerName}</td><td className="py-4 px-6 opacity-80">{o.productTitle}</td><td className="py-4 px-6 font-bold text-green-600">${fmt(o.amount)}</td><td className="py-4 px-6"><span className={`px-2 py-0.5 rounded-full text-[10px] ${statusBadge[o.status]}`}>{statusLabel[o.status] || o.status}</span></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. PAYOUTS */}
                {activeTab === 'payouts' && (
                    <div className="card space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-3xl">إدارة المسحوبات</h2>
                            <div className="bg-green-50 dark:bg-green-900/10 px-6 py-3 rounded-2xl border border-green-100 text-center">
                                <span className="text-[10px] block font-bold uppercase text-green-600">إجمالي المدفوع</span>
                                <span className="text-2xl font-bold text-green-700">${fmt(payoutStats?.completedAmount?._sum?.amount || 0)}</span>
                            </div>
                        </div>
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 text-[10px] font-bold uppercase"><tr className="border-b border-gray-100"><th className="py-4 px-3">المبدع</th><th className="py-4 px-3">المبلغ</th><th className="py-4 px-3">الوضعية</th><th className="py-4 px-3">الإجراء</th></tr></thead>
                            <tbody>
                                {payouts.length === 0 ? <tr><td colSpan={4} className="py-12 text-center opacity-40 font-bold">لا توجد طلبات سحب معلقة</td></tr> : payouts.map((p: any) => (
                                    <tr key={p.id} className="border-b border-gray-50"><td className="py-4 px-3"><div className="font-bold">{p.user?.name}</div><div className="text-[10px] text-text-muted">{p.user?.email}</div></td><td className="py-4 px-3 font-bold text-2xl text-green-600">${fmt(p.amount)}</td><td className="py-4 px-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold">PENDING</span></td><td className="py-4 px-3"><button onClick={async () => { if(confirm('تأكيد التحويل؟')) { await fetch(`/api/admin/payouts/${p.id}`, {method:'PATCH', body: JSON.stringify({status:'COMPLETED'})}); showToast.success('تمت الموافقة'); setActiveTab('overview'); setActiveTab('payouts'); } }} className="btn btn-primary py-2 px-6 rounded-xl font-bold shadow-lg">إرسال المبلغ</button></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. BROADCASTS */}
                {activeTab === 'broadcasts' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card-glass p-8 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="text-5xl">📣</div>
                                <h3 className="text-2xl font-bold">محرك الإعلانات الجماعي</h3>
                                <p className="text-text-muted text-sm font-bold">أرسل رسائل البريد الإلكتروني والبريم للآلاف بضغطة واحدة</p>
                                <button onClick={() => setShowBroadcast(true)} className="btn btn-primary w-full py-4 rounded-3xl font-bold text-lg bg-gradient-to-r from-action-blue to-blue-700">إنشاء حملة إعلانية الآن</button>
                            </div>
                            <div className="card p-6 overflow-hidden">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><FiActivity /> السجل المباشر للعمليات</h4>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {(allBroadcasts || []).map((b: any) => (
                                        <div key={b.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-sm">{b.subject}</div>
                                                <div className="text-[9px] font-bold uppercase text-action-blue">{b.recipientCriteria}</div>
                                            </div>
                                            <div className="flex items-center gap-4 text-right tracking-tighter">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800">{b.sentCount || 0} / {b.recipientCount}</div>
                                                    <div className={`text-[8px] font-bold uppercase ${
                                                        b.status === 'CANCELLED' ? 'text-red-500' :
                                                        b.status === 'COMPLETED' ? 'text-green-600' :
                                                        'text-orange-500'
                                                    }`}>{b.status}</div>
                                                </div>
                                                {(b.status === 'PENDING' || b.status === 'SENDING') && (
                                                    <button 
                                                        onClick={() => cancelBroadcast(b.id)} 
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold rounded-lg transition-colors border border-red-200"
                                                    >
                                                        إيقاف
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. USER PROTECTION & MANAGEMENT */}
                {activeTab === 'users' && (
                     <div className="card space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-2xl">إدارة صلاحيات المستخدمين</h2>
                            <div className="relative"><FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="بحث بالاسم أو البريد..." className="input pr-12 rounded-2xl w-64" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} /></div>
                        </div>
                        <div className="overflow-x-auto"><table className="w-full text-sm text-right">
                            <thead className="bg-gray-100/50 text-[10px] font-bold uppercase text-text-muted"><tr><th className="py-4 px-3">المستخدم</th><th className="py-4 px-3">الدولة</th><th className="py-4 px-3">الدور</th><th className="py-4 px-3">المبيعات</th><th className="py-4 px-3">الحالة</th><th className="py-4 px-3">تحكم</th></tr></thead>
                            <tbody>
                                {(data?.recentUsers || []).filter((u:any) => !userFilter || u.email?.includes(userFilter)).map((u: any) => (
                                    <tr key={u.id} className="border-b border-gray-50">
                                        <td className="py-4 px-3 font-bold">{u.name}<div className="text-[9px] text-text-muted opacity-60 uppercase">{u.email}</div></td>
                                        <td className="py-4 px-3 text-xs">{u.country || '-'}</td>
                                        <td className="py-4 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                                        <td className="py-4 px-3 font-bold">{u._count?.sellerOrders || 0}</td>
                                        <td className="py-4 px-3"><span className={`w-3 h-3 rounded-full inline-block ${u.isActive ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-red-500'}`} /></td>
                                        <td className="py-4 px-3 flex gap-2">
                                            <button onClick={() => toggleUser(u.id, !u.isActive)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><FiSlash className={u.isActive ? 'text-red-500' : 'text-green-500'} /></button>
                                            {u.role !== 'ADMIN' && <button onClick={() => setShowMasterKeyModal(u.id)} className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors shadow-sm"><FiUser /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table></div>
                    </div>
                )}

                {/* 6. VERIFICATION (Brief Review) */}
                {activeTab === 'verification' && (
                    <div className="card space-y-6">
                        <div className="flex items-center justify-between"><h2 className="font-bold text-2xl">طلبات التوثيق الجديدة 🛡️</h2><Link href="/dashboard/admin/verification" className="btn btn-primary py-2 px-6">فتح الفحص الكامل</Link></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(verificationRequests || []).length === 0 ? <div className="col-span-full py-12 text-center font-bold opacity-30">لا توجد طلبات معلقة حالياً</div> : verificationRequests.map((vr:any) => (
                                <div key={vr.id} className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-4">
                                    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-action-blue flex items-center justify-center text-white font-bold text-xl">{vr.user?.name?.charAt(0)}</div><div><div className="font-bold text-sm">{vr.user?.name}</div><div className="text-[10px] font-bold text-action-blue uppercase tracking-widest">{vr.documentType}</div></div></div>
                                    <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden relative"><img src={vr.documentUrl} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20" /></div>
                                    <div className="flex gap-2"><button onClick={async () => { await fetch('/api/admin/verification', {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({requestId:vr.id, decision:'APPROVE'})}); showToast.success('تم التوثيق'); load(false); setActiveTab('verification'); }} className="flex-1 btn bg-green-500 text-white font-bold py-2 rounded-xl text-xs">قبول</button><button onClick={async () => { const reason = prompt('السبب:'); if(reason) { await fetch('/api/admin/verification', {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({requestId:vr.id, decision:'REJECT', rejectionReason:reason})}); showToast.success('تم الرفض'); load(false); setActiveTab('verification'); } }} className="flex-1 btn bg-red-50 text-red-500 py-2 rounded-xl text-xs">رفض</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MASTER KEY MODAL */}
            {showMasterKeyModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowMasterKeyModal(null)}></div><div className="relative bg-white dark:bg-card-white w-full max-w-md rounded-xl shadow-2xl p-10 space-y-6"><div className="text-center"><div className="text-5xl mb-4">🔐</div><h3 className="text-2xl font-bold">الدخول المركزي (God Mode)</h3><p className="text-sm text-text-muted font-bold opacity-80">يرجى تأكيد هويتك باستخدام المفتاح الأمني المركزي</p></div><input type="password" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-center tracking-[1em]" placeholder="••••••••" /><div className="flex gap-4"><button onClick={async () => { setImpersonating(showMasterKeyModal); const r = await fetch(`/api/admin/impersonate/${showMasterKeyModal}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secretKey: masterKey }), }); const res = await r.json(); if (r.ok && res.token) { window.location.href = '/dashboard'; } else { showToast.error(res.error || 'المفتاح غير صحيح'); } setImpersonating(null); }} className="flex-1 btn bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl">تحقق ودخول</button></div></div></div>
            )}

            {/* BROADCAST MODAL */}
            {showBroadcast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-card-white rounded-xl p-8 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">🚀 حملة مراسلة جديدة</h2>
                            <button onClick={() => setShowBroadcast(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX className="text-xl" /></button>
                        </div>
                        <div className="space-y-6">
                            <div><label className="text-sm font-bold mb-2 block">عنوان الحملة (Subject):</label><input type="text" className="input" placeholder="مثلاً: خصم جديد لجميع البائعين..." value={broadcast.subject} onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })} /></div>
                            <div><label className="text-sm font-bold mb-2 block">الفئة المستهدفة:</label><select className="input" value={broadcast.target} onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value })}><option value="all">الجميع</option><option value="sellers">البائعون فقط</option><option value="new_users">المستخدمون الجدد</option></select></div>
                            <div><label className="text-sm font-bold mb-2 block">محتوى الرسالة (Markdown):</label><textarea className="input min-h-[200px] font-mono text-sm" placeholder="اكتب رسالتك هنا..." value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} /></div>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-3">
                            <FiAlertCircle className="text-action-blue mt-1 shrink-0" /><p className="text-xs text-blue-700 font-bold leading-relaxed">تنبيه: سيتم إرسال هذه الرسالة فوراً لجميع المستخدمين في الفئة المحددة. يرجى مراجعة المحتوى بعناية لتجنب إزعاج المستخدمين.</p>
                        </div>
                        <button onClick={sendBroadcast} disabled={sending} className="btn btn-primary w-full py-5 rounded-3xl font-bold text-xl shadow-2xl shadow-action-blue/30">{sending ? 'جاري الإطلاق والتحضير...' : 'إرسال الحملة الآن'}</button>
                    </div>
                </div>
            )}

        </div>
    );
}
