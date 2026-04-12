'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDollarSign,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiCreditCard,
    FiAlertTriangle,
    FiLoader
} from 'react-icons/fi';

interface PayoutData {
    id: string;
    payoutNumber: string;
    amount: number;
    method: string;
    methodDetails: any;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
    requestedAt: string;
    user: {
        name: string;
        email: string;
        avatar: string | null;
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function PayoutsManagement() {
    const { data: session } = useSession();
    const router = useRouter();

    const [payouts, setPayouts] = useState<PayoutData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Modal state
    const [modal, setModal] = useState<{
        open: boolean;
        payoutId: string;
        action: 'APPROVE' | 'REJECT';
        payoutAmount: number;
        sellerName: string;
        transactionId: string;
        rejectionReason: string;
    }>({ open: false, payoutId: '', action: 'APPROVE', payoutAmount: 0, sellerName: '', transactionId: '', rejectionReason: '' });

    // Stats
    const [stats, setStats] = useState({
        totalPayouts: 0,
        pendingCount: 0,
        completedAmount: { _sum: { amount: 0 } }
    });

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchPayouts();
    }, [session, page, statusFilter, searchQuery]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/admin/payouts', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('status', statusFilter);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setPayouts(data.payouts);
                setTotalPages(data.pagination.totalPages);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchPayouts();
    };

    const openModal = (payout: PayoutData, action: 'APPROVE' | 'REJECT') => {
        setModal({
            open: true,
            payoutId: payout.id,
            action,
            payoutAmount: payout.amount,
            sellerName: payout.user.name,
            transactionId: '',
            rejectionReason: '',
        });
    };

    const handlePayoutAction = async () => {
        const { payoutId, action, transactionId, rejectionReason } = modal;
        setActionLoading(payoutId);
        try {
            const endpoint = action === 'APPROVE'
                ? `/api/admin/payouts/${payoutId}/approve`
                : `/api/admin/payouts/${payoutId}/reject`;

            const body = action === 'APPROVE'
                ? { transactionId: transactionId || undefined, adminNotes: undefined }
                : { rejectionReason: rejectionReason || 'غير محدد' };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok) {
                setModal(m => ({ ...m, open: false }));
                fetchPayouts(); // Refresh table
            } else {
                alert(`❌ خطأ: ${data.error || 'حدث خطأ غير متوقع'}`);
            }
        } catch (error) {
            alert('❌ فشل الاتصال بالخادم');
        } finally {
            setActionLoading(null);
        }
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
            case 'PROCESSING': return 'bg-emerald-700 text-white-50 text-[#10B981] dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            case 'COMPLETED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'REJECTED': return 'bg-red-500/100/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50';
            default: return 'bg-[#111111] text-gray-300 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'قيد المراجعة';
            case 'PROCESSING': return 'جاري التحويل';
            case 'COMPLETED': return 'مكتمل';
            case 'REJECTED': return 'مرفوض';
            default: return status;
        }
    };

    const getMethodDisplay = (method: string, details: any) => {
        switch (method) {
            case 'paypal': return <span><span className="font-bold text-blue-400">PayPal:</span> {details?.paypalEmail || ''}</span>;
            case 'bank': return <span><span className="font-bold text-emerald-400">بنكي:</span> {details?.accountName} — {details?.bankName} ({details?.accountNumber})</span>;
            case 'crypto': return <span><span className="font-bold text-yellow-400">Crypto:</span> {details?.cryptoWallet}</span>;
            case 'shamcash': return <span><span className="font-bold text-orange-400">شام كاش:</span> {details?.number || details?.phone || ''}</span>;
            case 'omt': return <span><span className="font-bold text-purple-400">OMT:</span> {details?.number || details?.phone || ''}</span>;
            case 'zaincash': return <span><span className="font-bold text-red-400">زين كاش:</span> {details?.number || details?.phone || ''}</span>;
            case 'vodafone': return <span><span className="font-bold text-red-500">فودافون كاش:</span> {details?.number || details?.phone || ''}</span>;
            case 'mtncash': return <span><span className="font-bold text-yellow-500">MTN كاش:</span> {details?.number || details?.phone || ''}</span>;
            case 'syriatel': return <span><span className="font-bold text-orange-500">سيريتل كاش:</span> {details?.number || details?.phone || ''}</span>;
            default: return <span className="uppercase text-gray-400 bg-gray-800 px-2 py-0.5 rounded text-[10px]">{method}</span>;
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#10B981] dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                            <FiDollarSign />
                        </div>
                        إدارة السحوبات المالية
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        مراجعة واعتماد طلبات سحب الأرباح للمبدعين على المنصة.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex bg-[#0A0A0A] dark:bg-card-white border border-white/10 dark:border-gray-800 rounded-xl shadow-lg shadow-[#10B981]/20 overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-gray-400 text-xs">إجمالي الطلبات</span>
                        <span className="text-[#10B981] dark:text-white text-lg">{stats.totalPayouts}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-orange-500 text-xs">معلق بالمراجعة</span>
                        <span className="text-orange-600 dark:text-orange-400 text-lg">{stats.pendingCount}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-green-500 text-xs">تم تحويله</span>
                        <span className="text-green-600 dark:text-green-400 text-lg">${stats.completedAmount?._sum?.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="bg-[#0A0A0A] dark:bg-card-white rounded-xl border border-white/10 dark:border-gray-800 shadow-lg shadow-[#10B981]/20 overflow-hidden flex flex-col min-h-[500px]"
            >
                {/* Controls Bar */}
                <div className="p-6 border-b border-white/10 dark:border-gray-800 bg-[#111111]/50 dark:bg-gray-900/20 flex flex-col lg:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب أو البائع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0A0A0A] dark:bg-gray-900 border border-emerald-500/20 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-[#10B981] dark:text-white"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-[#0A0A0A] dark:bg-gray-900 px-4 py-2 rounded-xl border border-emerald-500/20 dark:border-gray-700">
                            <FiFilter className="text-green-500" />
                            الحالة:
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-[#10B981] dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="PENDING">قيد المراجعة</option>
                                <option value="PROCESSING">جاري التحويل</option>
                                <option value="COMPLETED">مكتمل</option>
                                <option value="REJECTED">مرفوض</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {loading && payouts.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-green-500 rounded-xl animate-spin mb-4"></div>
                            جاري تحميل طلبات السحب...
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-white/10 dark:border-gray-800 bg-[#111111]/80 dark:bg-gray-900/50">
                                    <th className="font-bold py-4 px-6">رقم الطلب & التاريخ</th>
                                    <th className="font-bold py-4 px-6">البائع</th>
                                    <th className="font-bold py-4 px-6">المبلغ المطلوب</th>
                                    <th className="font-bold py-4 px-6">طريقة التحويل & التفاصيل</th>
                                    <th className="font-bold py-4 px-6 text-center">الحالة</th>
                                    <th className="font-bold py-4 px-6 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiCreditCard size={48} className="mb-4 text-gray-200 dark:text-gray-800" />
                                                <p className="font-bold">لم يتم العثور على طلبات سحب</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map((payout) => (
                                        <motion.tr variants={itemVariants} key={payout.id} className="border-b border-white/10 dark:border-gray-800/60 hover:bg-[#111111] dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-mono text-xs font-bold text-gray-500 mb-1">
                                                    #{payout.payoutNumber}
                                                </div>
                                                <div className="text-[11px] text-gray-400 flex items-center gap-1 font-bold">
                                                    <FiClock size={10} /> {formatDate(payout.requestedAt)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {payout.user.avatar ? (
                                                        <img src={payout.user.avatar} className="w-8 h-8 rounded-xl object-cover border border-white/10 dark:border-gray-800" alt={payout.user.name} />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-800 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            {payout.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-white dark:text-white line-clamp-1">{payout.user.name}</div>
                                                        <div className="text-[10px] text-gray-500">{payout.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-green-600 text-lg">
                                                    ${payout.amount.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-xs text-gray-400 dark:text-gray-300 bg-[#111111] dark:bg-gray-800/50 p-2 rounded-lg border border-white/10 dark:border-gray-800 inline-block">
                                                    {getMethodDisplay(payout.method, payout.methodDetails)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest border ${getStatusStyle(payout.status)}`}>
                                                    {getStatusText(payout.status)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {payout.status === 'PENDING' ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal(payout, 'APPROVE')}
                                                            disabled={actionLoading === payout.id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                                                            title="اعتماد وتحويل المبلغ"
                                                        >
                                                            {actionLoading === payout.id ? <FiLoader className="inline animate-spin" /> : <FiCheckCircle className="inline mr-1" />} اعتماد
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(payout, 'REJECT')}
                                                            disabled={actionLoading === payout.id}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50"
                                                            title="رفض الطلب"
                                                        >
                                                            <FiXCircle className="inline mr-1" /> رفض
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{payout.status === 'COMPLETED' ? '✅ مكتمل' : payout.status === 'REJECTED' ? '❌ مرفوض' : payout.status}</span>
                                                )}
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
                    <div className="p-6 border-t border-white/10 dark:border-gray-800 bg-[#111111]/30 dark:bg-gray-900/10 flex justify-center mt-auto">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#0A0A0A] dark:bg-gray-800 border border-emerald-500/20 dark:border-gray-700 text-gray-400 dark:text-gray-300 hover:bg-[#111111] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span className="text-sm font-bold text-gray-500 px-4">
                                صفحة {page} من {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#0A0A0A] dark:bg-gray-800 border border-emerald-500/20 dark:border-gray-700 text-gray-400 dark:text-gray-300 hover:bg-[#111111] dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Action Confirmation Modal */}
            <AnimatePresence>
                {modal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setModal(m => ({ ...m, open: false }))}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`bg-[#111111] border rounded-2xl shadow-2xl p-8 max-w-md w-full ${
                                modal.action === 'APPROVE' ? 'border-green-500/30' : 'border-red-500/30'
                            }`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                                modal.action === 'APPROVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                                {modal.action === 'APPROVE' ? <FiCheckCircle size={32} /> : <FiAlertTriangle size={32} />}
                            </div>

                            <h3 className="text-xl font-bold text-white text-center mb-2">
                                {modal.action === 'APPROVE' ? '✅ اعتماد طلب السحب' : '❌ رفض طلب السحب'}
                            </h3>
                            <p className="text-gray-400 text-center text-sm mb-6">
                                {modal.action === 'APPROVE'
                                    ? `سيتم اعتماد سحب $${modal.payoutAmount.toFixed(2)} للمبدع ${modal.sellerName}`
                                    : `سيتم رفض طلب سحب $${modal.payoutAmount.toFixed(2)} وإعادة المبلغ لرصيد ${modal.sellerName}`
                                }
                            </p>

                            {modal.action === 'APPROVE' ? (
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-400 mb-2">رقم المعاملة / Transaction ID (اختياري)</label>
                                    <input
                                        type="text"
                                        placeholder="TXN-XXXXXXXX"
                                        value={modal.transactionId}
                                        onChange={e => setModal(m => ({ ...m, transactionId: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                    />
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-400 mb-2">سبب الرفض *</label>
                                    <textarea
                                        placeholder="مثال: بيانات التحويل غير صحيحة، أو الرصيد تحت الحد الأدنى..."
                                        value={modal.rejectionReason}
                                        onChange={e => setModal(m => ({ ...m, rejectionReason: e.target.value }))}
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModal(m => ({ ...m, open: false }))}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handlePayoutAction}
                                    disabled={!!actionLoading || (modal.action === 'REJECT' && !modal.rejectionReason.trim())}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                                        modal.action === 'APPROVE'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                                >
                                    {actionLoading ? (
                                        <><FiLoader className="animate-spin" /> جاري المعالجة...</>
                                    ) : (
                                        modal.action === 'APPROVE' ? '✅ تأكيد الاعتماد' : '❌ تأكيد الرفض'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
