'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiX, FiImage } from 'react-icons/fi';
import Image from 'next/image';

interface ManualOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
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

export default function ManualOrdersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<ManualOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<ManualOrder | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [session]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/manual-orders');
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">الطلبات اليدوية المعلقة</h1>
                    <p className="text-gray-600 mt-2">راجع وافق على الطلبات اليدوية</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500 text-lg">لا توجد طلبات معلقة</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Order Info */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                                            {order.orderNumber}
                                        </h3>

                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">العميل:</span>
                                                <span className="font-medium ml-2">{order.customerName}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">البريد:</span>
                                                <span className="ml-2">{order.customerEmail}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">المبلغ:</span>
                                                <span className="font-bold text-green-600 ml-2">
                                                    ${order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">طريقة الدفع:</span>
                                                <span className="ml-2">{order.paymentProvider}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">رقم المرسل:</span>
                                                <span className="ml-2 font-mono">{order.senderPhone}</span>
                                            </div>
                                            {order.transactionRef && (
                                                <div>
                                                    <span className="text-gray-600">رقم العملية:</span>
                                                    <span className="ml-2 font-mono">{order.transactionRef}</span>
                                                </div>
                                            )}
                                            {order.paymentNotes && (
                                                <div>
                                                    <span className="text-gray-600">ملاحظات:</span>
                                                    <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">
                                                        {order.paymentNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment Proof */}
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">
                                            <FiImage className="inline ml-1" />
                                            إثبات الدفع
                                        </h4>
                                        {order.paymentProof ? (
                                            <a
                                                href={order.paymentProof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
                                            >
                                                <div className="text-center text-sm text-gray-600">
                                                    انقر لعرض الصورة
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="bg-red-50 text-red-600 rounded-lg p-4 text-sm">
                                                ⚠️ لم يتم رفع إثبات
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-4">
                                    <button
                                        onClick={() => handleApprove(order.id)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiCheck />
                                        موافقة
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiX />
                                        رفض
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rejection Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                رفض الطلب {selectedOrder.orderNumber}
                            </h3>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="اكتب سبب الرفض..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
                                rows={4}
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleReject(selectedOrder.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    تأكيد الرفض
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
