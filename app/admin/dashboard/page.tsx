'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiAlertCircle,
    FiTrendingUp,
    FiClock,
    FiActivity,
    FiArrowUpRight,
    FiArrowDownRight
} from 'react-icons/fi';
import Link from 'next/link';

interface Stats {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    platformFees: number;
    pendingPayouts: number;
    pendingManualOrders: number;
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalCourses: number;
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    seller: { name: string } | null;
    items: Array<{
        product?: { title: string };
        course?: { title: string };
    }>;
}

interface TopSeller {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    totalEarnings: number;
    pendingBalance: number;
    availableBalance: number;
    _count: { sellerOrders: number };
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchStats();
    }, [session]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setRecentOrders(data.recentOrders);
                setTopSellers(data.topSellers);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col p-6 items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-gray-100 dark:border-gray-800 border-t-action-blue rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-bold animate-pulse">جاري تحميل إحصائيات المنصة...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-primary-charcoal dark:text-white mb-2 tracking-tight">
                        نظرة عامة
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        ملخص أداء المنصة والإحصائيات الرئيسية اليوم.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 font-bold rounded-xl text-sm flex items-center gap-2 border border-green-100 dark:border-green-800/30">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> المنصة تعمل بشكل ممتاز
                    </span>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Main KPIs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Revenue Card (Glassmorphism) */}
                    <motion.div variants={itemVariants} className="relative group overflow-hidden bg-white dark:bg-card-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-action-blue/10 rounded-full blur-2xl group-hover:bg-action-blue/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-action-blue flex items-center justify-center text-xl">
                                <FiDollarSign />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                <FiArrowUpRight /> +12%
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1 relative z-10">إجمالي الإيرادات</h3>
                        <p className="text-3xl font-black text-primary-charcoal dark:text-white relative z-10">
                            ${stats?.totalRevenue.toFixed(2)}
                        </p>
                    </motion.div>

                    {/* Platform Fees Card */}
                    <motion.div variants={itemVariants} className="relative group overflow-hidden bg-white dark:bg-card-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-xl">
                                <FiTrendingUp />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                <FiArrowUpRight /> +8%
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1 relative z-10">أرباح المنصة (العمولة)</h3>
                        <p className="text-3xl font-black text-primary-charcoal dark:text-white relative z-10">
                            ${stats?.platformFees.toFixed(2)}
                        </p>
                    </motion.div>

                    {/* Orders Card */}
                    <motion.div variants={itemVariants} className="relative group overflow-hidden bg-white dark:bg-card-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center text-xl">
                                <FiShoppingCart />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                                <FiArrowDownRight /> -2%
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1 relative z-10">إجمالي الطلبات</h3>
                        <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-3xl font-black text-primary-charcoal dark:text-white">{stats?.totalOrders}</p>
                            <span className="text-sm font-bold text-gray-400 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                                {stats?.paidOrders} مدفوع
                            </span>
                        </div>
                    </motion.div>

                    {/* Users Card */}
                    <motion.div variants={itemVariants} className="relative group overflow-hidden bg-white dark:bg-card-white p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center text-xl">
                                <FiUsers />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                {stats?.totalSellers} مبدع
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-1 relative z-10">إجمالي المستخدمين</h3>
                        <p className="text-3xl font-black text-primary-charcoal dark:text-white relative z-10">
                            {stats?.totalUsers}
                        </p>
                    </motion.div>
                </div>

                {/* Secondary Action Cards row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Alerts/Pending Payouts */}
                    <Link href="/admin/dashboard/payouts">
                        <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-gray-400 font-bold mb-1">سحوبات معلقة بانتظار المراجعة</h3>
                                    <div className="text-4xl font-black mb-4">{stats?.pendingPayouts}</div>
                                    <span className="text-sm font-bold flex items-center gap-1 text-action-blue hover:text-white transition-colors">
                                        مراجعة الطلبات <FiArrowUpRight />
                                    </span>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-action-blue group-hover:scale-110 transition-all">
                                    <FiClock className="text-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Pending Manual Orders */}
                    <Link href="/admin/dashboard/orders?type=manual">
                        <motion.div variants={itemVariants} className="bg-white dark:bg-card-white border border-yellow-200 dark:border-yellow-900/30 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group cursor-pointer hover:border-yellow-400 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">حوالات يدوية معلقة</h3>
                                    <div className="text-4xl font-black mb-4 text-primary-charcoal dark:text-white">{stats?.pendingManualOrders}</div>
                                    <span className="text-sm font-bold flex items-center gap-1 text-yellow-600 transition-colors">
                                        التحقق من الدفعات <FiArrowUpRight />
                                    </span>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-all">
                                    <FiAlertCircle className="text-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Content Inventory Status */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-action-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-1">المحتوى المعروض</h3>
                                <div className="text-4xl font-black mb-4 text-primary-charcoal dark:text-white">
                                    {(stats?.totalProducts || 0) + (stats?.totalCourses || 0)}
                                </div>
                                <div className="text-sm font-bold text-gray-500 flex gap-4">
                                    <span><strong className="text-action-blue">{stats?.totalProducts}</strong> منتج</span>
                                    <span><strong className="text-purple-500">{stats?.totalCourses}</strong> دورة</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                                <FiPackage className="text-2xl" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Lists Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                    {/* Recent Orders Table */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-card-white rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                            <h2 className="text-lg font-black text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiActivity className="text-action-blue" /> أحدث الطلبات
                            </h2>
                            <Link href="/admin/dashboard/orders" className="text-sm font-bold text-action-blue hover:underline">
                                عرض الكل
                            </Link>
                        </div>
                        <div className="p-0 overflow-x-auto flex-1">
                            <table className="w-full text-right whitespace-nowrap">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50">
                                        <th className="font-bold py-3 px-6">الطلب & المشتري</th>
                                        <th className="font-bold py-3 px-6">البائع</th>
                                        <th className="font-bold py-3 px-6">المبلغ</th>
                                        <th className="font-bold py-3 px-6">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-12 text-gray-500 font-bold">
                                                لا توجد طلبات حديثة
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-mono text-xs text-gray-400 mb-1">#{order.orderNumber}</div>
                                                    <div className="font-bold text-gray-900 dark:text-white mb-0.5">{order.user.name}</div>
                                                    <div className="text-xs text-gray-500 overflow-hidden text-ellipsis max-w-[150px] font-medium" title={order.items.map(i => i.product?.title || i.course?.title).join(', ')}>
                                                        {order.items.map(i => i.product?.title || i.course?.title).join(', ')}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-700 dark:text-gray-300">
                                                        {order.seller?.name || 'المنصة'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-black text-primary-charcoal dark:text-white text-lg">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${order.status === 'PAID'
                                                            ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-500/20'
                                                            : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400 dark:ring-yellow-500/20'
                                                        }`}>
                                                        {order.status === 'PAID' ? 'مكتمل' : 'معلق'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Top Sellers Leaderboard */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-card-white rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                            <h2 className="text-lg font-black text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiTrendingUp className="text-action-blue" /> أفضل البائعين
                            </h2>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="space-y-6">
                                {topSellers.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 font-bold">لا توجد بيانات بائعين لـعرضها</p>
                                ) : (
                                    topSellers.map((seller, index) => (
                                        <div key={seller.id} className="flex items-center gap-4 relative group">

                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="relative">
                                                    {seller.avatar ? (
                                                        <img src={seller.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-800" alt={seller.name} />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                            {seller.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {/* Rank badge */}
                                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black outline outline-2 outline-white dark:outline-card-white ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                            index === 1 ? 'bg-gray-300 text-gray-800' :
                                                                index === 2 ? 'bg-orange-300 text-orange-900' :
                                                                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{seller.name}</h4>
                                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{seller._count.sellerOrders} طلب مباع</span>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-action-blue text-lg">
                                                    ${seller.totalEarnings.toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revenue</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
