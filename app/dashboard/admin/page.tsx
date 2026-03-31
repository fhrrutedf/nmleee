'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp,
    FiAlertCircle, FiCheck, FiX, FiEye, FiRefreshCw,
    FiShield, FiGrid, FiList, FiCreditCard, FiGlobe,
    FiBarChart2, FiActivity, FiUserCheck, FiPackage,
    FiDownload, FiSend, FiSlash, FiUnlock, FiTag, FiLink, FiTarget,
    FiPlusCircle, FiPieChart, FiSearch, FiUser, FiStar, FiZap, FiBox,
    FiLayers, FiClock, FiCheckCircle, FiFileText
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// V2 Brand Colors for Charts - Selective Palette
const BRAND_COLORS = ['#1A1A1A', '#059669', '#64748B', '#94A3B8', '#CBD5E1'];

// ─── Helpers ───────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const methodLabel: Record<string, string> = {
    stripe: 'بطاقة Stripe', manual: 'تحويل يدوي', crypto: 'كريبتو',
    free: 'مجاني', paypal: 'PayPal',
};
const statusBadge: Record<string, string> = {
    PENDING: 'bg-emerald-800 text-gray-400', PAID: 'bg-emerald-700/10 text-[#10B981] border border-emerald-500/20',
    COMPLETED: 'bg-emerald-700 text-white shadow-lg shadow-emerald-500/20', CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    REFUNDED: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
};

// ─── Components ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend }: any) {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[2rem] shadow-lg shadow-[#10B981]/20 shadow-gray-100/20 hover:border-emerald-600/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-700 text-white/5 rounded-bl-[80px] group-hover:bg-emerald-700 text-white/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-4 bg-[#111111] rounded-xl text-[#10B981] group-hover:bg-emerald-700 text-white group-hover:text-white transition-all">
                    <Icon size={24} />
                </div>
                {trend && <span className="text-[10px] font-bold font-inter text-[#10B981] uppercase tracking-widest bg-emerald-700 text-white/5 px-3 py-1 rounded-lg">{trend}</span>}
            </div>
            <div className="relative z-10">
                <div className="text-4xl font-bold text-[#10B981] mb-2 tracking-tighter">{value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</div>
            </div>
            {sub && <div className="mt-6 pt-6 border-t border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub}</div>}
        </div>
    );
}

function Tab({ id, active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap relative ${active
                ? 'bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-ink/20 transform -translate-y-1'
                : 'bg-[#0A0A0A] text-gray-400 border border-white/10 hover:border-ink hover:text-[#10B981]'
                }`}
        >
            <Icon size={14} />
            {label}
            {badge > 0 && (
                <span className="absolute -top-2 -left-2 bg-emerald-700 text-white text-[10px] font-bold w-6 h-6 rounded-xl flex items-center justify-center border-4 border-white shadow-lg shadow-[#10B981]/20">
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

    // List States
    const [allCoupons, setAllCoupons] = useState<any[]>([]);
    const [allAffiliates, setAllAffiliates] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allBroadcasts, setAllBroadcasts] = useState<any[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [payoutStats, setPayoutStats] = useState<any>(null);

    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

    // Reports State
    const [reports, setReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [generatingReport, setGeneratingReport] = useState(false);

    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcast, setBroadcast] = useState({ subject: '', message: '', target: 'sellers' });
    const [sending, setSending] = useState(false);
    const [showMasterKeyModal, setShowMasterKeyModal] = useState<string | null>(null);
    const [masterKey, setMasterKey] = useState('');

    const load = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setIsRefreshing(true);
        try {
            const r = await fetch(`/api/admin/dashboard?period=${period}`);
            setData(await r.json());
        } catch { } finally { setLoading(false); setIsRefreshing(false); }
    }, [period]);

    useEffect(() => { load(); }, [load]);

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
            fetchers[activeTab] && fetchers[activeTab]().finally(() => setMarketingLoading(false));
        }

        if (activeTab === 'reports') {
            setLoadingReports(true);
            fetch('/api/admin/reports?limit=10')
                .then(r => r.json())
                .then(d => setReports(d.reports || []))
                .finally(() => setLoadingReports(false));
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users') {
            const timer = setTimeout(() => {
                setMarketingLoading(true);
                fetch(`/api/admin/users?limit=50&search=${encodeURIComponent(userFilter)}`)
                    .then(r => r.json())
                    .then(d => setAllUsers(d.users || []))
                    .finally(() => setMarketingLoading(false));
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [activeTab, userFilter]);

    useEffect(() => {
        if (activeTab === 'subscriptions') {
            setLoadingSubscriptions(true);
            fetch('/api/admin/subscription-stats')
                .then(r => r.json())
                .then(setSubscriptionData)
                .finally(() => setLoadingSubscriptions(false));
        }
    }, [activeTab]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => { load(false); }, 10000);
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
                setData((prev: any) => ({
                    ...prev,
                    recentUsers: prev.recentUsers.map((u: any) => u.id === userId ? { ...u, isActive } : u),
                }));
                showToast.success(isActive ? 'تفعيل كامل' : 'إيقاف مؤقت');
            }
        } finally { setTogglingUser(null); }
    };

    const sendBroadcast = async () => {
        if (!broadcast.subject || !broadcast.message) return;
        setSending(true);
        try {
            const r = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(broadcast),
            });
            if (r.ok) {
                showToast.success('تم إطلاق الرحلة بنجاح');
                setShowBroadcast(false);
            }
        } finally { 
            setSending(false); 
            fetch('/api/admin/broadcast/list').then(r => r.json()).then(setAllBroadcasts);
        }
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
            showToast.success('تم التحديث بنجاح');
        } finally { setVerifying(null); }
    };

    const ov = data?.overview ?? {};
    const pendingManual = data?.recentOrders?.filter((o: any) => o.paymentMethod === 'manual' && o.status === 'PENDING') ?? [];

    const tabs = [
        { id: 'overview', icon: FiGrid, label: 'الرئيسية', badge: 0 },
        { id: 'sales', icon: FiActivity, label: 'النشاط', badge: 0 },
        { id: 'subscriptions', icon: FiLayers, label: 'الاشتراكات', badge: subscriptionData?.upcomingExpirations || 0 },
        { id: 'manual', icon: FiCreditCard, label: 'التحويلات', badge: pendingManual.length },
        { id: 'payouts', icon: FiDollarSign, label: 'السحوبات', badge: 0 },
        { id: 'users', icon: FiUsers, label: 'الأوزيرز', badge: 0 },
        { id: 'verification', icon: FiShield, label: 'التوثيق', badge: ov.pendingVerifications || 0 },
        { id: 'reports', icon: FiFileText, label: 'التقارير', badge: 0 },
        { id: 'broadcasts', icon: FiSend, label: 'البث', badge: 0 },
    ];

    if (loading && !data) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-white/10 border-t-accent rounded-xl animate-spin" />
        </div>
    );

    return (
        <div className="space-y-12 pb-24 selection:bg-emerald-700 text-white/20" dir="rtl">
            {/* Header Section - Modern Institutional Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <FiShield size={12} className="text-[#10B981]" /> Control Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#10B981] tracking-tighter leading-tight">
                        إدارة <span className="text-[#10B981]">المنصة</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-4 bg-[#111111] p-2 rounded-xl border border-white/10">
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-transparent border-none font-bold text-[10px] uppercase tracking-widest text-gray-500 pr-10 outline-none">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${autoRefresh ? 'bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-accent/20' : 'bg-[#0A0A0A] text-gray-400 border border-white/10'}`}>
                        <FiZap className={autoRefresh ? '' : ''} /> Live {autoRefresh ? 'On' : 'Off'}
                    </button>
                    <button onClick={() => load(true)} className="p-2.5 bg-[#0A0A0A] border border-white/10 rounded-xl hover:border-ink hover:text-[#10B981] transition-all active:rotate-180">
                        <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {tabs.map(t => (
                    <Tab key={t.id} id={t.id} active={activeTab === t.id} onClick={setActiveTab} icon={t.icon} label={t.label} badge={t.badge} />
                ))}
            </div>

            {/* Main Content Area */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {activeTab === 'overview' && (
                    <div className="space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={FiUsers} label="قاعدة المستخدمين" value={fmt(ov.totalUsers ?? 0)} sub={`+${ov.newUsers ?? 0} GROWTH`} trend="STABLE" />
                            <StatCard icon={FiDollarSign} label="إجمالي الدوران" value={`$${fmt(ov.totalRevenue ?? 0)}`} sub={`NET: $${fmt(ov.platformFees ?? 0)}`} trend="PROFIT" />
                            <StatCard icon={FiShoppingCart} label="العمليات التجارية" value={fmt(ov.totalOrders ?? 0)} sub={`${ov.periodOrders ?? 0} PERIOD`} trend="ACTIVE" />
                            <StatCard icon={FiLayers} label="المشتركون" value={fmt(subscriptionData?.stats?.totalSubscribers ?? 0)} sub={`${subscriptionData?.stats?.newThisMonth ?? 0} NEW`} trend="SaaS" />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 shadow-gray-100/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-700 text-white/5 rounded-bl-[120px] pointer-events-none"></div>
                                <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3">
                                    <FiTrendingUp className="text-[#10B981]" /> REVENUE GROWTH
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data?.dailyRevenue}>
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="date" hide />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#4B5563'}} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', backgroundColor: '#111111', color: '#fff', fontWeight: 900, fontSize: '10px' }}
                                                itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={4} fill="url(#chartGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-emerald-950/20 text-white rounded-[2.5rem] p-10 shadow-lg shadow-emerald-500/10 relative overflow-hidden border border-emerald-500/10">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-br-[100px] pointer-events-none"></div>
                                <h3 className="text-xl font-bold mb-10 tracking-widest flex items-center gap-3 text-white">
                                    <FiPieChart className="text-[#10B981]" /> VOLUME DISTRIBUTION
                                </h3>
                                <div className="space-y-6">
                                    {(data?.ordersByMethod || []).map((m: any, idx: number) => (
                                        <div key={m.method} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{methodLabel[m.method] || m.method}</span>
                                                <span className="text-sm font-bold text-[#10B981]">${fmt(m.total)}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-xl overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-xl" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Performers Table */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 shadow-gray-100/20 overflow-x-auto">
                            <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3 underline underline-offset-[12px] decoration-accent/20 decoration-4">
                                <FiStar className="text-[#10B981]" /> ELITE CREATORS
                            </h3>
                            <table className="w-full">
                                <thead className="border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="pb-6 text-right">Creator</th>
                                        <th className="pb-6 text-center">Country</th>
                                        <th className="pb-6 text-center">Volume</th>
                                        <th className="pb-6 text-left">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.topSellers || []).map((s: any) => (
                                        <tr key={s.id} className="group hover:bg-[#111111]/50 transition-colors">
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-[#10B981] border border-white/10 group-hover:bg-emerald-700 text-white group-hover:text-white group-hover:border-transparent transition-all overflow-hidden shrink-0 uppercase">
                                                        {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-[#10B981] group-hover:text-[#10B981] transition-colors truncate">{s.name}</div>
                                                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate">{s.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center text-xs font-bold text-gray-500 uppercase">{s.country || 'Global'}</td>
                                            <td className="py-6 text-center"><span className="bg-emerald-800 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400">{s._count?.sellerOrders || 0} DEALS</span></td>
                                            <td className="py-6 text-left font-bold text-[#10B981] tracking-tighter">${fmt(s.totalEarnings || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Recent Transactions Table */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 shadow-gray-100/20 overflow-x-auto">
                            <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3 underline underline-offset-[12px] decoration-accent/20 decoration-4">
                                <FiActivity className="text-[#10B981]" /> RECENT TRANSACTIONS
                            </h3>
                            <table className="w-full">
                                <thead className="border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="pb-6 text-right">Order & Product</th>
                                        <th className="pb-6 text-right">Creator (Seller)</th>
                                        <th className="pb-6 text-center">Customer</th>
                                        <th className="pb-6 text-center">Amount</th>
                                        <th className="pb-6 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.recentOrders || []).length === 0 ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-bold">Waiting for new operational data...</td></tr>
                                    ) : (
                                        (data?.recentOrders || []).map((o: any) => (
                                            <tr key={o.id} className="group hover:bg-[#111111]/50 transition-colors border-b border-white/5 last:border-0">
                                                <td className="py-6">
                                                    <div className="font-bold text-sm text-[#10B981]">{o.productTitle}</div>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mt-1">#{o.orderNumber} <span className="bg-white/5 px-2 py-0.5 rounded text-[8px]">{methodLabel[o.paymentMethod] || o.paymentMethod}</span></div>
                                                </td>
                                                <td className="py-6 min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center font-bold text-[#10B981] border border-white/10 text-xs uppercase">
                                                            {o.seller?.name ? o.seller.name.charAt(0) : 'A'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-200">{o.seller?.name || 'المنصة (المدير)'}</div>
                                                            <div className="text-[10px] font-bold text-gray-500">{o.seller?.email || 'admin@تمالين'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center min-w-[150px]">
                                                    <div className="font-bold text-sm text-gray-300">{o.customerName}</div>
                                                    <div className="text-[10px] font-bold text-gray-500">{o.customerEmail}</div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <div className="font-bold text-[#10B981] tracking-tighter text-lg">${fmt(o.amount || 0)}</div>
                                                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">NET: ${fmt(o.sellerAmount || 0)}</div>
                                                </td>
                                                <td className="py-6 text-left">
                                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${statusBadge[o.status] || 'bg-gray-800 text-gray-400'}`}>{o.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Subscriptions Tab */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-10">
                        {/* Subscription Stats Grid */}
                        {loadingSubscriptions ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="w-12 h-12 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                            </div>
                        ) : subscriptionData ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard icon={FiLayers} label="إجمالي المشتركين" value={fmt(subscriptionData.stats.totalSubscribers)} sub={`${subscriptionData.stats.newThisMonth} جديد هذا الشهر`} trend="GROWTH" />
                                    <StatCard icon={FiDollarSign} label="إيرادات الاشتراكات" value={`$${fmt(subscriptionData.stats.totalRevenue)}`} sub="منذ البداية" trend="REVENUE" />
                                    <StatCard icon={FiUserCheck} label="الاشتراكات النشطة" value={fmt(subscriptionData.stats.active)} sub={`${subscriptionData.upcomingExpirations} تنتهي قريباً`} trend="ACTIVE" />
                                    <StatCard icon={FiClock} label="منتهية الصلاحية" value={fmt(subscriptionData.stats.expiringSoon)} sub="يحتاجون تجديد" trend="URGENT" />
                                </div>

                                {/* Plan Distribution */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20">
                                        <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3">
                                            <FiPieChart className="text-[#10B981]" /> توزيع الباقات
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(subscriptionData.stats.byPlan).map(([plan, count]: [string, any]) => (
                                                <div key={plan} className={`p-6 rounded-xl border border-white/10 ${
                                                    plan === 'FREE' ? 'bg-gray-500/10' : 
                                                    plan === 'GROWTH' ? 'bg-blue-500/10' : 
                                                    plan === 'PRO' ? 'bg-emerald-500/10' : 
                                                    'bg-purple-500/10'
                                                }`}>
                                                    <div className={`text-3xl font-black ${
                                                        plan === 'FREE' ? 'text-gray-400' : 
                                                        plan === 'GROWTH' ? 'text-blue-400' : 
                                                        plan === 'PRO' ? 'text-emerald-400' : 
                                                        'text-purple-400'
                                                    }`}>{fmt(count)}</div>
                                                    <div className="text-xs text-gray-500 mt-1 uppercase">{plan}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20">
                                        <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3">
                                            <FiAlertCircle className="text-[#10B981]" /> تنبيهات مهمة
                                        </h3>
                                        <div className="space-y-4">
                                            {subscriptionData.upcomingExpirations > 0 && (
                                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <FiClock className="text-yellow-400" />
                                                        <div>
                                                            <div className="font-bold text-yellow-400">{subscriptionData.upcomingExpirations} اشتراك تنتهي خلال 7 أيام</div>
                                                            <div className="text-xs text-gray-500">سيتم إرسال تنبيهات للمستخدمين</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <FiCheckCircle className="text-[#10B981]" />
                                                    <div>
                                                        <div className="font-bold text-[#10B981]">{subscriptionData.stats.active} اشتراك نشط</div>
                                                        <div className="text-xs text-gray-500">المستخدمون يستفيدون من المنصة</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Subscriptions Table */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 overflow-x-auto">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-xl font-bold text-[#10B981] tracking-widest flex items-center gap-3">
                                            <FiActivity className="text-[#10B981]" /> آخر الاشتراكات
                                        </h3>
                                        <Link href="/dashboard/admin/subscriptions" className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest hover:underline">
                                            عرض الكل
                                        </Link>
                                    </div>
                                    <table className="w-full">
                                        <thead className="border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="pb-6 text-right">المستخدم</th>
                                                <th className="pb-6 text-center">الباقة</th>
                                                <th className="pb-6 text-center">المبلغ</th>
                                                <th className="pb-6 text-center">التاريخ</th>
                                                <th className="pb-6 text-left">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subscriptionData.recentSubscriptions.length === 0 ? (
                                                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-bold">لا توجد اشتراكات حالياً...</td></tr>
                                            ) : (
                                                subscriptionData.recentSubscriptions.map((sub: any) => (
                                                    <tr key={sub.id} className="group hover:bg-[#111111]/50 transition-colors border-b border-white/5 last:border-0">
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-[#10B981] border border-white/10 uppercase">
                                                                    {sub.user?.name ? sub.user.name.charAt(0) : '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm text-white">{sub.user?.name || 'Unknown'}</div>
                                                                    <div className="text-[10px] font-bold text-gray-500">{sub.user?.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-center">
                                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                                sub.planName?.includes('PRO') ? 'bg-emerald-500/10 text-emerald-400' :
                                                                sub.planName?.includes('GROWTH') ? 'bg-blue-500/10 text-blue-400' :
                                                                sub.planName?.includes('AGENCY') ? 'bg-purple-500/10 text-purple-400' :
                                                                'bg-gray-500/10 text-gray-400'
                                                            }`}>
                                                                {sub.planName}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 text-center font-bold text-[#10B981]">${fmt(sub.amount)}</td>
                                                        <td className="py-6 text-center text-xs text-gray-500">{new Date(sub.createdAt).toLocaleDateString('ar-SA')}</td>
                                                        <td className="py-6 text-left">
                                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${statusBadge[sub.status]}`}>
                                                                {sub.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="bg-[#0A0A0A] rounded-[2rem] border border-white/10 p-10 text-center">
                                <div className="w-16 h-16 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-8 text-[#10B981]">
                                    <FiLayers size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-[#10B981] mb-2">لا توجد بيانات</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ابدأ بإضافة باقات وجذب المشتركين</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div className="space-y-10">
                        {/* Generate Report Section */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-bold text-[#10B981] tracking-widest flex items-center gap-3">
                                    <FiFileText className="text-[#10B981]" /> إنشاء تقرير جديد
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={async () => {
                                        setGeneratingReport(true);
                                        try {
                                            const r = await fetch('/api/admin/reports', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ type: 'daily', period: '24h', title: 'التقرير اليومي' }),
                                            });
                                            const data = await r.json();
                                            if (data.success) {
                                                showToast.success('تم إنشاء التقرير اليومي');
                                                setReports([data.report, ...reports]);
                                            }
                                        } finally { setGeneratingReport(false); }
                                    }}
                                    disabled={generatingReport}
                                    className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiActivity className="text-emerald-400" />
                                        <span className="font-bold text-emerald-400">تقرير يومي</span>
                                    </div>
                                    <p className="text-xs text-gray-500">آخر 24 ساعة</p>
                                </button>
                                <button
                                    onClick={async () => {
                                        setGeneratingReport(true);
                                        try {
                                            const r = await fetch('/api/admin/reports', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ type: 'weekly', period: '7d', title: 'التقرير الأسبوعي' }),
                                            });
                                            const data = await r.json();
                                            if (data.success) {
                                                showToast.success('تم إنشاء التقرير الأسبوعي');
                                                setReports([data.report, ...reports]);
                                            }
                                        } finally { setGeneratingReport(false); }
                                    }}
                                    disabled={generatingReport}
                                    className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiPieChart className="text-blue-400" />
                                        <span className="font-bold text-blue-400">تقرير أسبوعي</span>
                                    </div>
                                    <p className="text-xs text-gray-500">آخر 7 أيام</p>
                                </button>
                                <button
                                    onClick={async () => {
                                        setGeneratingReport(true);
                                        try {
                                            const r = await fetch('/api/admin/reports', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ type: 'monthly', period: '30d', title: 'التقرير الشهري' }),
                                            });
                                            const data = await r.json();
                                            if (data.success) {
                                                showToast.success('تم إنشاء التقرير الشهري');
                                                setReports([data.report, ...reports]);
                                            }
                                        } finally { setGeneratingReport(false); }
                                    }}
                                    disabled={generatingReport}
                                    className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <FiBarChart2 className="text-purple-400" />
                                        <span className="font-bold text-purple-400">تقرير شهري</span>
                                    </div>
                                    <p className="text-xs text-gray-500">آخر 30 يوم</p>
                                </button>
                            </div>
                            {generatingReport && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Reports List */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 overflow-x-auto">
                            <h3 className="text-xl font-bold text-[#10B981] mb-10 tracking-widest flex items-center gap-3">
                                <FiFileText className="text-[#10B981]" /> التقارير المحفوظة
                            </h3>
                            {loadingReports ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#10B981]">
                                        <FiFileText size={24} />
                                    </div>
                                    <h4 className="font-bold text-gray-400 mb-2">لا توجد تقارير حالياً</h4>
                                    <p className="text-xs text-gray-600">قم بإنشاء تقرير جديد من الأعلى</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report: any) => (
                                        <div key={report.id} className="p-6 bg-[#111111]/50 border border-white/10 rounded-2xl hover:border-[#10B981]/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${
                                                        report.type === 'daily' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        report.type === 'weekly' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-purple-500/10 text-purple-400'
                                                    }`}>
                                                        <FiFileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white">{report.title}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(report.generatedAt).toLocaleString('ar-SA')}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                                                >
                                                    عرض التفاصيل
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                    <div className="text-lg font-bold text-[#10B981]">{report.summary?.newUsers || 0}</div>
                                                    <div className="text-xs text-gray-500">مستخدمين جدد</div>
                                                </div>
                                                <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                    <div className="text-lg font-bold text-[#10B981]">{report.summary?.periodOrders || 0}</div>
                                                    <div className="text-xs text-gray-500">طلبات</div>
                                                </div>
                                                <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                    <div className="text-lg font-bold text-[#10B981]">${fmt(report.summary?.periodRevenue || 0)}</div>
                                                    <div className="text-xs text-gray-500">إيرادات</div>
                                                </div>
                                                <div className="p-3 bg-[#0A0A0A] rounded-xl">
                                                    <div className="text-lg font-bold text-[#10B981]">{report.alerts?.length || 0}</div>
                                                    <div className="text-xs text-gray-500">تنبيهات</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Other Tabs Simplified Styles */}
                {activeTab !== 'overview' && (
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-lg shadow-[#10B981]/20 overflow-hidden">
                        <h2 className="text-2xl font-bold text-[#10B981] mb-10 tracking-tighter flex items-center gap-4">
                            <FiActivity className="text-[#10B981]" /> {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        {/* Table View Header Styling */}
                        <div className="bg-[#111111]/50 p-6 rounded-xl border border-white/10 mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Entries: {fmt(ov.totalOrders || 0)}</span>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] hover:text-[#10B981] transition-colors flex items-center gap-2">
                                <FiDownload size={12} /> Export CSV
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto min-h-[400px]">
                            {activeTab === 'users' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 bg-[#111111]/50 p-2 rounded-[1.5rem] border border-white/10 relative">
                                        <div className="absolute right-6 text-gray-500"><FiSearch size={20} /></div>
                                        <input 
                                            type="text"
                                            placeholder="ابحث برقم الهاتف، البريد الإلكتروني، أو الاسم السريع..."
                                            value={userFilter}
                                            onChange={e => setUserFilter(e.target.value)}
                                            className="w-full bg-transparent border-none outline-none py-4 pr-16 pl-6 text-sm font-bold placeholder-gray-600 text-white focus:text-[#10B981] transition-colors"
                                        />
                                        {marketingLoading && (
                                            <div className="absolute left-6 w-5 h-5 border-2 border-white/10 border-t-accent rounded-full animate-spin"></div>
                                        )}
                                    </div>
                                    <div className="border border-white/10 rounded-3xl overflow-hidden bg-[#0a0a0a]">
                                        <table className="w-full">
                                            <thead className="border-b border-white/10 bg-[#111111] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="py-6 px-6 text-right">User / Client</th>
                                                    <th className="py-6 px-6 text-center">Status & Role</th>
                                                    <th className="py-6 px-6 text-center">Joined</th>
                                                    <th className="py-6 px-6 text-left">Impersonate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUsers.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-12 text-center text-gray-500 font-bold">لا يوجد نتائج أو عملاء بهذه البيانات...</td></tr>
                                                ) : (
                                                    allUsers.map((u: any) => (
                                                        <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-[#111111]/50 transition-colors">
                                                            <td className="py-6 px-6 min-w-[250px]">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-700/50 flex items-center justify-center font-bold text-[#10B981] shadow-inner uppercase overflow-hidden">
                                                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm text-gray-200">{u.name}</div>
                                                                        <div className="text-[10px] text-gray-500 font-bold tracking-widest">{u.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-6 text-center">
                                                                <div className="flex flex-col gap-2 items-center">
                                                                    <span className={`px-3 py-1 text-[9px] font-bold rounded-lg uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : u.role === 'SELLER' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-800 text-gray-400 border border-white/5'}`}>{u.role}</span>
                                                                    <span className={`px-3 py-1 text-[9px] font-bold rounded-lg uppercase tracking-widest bg-emerald-500/10 text-[#10B981]`}>{u.totalEarnings ? `$${u.totalEarnings.toFixed(2)} NET` : 'Active'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-6 px-6 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                                                            <td className="py-6 px-6 text-left">
                                                                <button 
                                                                    onClick={async () => {
                                                                        try {
                                                                            const { impersonateUser } = await import('@/app/actions/impersonate');
                                                                            await impersonateUser(u.id);
                                                                            window.location.href = '/dashboard';
                                                                        } catch (e: any) { alert(e.message); }
                                                                    }}
                                                                    className="bg-[#111111] border border-white/10 hover:border-emerald-600 hover:bg-emerald-950 text-gray-400 hover:text-[#10B981] px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-900/50 inline-flex items-center gap-2 group"
                                                                >
                                                                    <FiUnlock size={14} className="group-hover:text-white" />
                                                                    <span className="group-hover:text-white">Login As</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#0A0A0A] rounded-[2rem] border border-white/10 p-10 text-center shadow-inner">
                                    <div className="w-16 h-16 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-8 text-[#10B981] shadow-lg shadow-[#10B981]/20">
                                        <FiBox size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#10B981] mb-2">OPERATIONAL DATA SYNC</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Awaiting central server confirmation for the selected period.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Global Modals Styled v2 */}
            <AnimatePresence>
                {showBroadcast && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-emerald-700 text-white/60 ">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0A0A0A] rounded-[3rem] p-12 max-w-3xl w-full shadow-lg shadow-[#10B981]/20 relative">
                            <button onClick={() => setShowBroadcast(false)} className="absolute top-8 left-8 p-3 hover:bg-emerald-800 rounded-xl transition-all"><FiX size={24} /></button>
                            <h2 className="text-3xl font-bold text-[#10B981] mb-10 tracking-tighter">إطلاق حملة بث مركزي</h2>
                            <div className="space-y-6">
                                <input type="text" className="w-full bg-[#111111] border border-white/10 rounded-xl p-5 font-bold outline-none focus:bg-[#0A0A0A] focus:border-emerald-600 transition-all" placeholder="عنوان الحملة الاستراتيجي" />
                                <textarea className="w-full bg-[#111111] border border-white/10 rounded-[2rem] p-8 font-bold outline-none focus:bg-[#0A0A0A] focus:border-emerald-600 transition-all min-h-[200px]" placeholder="محتوى الرسالة (يدعم Markdown)..." />
                                <button onClick={sendBroadcast} className="w-full py-6 bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-ink/20">Initite Global Broadcast</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

