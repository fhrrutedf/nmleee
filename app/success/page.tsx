'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiBook } from 'react-icons/fi';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            fetchOrder();
            // Clear cart
            localStorage.removeItem('cart');
            // Clear affiliate ref
            localStorage.removeItem('affiliateRef');
        }
    }, [sessionId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/verify?session_id=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-green-600 text-white p-8 text-center">
                        <FiCheckCircle size={64} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-2">تم الشراء بنجاح! 🎉</h1>
                        <p className="text-green-100">
                            شكراً لك! تم استلام طلبك وسيتم معالجته قريباً
                        </p>
                    </div>

                    {/* Order Details */}
                    <div className="p-8">
                        {order && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الطلب</h2>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">رقم الطلب:</span>
                                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">البريد الإلكتروني:</span>
                                            <span className="font-medium text-gray-900">{order.customerEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">المبلغ الإجمالي:</span>
                                            <span className="font-bold text-indigo-600 text-lg">
                                                {order.totalAmount.toFixed(2)} ج.م
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-900 mb-3">المنتجات المشتراة:</h3>
                                    <div className="space-y-2">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                {item.type === 'course' ? (
                                                    <FiBook className="text-indigo-600" size={24} />
                                                ) : (
                                                    <FiPackage className="text-indigo-600" size={24} />
                                                )}
                                                <span className="flex-1 font-medium text-gray-900">
                                                    {item.title || 'عنصر'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-900">
                                📧 تم إرسال إيميل تأكيد إلى{' '}
                                <span className="font-medium">{order?.customerEmail}</span> مع تفاصيل الطلب
                                وروابط الوصول للمحتوى.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                href="/my-courses"
                                className="block w-full py-3 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                ابدأ التعلم الآن
                            </Link>
                            <Link
                                href="/"
                                className="block w-full py-3 border-2 border-gray-300 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                العودة للرئيسية
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
