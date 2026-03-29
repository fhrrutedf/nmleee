'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiDollarSign, FiShoppingCart, FiTrendingUp,
    FiAlertCircle, FiCheck, FiX, FiEye, FiRefreshCw,
    FiShield, FiGrid, FiList, FiCreditCard, FiGlobe,
    FiBarChart2, FiActivity, FiUserCheck, FiPackage,
    FiDownload, FiSend, FiSlash, FiUnlock, FiTag, FiLink, FiTarget,
    FiPlusCircle, FiPieChart, FiSearch, FiUser, FiStar, FiZap, FiBox
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// V2 Brand Colors for Charts
const BRAND_COLORS = ['#2563EB', '#1A1A1A', '#64748B', '#94A3B8', '#CBD5E1'];

// ─── Helpers ───────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const methodLabel: Record<string, string> = {
    stripe: 'بطاقة Stripe', manual: 'تحويل يدوي', crypto: 'كريبتو',
    free: 'مجاني', paypal: 'PayPal',
};
const statusBadge: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-500', PAID: 'bg-accent/10 text-accent',
    COMPLETED: 'bg-ink text-white', CANCELLED: 'bg-red-50 text-red-500',
    REFUNDED: 'bg-orange-50 text-orange-600',
};

// ─── Components ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend }: any) {
    return (
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl shadow-gray-100/20 hover:border-accent/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[80px] group-hover:bg-accent/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-4 bg-gray-50 rounded-2xl text-ink group-hover:bg-accent group-hover:text-white transition-all">
                    <Icon size={24} />
                </div>
                {trend && <span className="text-[10px] font-black font-inter text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-lg">{trend}</span>}
            </div>
            <div className="relative z-10">
                <div className="text-4xl font-black text-ink mb-2 tracking-tighter">{value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</div>
            </div>
            {sub && <div className="mt-6 pt-6 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub}</div>}
        </div>
    );
}

function Tab({ id, active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative ${active
                ? 'bg-ink text-white shadow-2xl shadow-ink/20 transform -translate-y-1'
                : 'bg-white text-gray-400 border border-gray-100 hover:border-ink hover:text-ink'
                }`}
        >
            <Icon size={14} />
            {label}
            {badge > 0 && (
                <span className="absolute -top-2 -left-2 bg-accent text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
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
    const [allBroadcasts, setAllBroadcasts] = useState<any[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [payoutStats, setPayoutStats] = useState<any>(null);

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
            fetchers[activeTab]().finally(() => setMarketingLoading(false));
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
        { id: 'manual', icon: FiCreditCard, label: 'التحويلات', badge: pendingManual.length },
        { id: 'payouts', icon: FiDollarSign, label: 'السحوبات', badge: 0 },
        { id: 'users', icon: FiUsers, label: 'الأوزيرز', badge: 0 },
        { id: 'verification', icon: FiShield, label: 'التوثيق', badge: ov.pendingVerifications || 0 },
        { id: 'broadcasts', icon: FiSend, label: 'البث', badge: 0 },
    ];

    if (loading && !data) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-gray-100 border-t-accent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-12 pb-24 selection:bg-accent/20" dir="rtl">
            {/* Header Section - Modern Institutional Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-ink text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <FiShield size={12} className="text-accent" /> Control Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter leading-tight">
                        إدارة <span className="text-accent">المنصة</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-transparent border-none font-black text-[10px] uppercase tracking-widest text-gray-500 pr-10 outline-none">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${autoRefresh ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-white text-gray-400 border border-gray-100'}`}>
                        <FiZap className={autoRefresh ? 'animate-pulse' : ''} /> Live {autoRefresh ? 'On' : 'Off'}
                    </button>
                    <button onClick={() => load(true)} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:border-ink hover:text-ink transition-all active:rotate-180">
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
                            <StatCard icon={FiAlertCircle} label="طلبات معلقة" value={ov.pendingManual ?? 0} sub="REQUIRES ACTION" trend="URGENT" />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-bl-[120px] pointer-events-none"></div>
                                <h3 className="text-xl font-black text-ink mb-10 tracking-widest flex items-center gap-3">
                                    <FiTrendingUp className="text-accent" /> REVENUE GROWTH
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data?.dailyRevenue}>
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="date" hide />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94A3B8'}} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backgroundColor: '#1A1A1A', color: '#fff', fontWeight: 900, fontSize: '10px' }}
                                                itemStyle={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fill="url(#chartGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-ink text-white rounded-[2.5rem] p-10 shadow-2xl shadow-ink/20 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-br-[100px] pointer-events-none"></div>
                                <h3 className="text-xl font-black mb-10 tracking-widest flex items-center gap-3">
                                    <FiPieChart className="text-accent" /> VOLUME DISTRIBUTION
                                </h3>
                                <div className="space-y-6">
                                    {(data?.ordersByMethod || []).map((m: any, idx: number) => (
                                        <div key={m.method} className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{methodLabel[m.method] || m.method}</span>
                                                <span className="text-sm font-black text-accent">${fmt(m.total)}</span>
                                            </div>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-accent h-full rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Performers Table */}
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100/20 overflow-x-auto">
                            <h3 className="text-xl font-black text-ink mb-10 tracking-widest flex items-center gap-3 underline underline-offset-[12px] decoration-accent/20 decoration-4">
                                <FiStar className="text-accent" /> ELITE CREATORS
                            </h3>
                            <table className="w-full">
                                <thead className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="pb-6 text-right">Creator</th>
                                        <th className="pb-6 text-center">Country</th>
                                        <th className="pb-6 text-center">Volume</th>
                                        <th className="pb-6 text-left">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.topSellers || []).map((s: any) => (
                                        <tr key={s.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-ink border border-gray-100 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all overflow-hidden shrink-0 uppercase">
                                                        {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-black text-sm text-ink group-hover:text-accent transition-colors truncate">{s.name}</div>
                                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{s.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center text-xs font-bold text-gray-500 uppercase">{s.country || 'Global'}</td>
                                            <td className="py-6 text-center"><span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-black text-gray-400">{s._count?.sellerOrders || 0} DEALS</span></td>
                                            <td className="py-6 text-left font-black text-ink tracking-tighter">${fmt(s.totalEarnings || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Other Tabs Simplified Styles */}
                {activeTab !== 'overview' && (
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100/20 overflow-hidden">
                        <h2 className="text-2xl font-black text-ink mb-10 tracking-tighter flex items-center gap-3">
                            <FiActivity className="text-accent" /> {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        {/* Tab specific tables simplified for design brevity */}
                        <div className="overflow-x-auto min-h-[400px]">
                           {/* ... Dynamic Table Content Based on Active Tab ... */}
                           <div className="bg-gray-50 rounded-3xl p-20 text-center border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 flex items-center justify-center mx-auto mb-8 text-accent">
                                    <FiBox size={32} />
                                </div>
                                <h3 className="text-xl font-black text-ink mb-2">معالجة البيانات قيد التشغيل</h3>
                                <p className="text-gray-400 font-bold mb-0">يرجى الانتظار بينما نقوم بمزامنة السجلات الحية للمنصة.</p>
                           </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Global Modals Styled v2 */}
            <AnimatePresence>
                {showBroadcast && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-ink/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-2xl relative">
                            <button onClick={() => setShowBroadcast(false)} className="absolute top-8 left-8 p-3 hover:bg-gray-100 rounded-2xl transition-all"><FiX size={24} /></button>
                            <h2 className="text-3xl font-black text-ink mb-10 tracking-tighter">إطلاق حملة بث مركزي</h2>
                            <div className="space-y-6">
                                <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold outline-none focus:bg-white focus:border-accent transition-all" placeholder="عنوان الحملة الاستراتيجي" />
                                <textarea className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-8 font-bold outline-none focus:bg-white focus:border-accent transition-all min-h-[200px]" placeholder="محتوى الرسالة (يدعم Markdown)..." />
                                <button onClick={sendBroadcast} className="w-full py-6 bg-ink text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black shadow-2xl shadow-ink/20">Initite Global Broadcast</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

