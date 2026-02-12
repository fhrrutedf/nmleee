'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface Overview {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    revenueChange: number;
    ordersChange: number;
    topProducts: any[];
}

export default function SellerDashboardPage() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [salesChart, setSalesChart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [overviewRes, chartRes] = await Promise.all([
                fetch('/api/seller/analytics/overview'),
                fetch('/api/seller/analytics/sales-chart?period=30d'),
            ]);

            if (overviewRes.ok) {
                const data = await overviewRes.json();
                setOverview(data);
            }

            if (chartRes.ok) {
                const data = await chartRes.json();
                setSalesChart(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !overview) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة تحكم البائع</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="إجمالي الإيرادات"
                        value={`${overview.totalRevenue.toFixed(2)} ج.م`}
                        change={overview.revenueChange}
                        icon={<FiDollarSign className="text-green-600" size={24} />}
                        bgColor="bg-green-100"
                    />

                    <StatsCard
                        title="إجمالي الطلبات"
                        value={overview.totalOrders.toString()}
                        change={overview.ordersChange}
                        icon={<FiShoppingBag className="text-blue-600" size={24} />}
                        bgColor="bg-blue-100"
                    />

                    <StatsCard
                        title="إجمالي العملاء"
                        value={overview.totalCustomers.toString()}
                        icon={<FiUsers className="text-purple-600" size={24} />}
                        bgColor="bg-purple-100"
                    />

                    <StatsCard
                        title="متوسط قيمة الطلب"
                        value={`${overview.avgOrderValue.toFixed(2)} ج.م`}
                        icon={<FiDollarSign className="text-orange-600" size={24} />}
                        bgColor="bg-orange-100"
                    />
                </div>

                {/* Sales Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">المبيعات (آخر 30 يوم)</h2>

                    {salesChart.length > 0 ? (
                        <div className="h-64 flex items-end gap-1">
                            {salesChart.map((item, index) => {
                                const maxRevenue = Math.max(...salesChart.map((d) => d.revenue));
                                const height = (item.revenue / maxRevenue) * 100;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center group">
                                        <div
                                            className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer relative"
                                            style={{ height: `${height}%` }}
                                            title={`${item.revenue.toFixed(2)} ج.م - ${item.orders} طلب`}
                                        >
                                            <div className="hidden group-hover:block absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                                {item.revenue.toFixed(0)} ج.م
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            لا توجد بيانات متاحة
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-bold text-gray-900">أكثر المنتجات مبيعاً</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        المنتج
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        المبيعات
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الإيرادات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {overview.topProducts.map((product) => (
                                    <tr key={product?.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product?.image && (
                                                    <img
                                                        src={product.image}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">{product?.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {product?.salesCount} مبيعة
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {product?.revenue?.toFixed(2)} ج.م
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {overview.topProducts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            لا توجد مبيعات بعد
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    bgColor: string;
}

function StatsCard({ title, value, change, icon, bgColor }: StatsCardProps) {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                        {Math.abs(change).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
