'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiAlertCircle, FiTrendingUp, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        pendingApprovals: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchStats();
        }
    }, [session]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text">لوحة تحكم الأدمن</h1>
                    <p className="text-gray-600 mt-2">إدارة شاملة للمنصة</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                                <p className="text-blue-100 text-sm mt-2">نشط: {stats.activeUsers}</p>
                            </div>
                            <FiUsers className="text-5xl text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">إجمالي المنتجات</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
                            </div>
                            <FiShoppingBag className="text-5xl text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">إجمالي الإيرادات</p>
                                <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                            <FiDollarSign className="text-5xl text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">إجمالي الطلبات</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
                            </div>
                            <FiTrendingUp className="text-5xl text-orange-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">قيد المراجعة</p>
                                <p className="text-3xl font-bold mt-1">{stats.pendingApprovals}</p>
                            </div>
                            <FiAlertCircle className="text-5xl text-red-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-100 text-sm">النشاط اليومي</p>
                                <p className="text-3xl font-bold mt-1">---</p>
                            </div>
                            <FiActivity className="text-5xl text-cyan-200" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="btn btn-primary"
                    >
                        إدارة المستخدمين
                    </button>
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="btn btn-primary"
                    >
                        إدارة المنتجات
                    </button>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="btn btn-primary"
                    >
                        إدارة الطلبات
                    </button>
                    <button
                        onClick={() => router.push('/admin/reports')}
                        className="btn btn-primary"
                    >
                        التقارير
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">النشاط الأخير</h2>
                    <div className="text-center py-8 text-gray-500">
                        لا يوجد نشاط حديث
                    </div>
                </div>
            </div>
        </div>
    );
}
