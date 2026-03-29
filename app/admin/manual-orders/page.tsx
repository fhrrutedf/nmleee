'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiX, FiImage, FiClock, FiCheckCircle, FiXCircle, FiFilter, FiSearch, FiEye } from 'react-icons/fi';

import { ReactNode } from 'react';

interface ManualOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentProvider: string;
    paymentCountry: string;
    senderPhone: string;
    transactionRef: string;
    paymentProof: string;
    paymentNotes: string;
    createdAt: string;
    items: Array<{
        product?: { title: string };
        course?: { title: string };
    }>;
    seller: {
        name: string;
        email: string;
    };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: ReactNode }> = {
    PENDING: { label: 'قيد الانتظار', bg: 'bg-blue-100 text-blue-800', icon: <FiClock size={14} /> },
    PAID: { label: 'مقبول ✓', bg: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle size={14} /> },
    COMPLETED: { label: 'مقبول ✓', bg: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle size={14} /> },
    REJECTED: { label: 'مرفوض ✗', bg: 'bg-red-100 text-red-800', icon: <FiXCircle size={14} /> },
    CANCELLED: { label: 'ملغي', bg: 'bg-gray-100 text-gray-600', icon: <FiXCircle size={14} /> },
};

export default function ManualOrdersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<ManualOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<ManualOrder | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [proofImage, setProofImage] = useState<string | null>(null);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [session, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const response = await fetch(`/api/admin/manual-orders?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId: string) => {
        if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;
        try {
            const response = await fetch(`/api/admin/manual-orders/${orderId}/approve`, {
                method: 'POST',
            });
            if (response.ok) {
                alert('✅ تمت الموافقة على الطلب');
                fetchOrders();
                setSelectedOrder(null);
            } else {
                alert('❌ حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ حدث خطأ');
        }
    };

    const handleReject = async (orderId: string) => {
        if (!rejectionReason.trim()) {
            alert('يرجى إدخال سبب الرفض');
            return;
        }
        try {
            const response = await fetch(`/api/admin/manual-orders/${orderId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectionReason }),
            });
            if (response.ok) {
                alert('✅ تم رفض الطلب');
                fetchOrders();
                setSelectedOrder(null);
                setRejectionReason('');
            } else {
                alert('❌ حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ حدث خطأ');
        }
    };

    const getStatusStyle = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

    // Count by status
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const approvedCount = orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED').length;
    const rejectedCount = orders.filter(o => o.status === 'REJECTED').length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 الطلبات اليدوية</h1>
                    <p className="text-gray-500 mt-1">إدارة ومراجعة طلبات الدفع اليدوية</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-lg shadow-emerald-600/20">
                        <p className="text-xs text-gray-400 font-bold uppercase">الإجمالي</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-100 dark:border-amber-900/30 shadow-lg shadow-emerald-600/20">
                        <p className="text-xs text-emerald-600-500 font-bold uppercase">قيد الانتظار</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{pendingCount}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-lg shadow-emerald-600/20">
                        <p className="text-xs text-emerald-600-500 font-bold uppercase">مقبول</p>
                        <p className="text-2xl font-bold text-emerald-600-600 mt-1">{approvedCount}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-100 dark:border-red-900/30 shadow-lg shadow-emerald-600/20">
                        <p className="text-xs text-red-500 font-bold uppercase">مرفوض</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 mb-6 shadow-lg shadow-emerald-600/20">
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { value: 'all', label: 'الكل' },
                            { value: 'PENDING', label: '⏳ قيد الانتظار' },
                            { value: 'PAID', label: '✅ مقبول' },
                            { value: 'REJECTED', label: '❌ مرفوض' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    statusFilter === tab.value
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-ink"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-400 text-lg">لا توجد طلبات</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const st = getStatusStyle(order.status);
                            const isPending = order.status === 'PENDING';
                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl border shadow-lg shadow-emerald-600/20 overflow-hidden transition-all ${
                                        isPending
                                            ? 'border-amber-200 dark:border-amber-900/40'
                                            : 'border-gray-100 dark:border-gray-700'
                                    }`}
                                >
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm font-bold text-emerald-600">{order.orderNumber}</span>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 ${st.bg}`}>
                                                {st.icon} {st.label}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {/* Customer Info */}
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase">المشتري</h4>
                                                <p className="font-bold text-gray-900 dark:text-white">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                                {order.senderPhone && (
                                                    <p className="text-xs text-gray-500 font-mono" dir="ltr">{order.senderPhone}</p>
                                                )}
                                            </div>

                                            {/* Payment Info */}
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase">تفاصيل الدفع</h4>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">{order.paymentProvider} — {order.paymentCountry}</p>
                                                {order.transactionRef && (
                                                    <p className="text-xs font-mono text-gray-500">رقم العملية: {order.transactionRef}</p>
                                                )}
                                                {order.paymentNotes && (
                                                    <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mt-1">{order.paymentNotes}</p>
                                                )}
                                            </div>

                                            {/* Products + Proof */}
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase">المنتجات</h4>
                                                {order.items.map((item, i) => (
                                                    <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                                        • {item.product?.title || item.course?.title || 'منتج'}
                                                    </p>
                                                ))}
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mt-3">البائع</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{order.seller?.name || '—'}</p>

                                                {/* Payment Proof */}
                                                {order.paymentProof && (
                                                    <button
                                                        onClick={() => setProofImage(order.paymentProof)}
                                                        className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-bold hover:underline"
                                                    >
                                                        <FiEye size={14} /> عرض إيصال الدفع
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons — Only for PENDING */}
                                        {isPending && (
                                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(order.id)}
                                                    className="flex-1 px-4 py-2.5 bg-emerald-600-600 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-600/20"
                                                >
                                                    <FiCheck /> موافقة
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setRejectionReason(''); }}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-600/20"
                                                >
                                                    <FiX /> رفض
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-lg shadow-emerald-600/20" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            رفض الطلب {selectedOrder.orderNumber}
                        </h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب سبب الرفض..."
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500 mb-4 outline-none"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleReject(selectedOrder.id)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-sm"
                            >
                                تأكيد الرفض
                            </button>
                            <button
                                onClick={() => { setSelectedOrder(null); setRejectionReason(''); }}
                                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 font-bold text-sm"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Image Modal */}
            {proofImage && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setProofImage(null)}>
                    <div className="relative max-w-2xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setProofImage(null)}
                            className="absolute top-3 left-3 w-8 h-8 bg-black/50 text-white rounded-xl flex items-center justify-center z-10"
                        >
                            <FiX size={16} />
                        </button>
                        <img src={proofImage} alt="إيصال" className="max-w-full max-h-[80vh] object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}
