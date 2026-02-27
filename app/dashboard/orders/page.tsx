'use client';

import { useState, useEffect } from 'react';
import { FiShoppingBag, FiClock, FiCheck, FiX, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await apiGet('/api/orders');
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', handleApiError(err));
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch =
            !searchTerm ||
            (order.orderNumber || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheck /> مكتمل
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <FiClock /> قيد الانتظار
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <FiX /> ملغي
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <FiX className="text-3xl text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-primary-charcoal dark:text-white">فشل تحميل الطلبات</h3>
                <p className="text-text-muted">تحقق من اتصالك بالإنترنت وحاول مجدداً</p>
                <button onClick={fetchOrders} className="btn btn-primary flex items-center gap-2">
                    <FiRefreshCw /> إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">الطلبات</h1>
                    <p className="text-text-muted mt-1">تتبع المبيعات والطلبات الواردة لمتجرك</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-text-muted text-sm mb-1">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold text-primary-charcoal dark:text-white">{orders.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-text-muted text-sm mb-1">الطلبات المكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{orders.filter((o: any) => o.status === 'COMPLETED').length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-text-muted text-sm mb-1">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-orange-500">{orders.filter((o: any) => o.status === 'PENDING').length}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد أو رقم الطلب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pr-10 w-full"
                    />
                </div>
                <div className="relative sm:w-48">
                    <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input pr-10 w-full bg-white dark:bg-gray-800"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="COMPLETED">مكتمل</option>
                        <option value="PENDING">قيد الانتظار</option>
                        <option value="CANCELLED">ملغي</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent mx-auto"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="card text-center py-16 px-6 border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShoppingBag className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">
                        {orders.length === 0 ? 'لا توجد طلبات بعد' : 'لا توجد نتائج مطابقة'}
                    </h3>
                    <p className="text-text-muted mb-6 max-w-sm mx-auto">
                        {orders.length === 0
                            ? 'لم تتلق أي طلبات حتى الآن. شارك رابط متجرك على منصات التواصل الاجتماعي!'
                            : 'جرب تغيير كلمة البحث أو الفلتر'}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">رقم الطلب</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">التاريخ</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">العميل</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">المنتجات</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">المبلغ</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-primary-charcoal dark:text-white">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredOrders.map((order: any, idx) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="py-4 px-6 font-mono text-sm text-text-muted">
                                            #{order.orderNumber || order.id.slice(0, 8)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-primary-charcoal dark:text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-sm">
                                            <div className="font-medium text-primary-charcoal dark:text-white">{order.customerName || 'عميل زائر'}</div>
                                            <div className="text-xs text-text-muted">{order.customerEmail}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="space-y-1">
                                                {order.items?.map((item: any) => (
                                                    <div key={item.id} className="text-sm text-primary-charcoal dark:text-gray-300">
                                                        {item.product?.title || 'منتج غير معروف'}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-primary-charcoal dark:text-white">
                                            <div>{order.totalAmount.toFixed(2)} ج.م</div>
                                            {order.paymentMethod === 'CRYPTO_USDT' && (
                                                <div className="text-xs text-yellow-600 bg-yellow-100 inline-block px-2 py-0.5 rounded-md mt-1">
                                                    USDT {order.cryptoAmount}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(order.status)}
                                            {order.paymentMethod === 'CRYPTO_USDT' && order.cryptoStatus && (
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    CoinRemitter: {order.cryptoStatus}
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
