'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiAlertCircle,
    FiTrendingUp,
    FiClock,
    FiCheckCircle,
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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
                    <p className="text-gray-600 mt-2">مرحباً بك في لوحة إدارة المنصة</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <FiDollarSign className="text-3xl" />
                            <span className="text-sm opacity-90">إجمالي الإيرادات</span>
                        </div>
                        <div className="text-3xl font-bold">${stats?.totalRevenue.toFixed(2)}</div>
                    </div>

                    {/* Platform Fees */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <FiTrendingUp className="text-3xl" />
                            <span className="text-sm opacity-90">عمولة المنصة</span>
                        </div>
                        <div className="text-3xl font-bold">${stats?.platformFees.toFixed(2)}</div>
                        <div className="text-xs opacity-75 mt-1">10% من كل عملية</div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <FiShoppingCart className="text-3xl" />
                            <span className="text-sm opacity-90">الطلبات</span>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalOrders}</div>
                        <div className="text-xs opacity-75 mt-1">
                            {stats?.paidOrders} مدفوعة | {stats?.pendingOrders} معلقة
                        </div>
                    </div>

                    {/* Total Users */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <FiUsers className="text-3xl" />
                            <span className="text-sm opacity-90">المستخدمين</span>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalUsers}</div>
                        <div className="text-xs opacity-75 mt-1">{stats?.totalSellers} بائع</div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Pending Payouts */}
                    <Link href="/admin/payouts">
                        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-r-4 border-orange-500">
                            <div className="flex items-center justify-between mb-2">
                                <FiClock className="text-3xl text-orange-500" />
                                <span className="text-2xl font-bold">{stats?.pendingPayouts}</span>
                            </div>
                            <h3 className="font-medium text-gray-900">سحوبات معلقة</h3>
                            <p className="text-sm text-gray-600 mt-1">تحتاج للمراجعة</p>
                        </div>
                    </Link>

                    {/* Pending Manual Orders */}
                    <Link href="/admin/manual-orders">
                        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-r-4 border-yellow-500">
                            <div className="flex items-center justify-between mb-2">
                                <FiAlertCircle className="text-3xl text-yellow-500" />
                                <span className="text-2xl font-bold">{stats?.pendingManualOrders}</span>
                            </div>
                            <h3 className="font-medium text-gray-900">دفعات يدوية معلقة</h3>
                            <p className="text-sm text-gray-600 mt-1">تحتاج للتحقق</p>
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="bg-white rounded-lg shadow p-6 border-r-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <FiPackage className="text-3xl text-blue-500" />
                            <span className="text-2xl font-bold">
                                {(stats?.totalProducts || 0) + (stats?.totalCourses || 0)}
                            </span>
                        </div>
                        <h3 className="font-medium text-gray-900">المحتوى</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {stats?.totalProducts} منتج | {stats?.totalCourses} دورة
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">آخر الطلبات</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">لا توجد طلبات</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="border-b pb-4 last:border-b-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <div>
                                                    <span className="font-mono text-sm text-gray-600">
                                                        {order.orderNumber}
                                                    </span>
                                                    <div className="text-sm text-gray-500">{order.user.name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-green-600">
                                                        ${order.totalAmount.toFixed(2)}
                                                    </div>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${order.status === 'PAID'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {order.status === 'PAID' ? 'مدفوع' : 'معلق'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.items.map((item, idx) => (
                                                    <span key={idx}>
                                                        {item.product?.title || item.course?.title}
                                                        {idx < order.items.length - 1 && ', '}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Sellers */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">أفضل البائعين</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {topSellers.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">لا يوجد بائعين</p>
                                ) : (
                                    topSellers.map((seller, index) => (
                                        <div key={seller.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                                            <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{seller.name}</div>
                                                <div className="text-sm text-gray-500">{seller.email}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {seller._count.sellerOrders} طلب
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-600">
                                                    ${seller.totalEarnings.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">إجمالي الأرباح</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
