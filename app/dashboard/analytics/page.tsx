'use client';

import { useState, useEffect } from 'react';
import {
    FiTrendingUp,
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiEye,
    FiDownload,
    FiCalendar,
    FiBarChart2,
    FiPieChart,
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [period, setPeriod] = useState('30'); // 7, 30, 90 days
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/analytics?period=${period}`);
            setStats(data);
        } catch (error) {
            console.error('Error fetching analytics:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    const revenueData = {
        labels: stats?.revenueChart?.labels || [],
        datasets: [
            {
                label: 'الإيرادات (ج.م)',
                data: stats?.revenueChart?.data || [],
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const productSalesData = {
        labels: stats?.topProducts?.map((p: any) => p.title) || [],
        datasets: [
            {
                label: 'المبيعات',
                data: stats?.topProducts?.map((p: any) => p.sales) || [],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                ],
            },
        ],
    };

    const trafficSourcesData = {
        labels: ['مباشر', 'سوشيال ميديا', 'بحث جوجل', 'روابط خارجية', 'أخرى'],
        datasets: [
            {
                data: stats?.trafficSources?.length ? stats.trafficSources : [1, 1, 1, 1, 1],
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                ],
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">التحليلات والإحصاءات</h1>
                    <p className="text-text-muted mt-1">تحليلات شاملة لأداء متجرك</p>
                </div>

                {/* Period Filter */}
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="input max-w-xs"
                >
                    <option value="7">آخر 7 أيام</option>
                    <option value="30">آخر 30 يوم</option>
                    <option value="90">آخر 90 يوم</option>
                    <option value="365">آخر سنة</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-100">إجمالي الإيرادات</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats?.totalRevenue?.toFixed(2) || '0.00'} ج.م
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-100">
                        <FiTrendingUp className="text-green-300" />
                        <span>+{stats?.revenueGrowth || 0}% من الفترة السابقة</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-100">إجمالي الطلبات</span>
                        <FiShoppingCart className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats?.totalOrders || 0}</div>
                    <div className="flex items-center gap-2 text-sm text-green-100">
                        <FiTrendingUp className="text-green-300" />
                        <span>+{stats?.ordersGrowth || 0}% من الفترة السابقة</span>
                    </div>
                </div>

                {/* Total Views */}
                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-100">مشاهدات المنتجات</span>
                        <FiEye className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats?.totalViews || 0}</div>
                    <div className="flex items-center gap-2 text-sm text-orange-100">
                        <FiTrendingUp className="text-orange-300" />
                        <span>+{stats?.viewsGrowth || 0}% من الفترة السابقة</span>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-100">معدل التحويل</span>
                        <FiBarChart2 className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats?.conversionRate || 0}%</div>
                    <div className="flex items-center gap-2 text-sm text-purple-100">
                        <FiTrendingUp className="text-purple-300" />
                        <span>ممتاز!</span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiTrendingUp className="text-primary-600" />
                    تطور الإيرادات
                </h2>
                <Line
                    data={revenueData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: (value) => `${value} ج.م`,
                                },
                            },
                        },
                    }}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FiPieChart className="text-primary-600" />
                        أكثر المنتجات مبيعاً
                    </h2>
                    <Bar
                        data={productSalesData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1,
                                    },
                                },
                            },
                        }}
                    />
                </div>

                {/* Traffic Sources */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FiUsers className="text-primary-600" />
                        مصادر الزيارات
                    </h2>
                    <div className="max-w-sm mx-auto">
                        <Doughnut
                            data={trafficSourcesData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 className="text-xl font-bold mb-6">النشاط الأخير</h2>
                <div className="space-y-4">
                    {stats?.recentActivity?.map((activity: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                {activity.type === 'order' && <FiShoppingCart className="text-primary-600" />}
                                {activity.type === 'view' && <FiEye className="text-primary-600" />}
                                {activity.type === 'download' && <FiDownload className="text-primary-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold">{activity.title}</p>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <FiCalendar className="text-gray-400" />
                                {activity.time}
                            </div>
                        </div>
                    )) || (
                            <p className="text-center text-gray-500 py-8">لا يوجد نشاط حديث</p>
                        )}
                </div>
            </div>

            {/* Top Performing Products Table */}
            <div className="card">
                <h2 className="text-xl font-bold mb-6">أداء المنتجات</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-right py-3 px-4">المنتج</th>
                                <th className="text-right py-3 px-4">المبيعات</th>
                                <th className="text-right py-3 px-4">المشاهدات</th>
                                <th className="text-right py-3 px-4">معدل التحويل</th>
                                <th className="text-right py-3 px-4">الإيرادات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.productPerformance?.map((product: any, index: number) => (
                                <tr key={index} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="py-3 px-4 font-bold text-primary-charcoal dark:text-white">{product.title}</td>
                                    <td className="py-3 px-4 text-primary-charcoal dark:text-gray-300">{product.sales}</td>
                                    <td className="py-3 px-4 text-primary-charcoal dark:text-gray-300">{product.views}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.conversionRate > 5
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {product.conversionRate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-primary-600">
                                        {product.revenue.toFixed(2)} ج.م
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            لا توجد بيانات متاحة
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
