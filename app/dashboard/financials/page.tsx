'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiDollarSign, FiClock, FiTrendingUp, FiCheck, FiShield, FiUsers,
    FiArrowUpRight, FiArrowDownRight, FiPieChart, FiStar,
    FiShoppingBag, FiVideo, FiPackage, FiExternalLink, FiBarChart2
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface FinancialData {
    balance: { pending: number; available: number; total: number; referralEarnings: number };
    plan: { type: string; expiresAt: string | null; commissionRate: number };
    monthlyChart: { labels: string[]; data: number[]; orders: number[]; fees: number[] };
    revenueByType: { labels: string[]; data: number[] };
    thisMonthRevenue: number;
    revenueGrowth: number;
    recentTransactions: Array<{
        orderNumber: string;
        customerName: string;
        totalAmount: number;
        sellerAmount: number;
        platformFee: number;
        date: string;
        item: string;
        itemType: string;
    }>;
    payoutsSummary: { totalWithdrawn: number; pendingPayouts: number; pendingPayoutsCount: number };
    referrals: { count: number; earnings: number; username: string };
}

const planBadge: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    FREE: { label: 'مجانية', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', icon: '🆓' },
    GROWTH: { label: 'Growth', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '🚀' },
    PRO: { label: 'Pro', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: '👑' },
};

export default function FinancialsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'referrals'>('overview');
    const [copied, setCopied] = useState(false);

    const copyReferralLink = useCallback(() => {
        if (!data) return;
        const link = `${window.location.origin}/register?ref=${data.referrals.username}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }, [data]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/seller/financial-overview');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-action-blue border-t-transparent mx-auto" />
                    <p className="mt-4 text-text-muted font-medium">جاري تحميل البيانات المالية...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <FiDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted font-medium">لا يمكن تحميل البيانات المالية</p>
            </div>
        );
    }

    const plan = planBadge[data.plan.type] || planBadge.FREE;

    // Chart data
    const revenueChartData = {
        labels: data.monthlyChart.labels,
        datasets: [{
            label: 'الإيرادات ($)',
            data: data.monthlyChart.data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            tension: 0.4,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
        }],
    };

    const typeChartData = {
        labels: data.revenueByType.labels,
        datasets: [{
            data: data.revenueByType.data,
            backgroundColor: [
                'rgba(59, 130, 246, 0.85)',
                'rgba(168, 85, 247, 0.85)',
                'rgba(249, 115, 22, 0.85)',
            ],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'course': return <FiVideo className="text-purple-500" />;
            case 'bundle': return <FiPackage className="text-orange-500" />;
            default: return <FiShoppingBag className="text-blue-500" />;
        }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary-charcoal dark:text-white flex items-center gap-3">
                        <FiPieChart className="text-action-blue" />
                        حالتي المالية
                    </h1>
                    <p className="text-text-muted mt-1 font-medium">نظرة شاملة على أداء أعمالك المالي</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Plan Badge */}
                    <div className={`${plan.bg} ${plan.color} px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 border border-current/10`}>
                        <span>{plan.icon}</span>
                        باقة {plan.label}
                        <span className="text-xs opacity-75">({data.plan.commissionRate}% عمولة)</span>
                    </div>
                </div>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div variants={item} className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl max-w-md">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-card-white text-action-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FiBarChart2 /> النظرة المالية
                </button>
                <button
                    onClick={() => setActiveTab('referrals')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'referrals' ? 'bg-white dark:bg-card-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FiUsers /> نظام الإحالات
                </button>
            </motion.div>

            {activeTab === 'overview' ? (
                <>
                    {/* ─── Financial Summary Cards ──────────────────── */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Available Balance */}
                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-sm text-gray-500">الرصيد المتاح</p>
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center">
                                        <FiCheck size={20} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-primary-charcoal dark:text-white tracking-tight">
                                    {data.balance.available.toFixed(2)}
                                    <span className="text-lg text-gray-400 mr-1">$</span>
                                </p>
                                {data.balance.available >= 50 && (
                                    <Link href="/dashboard/payouts" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
                                        طلب سحب <FiExternalLink size={12} />
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        {/* Pending Balance */}
                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-50 dark:bg-yellow-900/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-sm text-gray-500">أرباح معلقة</p>
                                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-xl flex items-center justify-center">
                                        <FiShield size={20} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-primary-charcoal dark:text-white tracking-tight">
                                    {data.balance.pending.toFixed(2)}
                                    <span className="text-lg text-gray-400 mr-1">$</span>
                                </p>
                                <p className="mt-2 text-xs text-yellow-600 font-medium flex items-center gap-1">
                                    <FiClock size={12} />
                                    {data.plan.type === 'PRO' ? 'تتاح بعد 24 ساعة' : data.plan.type === 'GROWTH' ? 'تتاح بعد 7 أيام' : 'تتاح بعد 14 يوم'}
                                </p>
                            </div>
                        </motion.div>

                        {/* This Month Revenue */}
                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-sm text-gray-500">إيرادات هذا الشهر</p>
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center">
                                        <FiTrendingUp size={20} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-primary-charcoal dark:text-white tracking-tight">
                                    {data.thisMonthRevenue.toFixed(2)}
                                    <span className="text-lg text-gray-400 mr-1">$</span>
                                </p>
                                <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {data.revenueGrowth >= 0 ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />}
                                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth}% مقارنة بالشهر السابق
                                </div>
                            </div>
                        </motion.div>

                        {/* Total Earnings - Gradient */}
                        <motion.div variants={item} className="bg-gradient-to-br from-action-blue to-purple-600 text-white rounded-3xl shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-sm text-white/80">إجمالي الأرباح</p>
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center">
                                        <FiDollarSign size={20} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black tracking-tight">
                                    {data.balance.total.toFixed(2)}
                                    <span className="text-lg text-white/50 mr-1">$</span>
                                </p>
                                <p className="mt-2 text-xs text-white/70 font-medium flex items-center gap-1">
                                    <FiStar size={12} />
                                    تم سحب {data.payoutsSummary.totalWithdrawn.toFixed(2)} $
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ─── Charts Row ──────────────────────────── */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Revenue Trend */}
                        <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-lg font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                                <FiTrendingUp className="text-action-blue" /> تطور الإيرادات
                            </h2>
                            {data.monthlyChart.data.some(d => d > 0) ? (
                                <Line
                                    data={revenueChartData}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { callback: (v) => `${v} $` },
                                                grid: { color: 'rgba(0,0,0,0.04)' },
                                            },
                                            x: { grid: { display: false } },
                                        },
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                        <FiTrendingUp className="text-2xl text-gray-400" />
                                    </div>
                                    <p className="text-text-muted font-medium">لا توجد بيانات كافية بعد</p>
                                    <p className="text-xs text-gray-400 mt-1">ستظهر هنا إيراداتك بمجرد استقبال أول طلب</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Revenue by Type */}
                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-lg font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                                <FiPieChart className="text-purple-500" /> توزيع الإيرادات
                            </h2>
                            {data.revenueByType.data.some(d => d > 0) ? (
                                <div className="max-w-[250px] mx-auto">
                                    <Doughnut
                                        data={typeChartData}
                                        options={{
                                            responsive: true,
                                            cutout: '65%',
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: { padding: 16, usePointStyle: true },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                        <FiPieChart className="text-2xl text-gray-400" />
                                    </div>
                                    <p className="text-text-muted font-medium">لا توجد بيانات</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ─── Monthly Breakdown Table ──────────────────── */}
                    <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiBarChart2 className="text-action-blue" /> التقرير الشهري
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">الشهر</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">الإيرادات</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">عدد الطلبات</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">عمولة المنصة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.monthlyChart.labels.map((month, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-primary-charcoal dark:text-white text-sm">{month}</td>
                                            <td className="px-6 py-4 text-green-600 font-bold text-sm">{data.monthlyChart.data[idx].toFixed(2)} $</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{data.monthlyChart.orders[idx]} طلب</td>
                                            <td className="px-6 py-4 text-red-500 text-sm font-medium">-{data.monthlyChart.fees[idx].toFixed(2)} $</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* ─── Recent Transactions ──────────────────── */}
                    <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiDollarSign className="text-green-500" /> آخر المعاملات
                            </h2>
                            <Link href="/dashboard/earnings" className="text-sm font-bold text-action-blue hover:text-blue-700 flex items-center gap-1">
                                عرض الكل <FiExternalLink size={14} />
                            </Link>
                        </div>

                        {data.recentTransactions.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiDollarSign className="text-2xl text-gray-400" />
                                </div>
                                <p className="text-text-muted font-medium">لا توجد معاملات بعد</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {data.recentTransactions.map((tx, idx) => (
                                    <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                            {getItemIcon(tx.itemType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-primary-charcoal dark:text-white truncate">{tx.item}</p>
                                            <p className="text-xs text-gray-500">{tx.customerName} • {tx.orderNumber}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm text-green-600">+{tx.sellerAmount.toFixed(2)} $</p>
                                            <p className="text-xs text-gray-400">{tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : '-'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* ─── Quick Actions ──────────────────── */}
                    <motion.div variants={item} className="grid sm:grid-cols-3 gap-4">
                        <Link href="/dashboard/payouts" className="card flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-1 group">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiDollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white">طلب سحب الأرباح</h3>
                                <p className="text-xs text-text-muted">اسحب رصيدك المتاح</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/earnings" className="card flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-1 group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiTrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white">تفاصيل الأرباح</h3>
                                <p className="text-xs text-text-muted">سجل المعاملات الكامل</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/analytics" className="card flex items-center gap-4 hover:shadow-lg transition-all hover:-translate-y-1 group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiPieChart size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white">التحليلات الكاملة</h3>
                                <p className="text-xs text-text-muted">إحصاءات متقدمة</p>
                            </div>
                        </Link>
                    </motion.div>
                </>
            ) : (
                /* ═══════════════════════════════════════════════════
                   REFERRAL TAB — نظام الإحالات (الشجرة)
                   ═══════════════════════════════════════════════════ */
                <>
                    {/* Referral Stats */}
                    <div className="grid sm:grid-cols-3 gap-6">
                        <motion.div variants={item} className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl shadow-lg p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-bold text-sm text-white/80">أرباح الإحالات</p>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <FiDollarSign size={20} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black tracking-tight">
                                    {data.referrals.earnings.toFixed(2)}
                                    <span className="text-lg text-white/50 mr-1">$</span>
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-sm text-gray-500">عدد الإحالات</p>
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center">
                                    <FiUsers size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-primary-charcoal dark:text-white tracking-tight">
                                {data.referrals.count}
                                <span className="text-lg text-gray-400 mr-1">مستخدم</span>
                            </p>
                        </motion.div>

                        <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-sm text-gray-500">نسبة العمولة</p>
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center">
                                    <FiTrendingUp size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-primary-charcoal dark:text-white tracking-tight">
                                1<span className="text-lg text-gray-400 mr-1">%</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500 font-medium">من عمولة المنصة لكل بيعة</p>
                        </motion.div>
                    </div>

                    {/* ─── Referral Link ────────────────────── */}
                    <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-bold text-primary-charcoal dark:text-white mb-4 flex items-center gap-2">
                            🔗 رابط الإحالة الخاص بك
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">شارك هذا الرابط مع أصدقائك. عندما يسجّلون عبره ويبيعون، تكسب تلقائياً!</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300 truncate" dir="ltr">
                                {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${data.referrals.username}` : `...`}
                            </div>
                            <button
                                onClick={copyReferralLink}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                    copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-action-blue text-white hover:bg-blue-700'
                                }`}
                            >
                                {copied ? '✓ تم النسخ!' : '📋 نسخ الرابط'}
                            </button>
                        </div>
                    </motion.div>

                    {/* How it works */}
                    <motion.div variants={item} className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                        <h2 className="text-xl font-bold text-primary-charcoal dark:text-white mb-6 flex items-center gap-2">
                            🌳 كيف تعمل شجرة الإحالات؟
                        </h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">1️⃣</span>
                                </div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white mb-2">شارك رابط الإحالة</h3>
                                <p className="text-sm text-gray-500">أرسل رابط التسجيل الخاص بك لأصدقائك ومعارفك</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">2️⃣</span>
                                </div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white mb-2">يسجّلون ويبيعون</h3>
                                <p className="text-sm text-gray-500">عندما يسجل شخص عبر رابطك ويبدأ بالبيع على المنصة</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">3️⃣</span>
                                </div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white mb-2">تكسب تلقائياً</h3>
                                <p className="text-sm text-gray-500">تحصل على 1% من عمولة المنصة على كل بيعة يتمها المُحال</p>
                            </div>
                        </div>

                        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-2xl p-5 border border-purple-200/50 dark:border-purple-800/50">
                            <h4 className="font-bold text-primary-charcoal dark:text-white mb-2">💡 مثال توضيحي</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                لو أحد المستخدمين اللي سجلوا عبر رابطك باع منتج بقيمة <strong>100 $</strong> وعمولة المنصة <strong>10 $</strong>، فأنت تحصل على <strong>0.10 $</strong> تلقائياً في رصيدك. مع مرور الوقت وكثرة المبيعات، الأرباح تتراكم!
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}
