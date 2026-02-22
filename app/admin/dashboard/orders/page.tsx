'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiShoppingCart,
    FiSearch,
    FiFilter,
    FiCreditCard,
    FiClock,
    FiEye,
    FiDownload
} from 'react-icons/fi';

interface OrderItem {
    id: string;
    product?: { title: string; itemType: string };
    course?: { title: string };
    price: number;
}

interface OrderData {
    id: string;
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    platformFee: number;
    sellerEarnings: number;
    status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED';
    paymentMethod: string;
    createdAt: string;
    user: { name: string; email: string };
    seller: { name: string; email: string };
    items: OrderItem[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function AdminOrdersManagement() {
    const { data: session } = useSession();
    const router = useRouter();

    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        totalOrders: 0,
        paidOrders: 0,
        pendingManual: 0,
        totalRevenue: { _sum: { totalAmount: 0 } }
    });

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [session, page, statusFilter, typeFilter, searchQuery]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/admin/orders', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('status', statusFilter);
            url.searchParams.append('type', typeFilter);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.totalPages);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchOrders();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
            case 'PAID':
            case 'COMPLETED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'REFUNDED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'معلق / بانتظار الدفع';
            case 'PAID': return 'مدفوع';
            case 'COMPLETED': return 'مكتمل';
            case 'REFUNDED': return 'مسترجع';
            default: return status;
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-primary-charcoal dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-action-blue flex items-center justify-center">
                            <FiShoppingCart />
                        </div>
                        إدارة الطلبات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        متابعة الطلبات، الحوالات اليدوية، والمدفوعات على المنصة.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-gray-400 text-xs">إجمالي</span>
                        <span className="text-primary-charcoal dark:text-white text-lg">{stats.totalOrders}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-green-500 text-xs">مكتمل ومدفوع</span>
                        <span className="text-green-600 dark:text-green-400 text-lg">{stats.paidOrders}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center text-center">
                        <span className="text-orange-500 text-[11px] leading-tight">حوالات يدوي<br />(قيد المراجعة)</span>
                        <span className="text-orange-600 dark:text-orange-400 text-lg">{stats.pendingManual}</span>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="bg-white dark:bg-card-white rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
            >
                {/* Controls Bar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col lg:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب، اسم العميل، اسم البائع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/50 focus:border-action-blue transition-all text-primary-charcoal dark:text-white"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-action-blue transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            <FiFilter className="text-action-blue" />
                            الحالة:
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-primary-charcoal dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="PENDING">معلق/بانتظار الدفع</option>
                                <option value="PAID">مدفوع ومكتمل</option>
                                <option value="REFUNDED">مسترجع</option>
                            </select>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            الدفع:
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-primary-charcoal dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="online">إلكتروني (مباشر)</option>
                                <option value="manual">يدوي (حوالات بنكية)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {loading && orders.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-action-blue rounded-full animate-spin mb-4"></div>
                            جاري تحميل الطلبات...
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50">
                                    <th className="font-bold py-4 px-6">رقم الطلب & التاريخ</th>
                                    <th className="font-bold py-4 px-6">العميل</th>
                                    <th className="font-bold py-4 px-6">البائع / المتجر</th>
                                    <th className="font-bold py-4 px-6">المنتجات</th>
                                    <th className="font-bold py-4 px-6 text-center">الإجمالي</th>
                                    <th className="font-bold py-4 px-6 text-center">طريقة الدفع</th>
                                    <th className="font-bold py-4 px-6 text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiShoppingCart size={48} className="mb-4 text-gray-200 dark:text-gray-800" />
                                                <p className="font-bold">لم يتم العثور على طلبات</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <motion.tr variants={itemVariants} key={order.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-mono text-xs font-bold text-gray-500 mb-1">
                                                    #{order.orderNumber}
                                                </div>
                                                <div className="text-[11px] text-gray-400 flex items-center gap-1 font-bold">
                                                    <FiClock size={10} /> {formatDate(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white">{order.user.name}</div>
                                                <div className="text-[10px] text-gray-500">{order.user.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {order.seller.name}
                                                </div>
                                                <div className="text-[10px] text-gray-500">{order.seller.email}</div>
                                            </td>
                                            <td className="py-4 px-6 max-w-[200px]">
                                                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                    {order.items.map(i => i.product ? i.product.title : i.course?.title).join(', ')}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                    {order.items.length} عناصر
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="font-black text-gray-900 dark:text-white">
                                                    ${order.totalAmount.toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-gray-500 font-bold" title="ربح البائع">
                                                    صافي للبائع: ${order.sellerEarnings?.toFixed(2) || '0.00'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${order.paymentMethod === 'manual'
                                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                                    }`}>
                                                    {order.paymentMethod === 'manual' ? 'حوالة بنكية يدوية' : order.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black tracking-widest border ${getStatusStyle(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                    {order.paymentMethod === 'manual' && order.status === 'PENDING' && (
                                                        <button className="text-[10px] flex items-center gap-1 font-bold text-action-blue hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded w-full justify-center">
                                                            <FiEye /> مرجعة الإيصال
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 flex justify-center mt-auto">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span className="text-sm font-bold text-gray-500 px-4">
                                صفحة {page} من {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
