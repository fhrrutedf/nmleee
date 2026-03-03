'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp,
    FiAlertCircle, FiCheck, FiX, FiEye, FiRefreshCw,
    FiShield, FiGrid, FiList, FiCreditCard, FiGlobe,
    FiBarChart2, FiActivity, FiUserCheck, FiPackage,
    FiDownload, FiSend, FiSlash, FiUnlock
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
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

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className={`card ${color} text-white`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-80">{label}</span>
                <div className="p-2 bg-white/20 rounded-lg"><Icon className="text-xl" /></div>
            </div>
            <div className="text-3xl font-bold">{value}</div>
            {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
        </div>
    );
}

// ─── Tab Button ────────────────────────────────────────────
function Tab({ id, active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap relative ${active
                ? 'bg-action-blue text-white shadow-md'
                : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <Icon className="text-base" />
            {label}
            {badge > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}

// ─── Main ──────────────────────────────────────────────────
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

    // Broadcast modal state
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

    // Real-time polling
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            load(false); // Silent reload
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, load]);

    const verifyOrder = async (orderId: string, action: 'approve' | 'reject') => {
        setVerifying(orderId);
        try {
            await fetch(`/api/admin/orders/${orderId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            await load();
        } finally { setVerifying(null); }
    };

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

    const exportCSV = () => {
        const orders = data?.recentOrders ?? [];
        if (!orders.length) return;
        const headers = ['رقم الطلب', 'العميل', 'الإيميل', 'المنتج', 'البائع', 'المبلغ', 'عمولة المنصة', 'صافي البائع', 'الدفع', 'الحالة', 'التاريخ'];
        const rows = orders.map((o: any) => [
            o.orderNumber, o.customerName, o.customerEmail, o.productTitle,
            o.seller?.name ?? '', o.amount, o.platformFee ?? 0,
            o.sellerAmount ?? 0, methodLabel[o.paymentMethod] ?? o.paymentMethod,
            statusLabel[o.status] ?? o.status, new Date(o.createdAt).toLocaleDateString('ar-SA'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
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
        finally { setSending(false); }
    };

    const ov = data?.overview ?? {};
    const pendingManual = data?.recentOrders?.filter((o: any) => o.paymentMethod === 'manual' && o.status === 'PENDING') ?? [];

    const tabs = [
        { id: 'overview', icon: FiGrid, label: 'نظرة عامة', badge: 0 },
        { id: 'sales', icon: FiShoppingCart, label: 'المبيعات', badge: 0 },
        { id: 'manual', icon: FiCreditCard, label: 'التحويلات', badge: pendingManual.length },
        { id: 'users', icon: FiUsers, label: 'المستخدمون', badge: 0 },
        { id: 'sellers', icon: FiUserCheck, label: 'البائعون', badge: 0 },
    ];

    return (
        <div className="space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                        <FiShield className="text-action-blue" /> لوحة تحكم المنصة
                    </h1>
                    <p className="text-text-muted text-sm mt-0.5">إحصاءات وبيانات المنصة الكاملة</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="input text-sm py-2">
                        <option value="7">آخر 7 أيام</option>
                        <option value="30">آخر 30 يوم</option>
                        <option value="90">آخر 90 يوم</option>
                        <option value="365">آخر سنة</option>
                    </select>
                    <button onClick={() => setShowBroadcast(true)}
                        className="btn bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-sm flex items-center gap-1.5">
                        <FiSend /> إرسال بث
                    </button>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`btn text-sm py-2 px-3 flex items-center gap-1.5 ${autoRefresh ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 'btn-outline border-gray-300'}`}
                        title="تحديث تلقائي (لحظي)"
                    >
                        معالجة لحظية
                        {autoRefresh && <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>}
                    </button>
                    <button onClick={() => load(true)} className="btn btn-outline py-2 px-3" title="تحديث يدوي">
                        <FiRefreshCw className={loading || isRefreshing ? 'animate-spin text-action-blue' : ''} />
                    </button>
                    <Link href="/dashboard/admin/platform-settings" className="btn btn-outline py-2 px-3 text-sm flex items-center gap-1">
                        <FiActivity /> الإعدادات
                    </Link>
                </div>
            </div>

            {/* Broadcast Modal */}
            {showBroadcast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-xl text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiSend className="text-purple-600" /> إرسال رسالة جماعية
                            </h2>
                            <button onClick={() => setShowBroadcast(false)} className="text-text-muted hover:text-red-500">
                                <FiX className="text-xl" />
                            </button>
                        </div>
                        <div>
                            <label className="label">المستلمون</label>
                            <select value={broadcast.target} onChange={e => setBroadcast(b => ({ ...b, target: e.target.value }))} className="input w-full">
                                <option value="sellers">البائعون فقط</option>
                                <option value="all">جميع المستخدمين</option>
                                <option value="admins">المشرفون فقط</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">عنوان الرسالة</label>
                            <input type="text" value={broadcast.subject}
                                onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))}
                                className="input w-full" placeholder="مثل: تحديثات جديدة في المنصة" />
                        </div>
                        <div>
                            <label className="label">نص الرسالة</label>
                            <textarea rows={5} value={broadcast.message}
                                onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                                className="input w-full resize-none" placeholder="اكتب رسالتك هنا..." />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button onClick={sendBroadcast} disabled={sending}
                                className="flex-1 btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 flex items-center justify-center gap-2">
                                {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend />}
                                {sending ? 'جاري الإرسال...' : 'إرسال الآن'}
                            </button>
                            <button onClick={() => setShowBroadcast(false)} className="btn btn-outline px-6">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <Tab key={t.id} id={t.id} active={activeTab === t.id} onClick={setActiveTab}
                        icon={t.icon} label={t.label} badge={t.badge} />
                ))}
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="w-12 h-12 border-4 border-action-blue/30 border-t-action-blue rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* ══════════════ OVERVIEW ══════════════ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-5">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={FiUsers} label="إجمالي المستخدمين" color="bg-gradient-to-br from-action-blue to-blue-600"
                                    value={fmt(ov.totalUsers ?? 0)} sub={`+${ov.newUsers ?? 0} جديد هذه الفترة`} />
                                <StatCard icon={FiDollarSign} label="إيرادات المنصة الكلية" color="bg-gradient-to-br from-green-500 to-green-700"
                                    value={`$${fmt(ov.totalRevenue ?? 0)}`} sub={`المنصة: $${fmt(ov.platformFees ?? 0)}`} />
                                <StatCard icon={FiShoppingCart} label="الطلبات الكلية" color="bg-gradient-to-br from-purple-500 to-purple-700"
                                    value={fmt(ov.totalOrders ?? 0)} sub={`${ov.periodOrders ?? 0} في هذه الفترة`} />
                                <StatCard icon={FiAlertCircle} label="تحويلات بانتظار المراجعة" color="bg-gradient-to-br from-orange-500 to-red-500"
                                    value={ov.pendingManual ?? 0} sub="اضغط على التحويلات للمراجعة" />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={FiUserCheck} label="البائعون النشطون" color="bg-gradient-to-br from-teal-500 to-teal-700"
                                    value={ov.activeSellers ?? 0} sub={`من ${ov.totalSellers ?? 0} بائع`} />
                                <StatCard icon={FiTrendingUp} label="إيرادات هذه الفترة" color="bg-gradient-to-br from-indigo-500 to-indigo-700"
                                    value={`$${fmt(ov.periodRevenue ?? 0)}`} sub={`نمو ${ov.ordersGrowth ?? 0}%`} />
                                <StatCard icon={FiBarChart2} label="نمو المستخدمين" color="bg-gradient-to-br from-pink-500 to-rose-600"
                                    value={`${ov.usersGrowth ?? 0}%`} sub="مقارنة بالفترة السابقة" />
                                <StatCard icon={FiPackage} label="عمولة المنصة" color="bg-gradient-to-br from-amber-500 to-orange-600"
                                    value={`$${fmt(ov.platformFees ?? 0)}`} sub="إجمالي العمولات المحصلة" />
                            </div>

                            {/* ══════════════ CHARTS ══════════════ */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
                                {/* Daily Revenue Line Chart */}
                                <div className="card shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                                    <h2 className="font-bold text-primary-charcoal dark:text-white mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-action-blue rounded-lg">
                                            <FiTrendingUp className="text-xl" />
                                        </div>
                                        حجم المبيعات اليومية (آخر 30 يوم)
                                    </h2>
                                    <div className="h-72 w-full" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                <XAxis
                                                    dataKey="day"
                                                    stroke="#9ca3af"
                                                    style={{ fontSize: '11px', fontFamily: 'inherit' }}
                                                    tickFormatter={(str) => {
                                                        const parts = str.split('-');
                                                        return `${parts[2]}/${parts[1]}`;
                                                    }}
                                                    tickMargin={10}
                                                />
                                                <YAxis
                                                    stroke="#9ca3af"
                                                    style={{ fontSize: '11px', fontFamily: 'inherit' }}
                                                    tickFormatter={(val) => `$${val}`}
                                                    width={60}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
                                                    formatter={(value: number, name: string) => [
                                                        name === 'revenue' ? `$${value}` : value,
                                                        name === 'revenue' ? 'المبيعات ($)' : 'الطلبات'
                                                    ]}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                                <Line
                                                    type="monotone"
                                                    name="revenue"
                                                    dataKey="revenue"
                                                    stroke="#0052FF" /* Action Blue */
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0052FF' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Sales By Country Donut Chart */}
                                <div className="card shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                                    <h2 className="font-bold text-primary-charcoal dark:text-white mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                                            <FiGlobe className="text-xl" />
                                        </div>
                                        نسبة المبيعات حسب الدولة
                                    </h2>
                                    <div className="h-72 w-full flex items-center justify-center" dir="ltr">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.salesByCountry}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    nameKey="name"
                                                    stroke="none"
                                                >
                                                    {data.salesByCountry?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number) => [`$${value}`, 'المبيعات الإجمالية']}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders mini */}
                            <div className="card mt-8">
                                <h2 className="font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                                    <FiList /> آخر الطلبات
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-800 text-text-muted">
                                                <th className="text-right py-2 px-3">الطلب</th>
                                                <th className="text-right py-2 px-3">العميل</th>
                                                <th className="text-right py-2 px-3">البائع</th>
                                                <th className="text-right py-2 px-3">المبلغ</th>
                                                <th className="text-right py-2 px-3">الحالة</th>
                                                <th className="text-right py-2 px-3">التاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.recentOrders?.slice(0, 8).map((o: any) => (
                                                <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="py-2 px-3">
                                                        <span className="font-mono text-xs text-action-blue">{o.orderNumber}</span>
                                                        <div className="text-xs text-text-muted truncate max-w-[120px]">{o.productTitle}</div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="font-medium truncate max-w-[100px]">{o.customerName}</div>
                                                        <div className="text-xs text-text-muted">{methodLabel[o.paymentMethod] ?? o.paymentMethod}</div>
                                                    </td>
                                                    <td className="py-2 px-3 text-xs text-text-muted">
                                                        {o.seller?.name ?? 'غير محدد'}
                                                    </td>
                                                    <td className="py-2 px-3 font-bold">${fmt(o.amount)}</td>
                                                    <td className="py-2 px-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                            {statusLabel[o.status] ?? o.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-xs text-text-muted">{fmtDate(o.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Countries + Methods */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="card">
                                    <h2 className="font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                                        <FiGlobe /> المستخدمون حسب الدولة
                                    </h2>
                                    <div className="space-y-3">
                                        {data?.usersByCountry?.map((c: any) => (
                                            <div key={c.country} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{c.country || 'غير محدد'}</span>
                                                <div className="flex items-center gap-2 flex-1 mx-3">
                                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-action-blue rounded-full"
                                                            style={{ width: `${Math.min((c.count / (data.overview?.totalUsers || 1)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-action-blue w-8 text-left">{c.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card">
                                    <h2 className="font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                                        <FiCreditCard /> طرق الدفع
                                    </h2>
                                    <div className="space-y-3">
                                        {data?.ordersByMethod?.map((m: any) => (
                                            <div key={m.method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <div>
                                                    <div className="font-semibold text-sm">{methodLabel[m.method] ?? m.method}</div>
                                                    <div className="text-xs text-text-muted">{m.count} طلب</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-green-600">${fmt(m.total)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ SALES ══════════════ */}
                    {activeTab === 'sales' && (
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-xl text-primary-charcoal dark:text-white">جميع الطلبات</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-text-muted">{data?.recentOrders?.length ?? 0} طلب</span>
                                    <button onClick={exportCSV}
                                        className="btn bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3 flex items-center gap-1.5">
                                        <FiDownload /> تصدير CSV
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-text-muted text-xs">
                                            <th className="text-right py-3 px-3">رقم الطلب</th>
                                            <th className="text-right py-3 px-3">العميل</th>
                                            <th className="text-right py-3 px-3">المنتج</th>
                                            <th className="text-right py-3 px-3">البائع</th>
                                            <th className="text-right py-3 px-3">المبلغ</th>
                                            <th className="text-right py-3 px-3">عمولة المنصة</th>
                                            <th className="text-right py-3 px-3">صافي البائع</th>
                                            <th className="text-right py-3 px-3">الدفع</th>
                                            <th className="text-right py-3 px-3">الحالة</th>
                                            <th className="text-right py-3 px-3">التاريخ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.recentOrders?.map((o: any) => (
                                            <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="py-2.5 px-3 font-mono text-xs text-action-blue">{o.orderNumber}</td>
                                                <td className="py-2.5 px-3">
                                                    <div className="font-medium text-sm">{o.customerName}</div>
                                                    <div className="text-xs text-text-muted">{o.customerEmail}</div>
                                                </td>
                                                <td className="py-2.5 px-3 text-xs max-w-[120px] truncate">{o.productTitle}</td>
                                                <td className="py-2.5 px-3 text-xs text-text-muted">{o.seller?.name ?? '—'}</td>
                                                <td className="py-2.5 px-3 font-bold">${fmt(o.amount)}</td>
                                                <td className="py-2.5 px-3 text-red-500 text-xs">${fmt(o.platformFee ?? 0)}</td>
                                                <td className="py-2.5 px-3 text-green-600 font-semibold text-xs">${fmt(o.sellerAmount ?? 0)}</td>
                                                <td className="py-2.5 px-3 text-xs">{methodLabel[o.paymentMethod] ?? o.paymentMethod}</td>
                                                <td className="py-2.5 px-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {statusLabel[o.status] ?? o.status}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-xs text-text-muted">{fmtDate(o.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ MANUAL PAYMENTS ══════════════ */}
                    {activeTab === 'manual' && (
                        <div className="space-y-4">
                            {pendingManual.length === 0 ? (
                                <div className="card text-center py-16">
                                    <FiCheck className="text-5xl text-green-400 mx-auto mb-3" />
                                    <p className="font-bold text-lg text-primary-charcoal dark:text-white">لا توجد تحويلات معلقة</p>
                                    <p className="text-text-muted text-sm">جميع التحويلات تمت مراجعتها</p>
                                </div>
                            ) : pendingManual.map((o: any) => (
                                <div key={o.id} className="card border-r-4 border-orange-400 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-action-blue font-bold">{o.orderNumber}</span>
                                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">بانتظار المراجعة</span>
                                            </div>
                                            <div className="text-sm text-text-muted mt-1">{fmtDate(o.createdAt)}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-2xl text-primary-charcoal dark:text-white">${fmt(o.amount)}</div>
                                            <div className="text-xs text-text-muted">البائع يأخذ: ${fmt(o.sellerAmount ?? 0)}</div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                            <div className="text-text-muted text-xs mb-1">العميل</div>
                                            <div className="font-semibold">{o.customerName}</div>
                                            <div className="text-xs text-text-muted">{o.customerEmail}</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                            <div className="text-text-muted text-xs mb-1">المنتج</div>
                                            <div className="font-semibold">{o.productTitle}</div>
                                            <div className="text-xs text-text-muted">البائع: {o.seller?.name ?? '—'}</div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                            <div className="text-text-muted text-xs mb-1">عمولة المنصة</div>
                                            <div className="font-bold text-action-blue">${fmt(o.platformFee ?? 0)}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            onClick={() => verifyOrder(o.id, 'approve')}
                                            disabled={verifying === o.id}
                                            className="flex-1 btn bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            {verifying === o.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck />}
                                            قبول التحويل
                                        </button>
                                        <button
                                            onClick={() => verifyOrder(o.id, 'reject')}
                                            disabled={verifying === o.id}
                                            className="flex-1 btn bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <FiX /> رفض
                                        </button>
                                        <Link
                                            href={`/dashboard/orders/${o.id}`}
                                            className="btn btn-outline py-2.5 px-4 rounded-xl flex items-center gap-1 text-sm"
                                        >
                                            <FiEye /> تفاصيل
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ══════════════ USERS ══════════════ */}
                    {activeTab === 'users' && (
                        <div className="card space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-bold text-xl text-primary-charcoal dark:text-white">
                                    المستخدمون ({ov.totalUsers ?? 0})
                                </h2>
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم أو الإيميل..."
                                    value={userFilter}
                                    onChange={e => setUserFilter(e.target.value)}
                                    className="input text-sm py-2 max-w-xs"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-text-muted text-xs">
                                            <th className="text-right py-3 px-3">المستخدم</th>
                                            <th className="text-right py-3 px-3">الدولة</th>
                                            <th className="text-right py-3 px-3">الدور</th>
                                            <th className="text-right py-3 px-3">الطلبات</th>
                                            <th className="text-right py-3 px-3">الانضمام</th>
                                            <th className="text-right py-3 px-3">الحالة</th>
                                            <th className="text-right py-3 px-3">إجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.recentUsers
                                            ?.filter((u: any) =>
                                                !userFilter ||
                                                u.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(userFilter.toLowerCase())
                                            )
                                            .map((u: any) => (
                                                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="py-3 px-3">
                                                        <div className="font-semibold">{u.name || 'غير محدد'}</div>
                                                        <div className="text-xs text-text-muted">{u.email}</div>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs">{u.country || '—'}</td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                                                            u.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {u.role === 'ADMIN' ? '🛡️ أدمن' : u.role === 'SELLER' ? '🏪 بائع' : '👤 عميل'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 font-bold">{u._count?.sellerOrders ?? 0}</td>
                                                    <td className="py-3 px-3 text-xs text-text-muted">{fmtDate(u.createdAt)}</td>
                                                    <td className="py-3 px-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {u.isActive ? 'نشط' : 'موقوف'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <button
                                                            onClick={() => toggleUser(u.id, !u.isActive)}
                                                            disabled={togglingUser === u.id}
                                                            title={u.isActive ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                                                            className={`p-1.5 rounded-lg transition-colors ${u.isActive
                                                                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                                                : 'bg-green-50 hover:bg-green-100 text-green-600'
                                                                }`}
                                                        >
                                                            {togglingUser === u.id
                                                                ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                                : u.isActive ? <FiSlash className="text-sm" /> : <FiUnlock className="text-sm" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ SELLERS ══════════════ */}
                    {activeTab === 'sellers' && (
                        <div className="card space-y-4">
                            <h2 className="font-bold text-xl text-primary-charcoal dark:text-white">
                                أفضل البائعون
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-text-muted text-xs">
                                            <th className="text-right py-3 px-3">#</th>
                                            <th className="text-right py-3 px-3">البائع</th>
                                            <th className="text-right py-3 px-3">إجمالي المبيعات</th>
                                            <th className="text-right py-3 px-3">صافي الأرباح</th>
                                            <th className="text-right py-3 px-3">عمولة المنصة</th>
                                            <th className="text-right py-3 px-3">عدد الطلبات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.topSellers?.map((s: any, i: number) => (
                                            <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="py-3 px-3">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        i === 1 ? 'bg-gray-200 text-gray-700' :
                                                            i === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-50 text-gray-500'
                                                        }`}>{i + 1}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-semibold">{s.name || 'غير محدد'}</div>
                                                    <div className="text-xs text-text-muted">{s.email}</div>
                                                </td>
                                                <td className="py-3 px-3 font-bold">${fmt(s.totalRevenue)}</td>
                                                <td className="py-3 px-3 text-green-600 font-bold">${fmt(s.netEarnings)}</td>
                                                <td className="py-3 px-3 text-action-blue font-semibold">
                                                    ${fmt(s.totalRevenue - s.netEarnings)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="bg-blue-50 text-action-blue px-2 py-0.5 rounded-full text-xs font-bold">
                                                        {s.ordersCount} طلب
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
