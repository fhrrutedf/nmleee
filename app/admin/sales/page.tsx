'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    FiSearch, FiFilter, FiImage, FiFileText, FiDollarSign,
    FiUsers, FiClock, FiCheckCircle, FiXCircle, FiChevronLeft,
    FiChevronRight, FiX, FiExternalLink, FiUser, FiShoppingBag
} from 'react-icons/fi';

interface SaleOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    totalAmount: number;
    platformFee: number;
    sellerAmount: number;
    status: string;
    paymentMethod: string | null;
    paymentProvider: string | null;
    paymentCountry: string | null;
    paymentProof: string | null;
    transactionRef: string | null;
    senderPhone: string | null;
    paymentNotes: string | null;
    isPaid: boolean;
    paidAt: string | null;
    verifiedAt: string | null;
    createdAt: string;
    discount: number;
    seller: {
        id: string;
        name: string;
        username: string;
        email: string;
        avatar: string | null;
    } | null;
    items: Array<{
        id: string;
        price: number;
        itemType: string;
        product?: { title: string; image: string | null } | null;
        course?: { title: string; image: string | null } | null;
        bundle?: { title: string; image: string | null } | null;
    }>;
    invoices: Array<{
        id: string;
        invoiceNumber: string;
        status: string;
    }>;
}

interface Stats {
    totalRevenue: number;
    totalPlatformFee: number;
    totalSellerAmount: number;
    totalOrders: number;
    pendingCount: number;
    paidCount: number;
    completedCount: number;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'معلق',
    PAID: 'مدفوع',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    REFUNDED: 'مسترد',
};

export default function AdminSalesPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [orders, setOrders] = useState<SaleOrder[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Image modal
    const [proofImage, setProofImage] = useState<string | null>(null);

    useEffect(() => {
        if (!session) return;
        fetchSales();
    }, [session, page, statusFilter, paymentFilter, dateFrom, dateTo]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (paymentFilter !== 'all') params.set('paymentMethod', paymentFilter);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);

            const res = await fetch(`/api/admin/sales?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setStats(data.stats);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchSales();
    };

    const getItemTitle = (item: SaleOrder['items'][0]) => {
        return item.product?.title || item.course?.title || item.bundle?.title || 'منتج';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">📊 المبيعات</h1>
                    <p className="text-gray-500 mt-1">تفاصيل كاملة لجميع عمليات البيع في المنصة</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <FiShoppingBag className="text-indigo-600" size={20} />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">إجمالي الطلبات</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <FiDollarSign className="text-emerald-600" size={20} />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">إجمالي الإيرادات</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <FiClock className="text-amber-600" size={20} />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">طلبات معلقة</span>
                            </div>
                            <p className="text-2xl font-black text-amber-600">{stats.pendingCount}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <FiUsers className="text-purple-600" size={20} />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">عمولة المنصة</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.totalPlatformFee.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-sm">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FiSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="بحث بالاسم أو البريد أو رقم الطلب..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="PENDING">معلق</option>
                            <option value="PAID">مدفوع</option>
                            <option value="COMPLETED">مكتمل</option>
                            <option value="CANCELLED">ملغي</option>
                        </select>

                        {/* Payment Filter */}
                        <select
                            value={paymentFilter}
                            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none"
                        >
                            <option value="all">كل طرق الدفع</option>
                            <option value="manual">دفع يدوي</option>
                            <option value="stripe">Stripe</option>
                            <option value="crypto">عملات رقمية</option>
                        </select>

                        {/* Date From */}
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none"
                        />

                        {/* Date To */}
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => { setDateTo(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none"
                        />

                        <button
                            onClick={handleSearch}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                        >
                            <FiFilter size={14} /> بحث
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">لا توجد مبيعات</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">الطلب</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">المشتري</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">المنتجات</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">البائع</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">المبلغ</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">الدفع</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">إيصال</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">رقم العملية</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">فاتورة</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            {/* Order Number */}
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-bold text-indigo-600">{order.orderNumber}</span>
                                            </td>

                                            {/* Buyer */}
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-xs">{order.customerName}</p>
                                                    <p className="text-[11px] text-gray-400">{order.customerEmail}</p>
                                                    {order.customerPhone && (
                                                        <p className="text-[11px] text-gray-400 font-mono" dir="ltr">{order.customerPhone}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Products */}
                                            <td className="px-4 py-3">
                                                <div className="space-y-1 max-w-[180px]">
                                                    {order.items.map(item => (
                                                        <p key={item.id} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                                            {getItemTitle(item)}
                                                        </p>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Seller */}
                                            <td className="px-4 py-3">
                                                {order.seller ? (
                                                    <div className="flex items-center gap-2">
                                                        {order.seller.avatar ? (
                                                            <img src={order.seller.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <FiUser size={12} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{order.seller.name}</p>
                                                            <p className="text-[11px] text-gray-400">@{order.seller.username}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">${order.totalAmount.toFixed(2)}</p>
                                                {order.discount > 0 && (
                                                    <p className="text-[10px] text-green-600">خصم: ${order.discount.toFixed(2)}</p>
                                                )}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                                                    {order.paymentMethod === 'manual' ? '💵 يدوي' : order.paymentMethod === 'stripe' ? '💳 Stripe' : order.paymentMethod === 'crypto' ? '🪙 كريبتو' : order.paymentMethod || '—'}
                                                </span>
                                                {order.paymentProvider && (
                                                    <p className="text-[10px] text-gray-400 mt-1">{order.paymentProvider}</p>
                                                )}
                                                {order.paymentCountry && (
                                                    <p className="text-[10px] text-gray-400">{order.paymentCountry}</p>
                                                )}
                                            </td>

                                            {/* Receipt */}
                                            <td className="px-4 py-3">
                                                {order.paymentProof ? (
                                                    <button
                                                        onClick={() => setProofImage(order.paymentProof)}
                                                        className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
                                                    >
                                                        <img src={order.paymentProof} alt="إيصال" className="w-full h-full object-cover" />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>

                                            {/* Transaction Ref */}
                                            <td className="px-4 py-3">
                                                {order.transactionRef ? (
                                                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                                                        {order.transactionRef}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>

                                            {/* Invoice */}
                                            <td className="px-4 py-3">
                                                {order.invoices.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {order.invoices.map(inv => (
                                                            <span
                                                                key={inv.id}
                                                                className="text-[11px] font-mono text-indigo-600 hover:underline cursor-pointer block"
                                                                onClick={() => router.push(`/admin/invoices?id=${inv.id}`)}
                                                            >
                                                                <FiFileText className="inline ml-1" size={12} />
                                                                {inv.invoiceNumber}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-400">صفحة {page} من {totalPages}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Proof Image Modal */}
            {proofImage && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setProofImage(null)}>
                    <div className="relative max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setProofImage(null)}
                            className="absolute top-3 left-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 z-10"
                        >
                            <FiX size={16} />
                        </button>
                        <img src={proofImage} alt="إيصال الدفع" className="max-w-full max-h-[80vh] object-contain" />
                        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <a
                                href={proofImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                <FiExternalLink size={12} /> فتح في نافذة جديدة
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
