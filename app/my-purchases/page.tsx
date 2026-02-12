'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiDownload, FiClock, FiPackage, FiLock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function MyPurchasesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/my-purchases');
        } else if (status === 'authenticated') {
            fetchPurchases();
        }
    }, [status, router]);

    const fetchPurchases = async () => {
        try {
            const data = await apiGet('/api/orders/my-purchases');
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (productId: string, title: string) => {
        try {
            const res = await fetch(`/api/products/${productId}/download`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('حدث خطأ في التحميل');
            }
        } catch (error) {
            console.error('Error downloading:', error);
            alert('حدث خطأ في التحميل');
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">مشترياتي</h1>
                    <p className="text-gray-600">جميع المنتجات والدورات التي اشتريتها</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">إجمالي المشتريات</p>
                                <p className="text-3xl font-bold mt-1">{purchases.length}</p>
                            </div>
                            <FiPackage className="text-4xl text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">متاحة للتحميل</p>
                                <p className="text-3xl font-bold mt-1">{purchases.filter((p: any) => p.status === 'completed').length}</p>
                            </div>
                            <FiCheckCircle className="text-4xl text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">إجمالي الإنفاق</p>
                                <p className="text-3xl font-bold mt-1">
                                    {purchases.reduce((sum: number, p: any) => sum + p.total, 0).toFixed(0)} ج.م
                                </p>
                            </div>
                            <FiClock className="text-4xl text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Purchases List */}
                {purchases.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">لا توجد مشتريات بعد</h3>
                        <p className="text-gray-600 mb-6">ابدأ بتصفح منتجاتنا الرائعة!</p>
                        <Link href="/" className="btn btn-primary">
                            تصفح المنتجات
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {purchases.map((purchase: any) => (
                            <div key={purchase.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">طلب #{purchase.id.slice(0, 8)}</h3>
                                        <p className="text-gray-600 text-sm">
                                            {new Date(purchase.createdAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-left">
                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${purchase.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : purchase.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {purchase.status === 'completed' ? 'مكتمل' :
                                                purchase.status === 'pending' ? 'قيد المعالجة' : 'ملغي'}
                                        </span>
                                        <p className="text-2xl font-bold text-primary-600 mt-2">
                                            {purchase.total.toFixed(2)} ج.م
                                        </p>
                                    </div>
                                </div>

                                {/* Products in Order */}
                                <div className="space-y-3">
                                    {purchase.orderItems?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.title}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                                                    <FiPackage className="text-3xl text-primary-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    {item.product?.title || 'منتج'}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {item.product?.category || 'منتج رقمي'}
                                                </p>
                                            </div>
                                            <div className="text-left">
                                                {purchase.status === 'completed' ? (
                                                    <button
                                                        onClick={() => downloadFile(item.productId, item.product?.title || 'product')}
                                                        className="btn btn-primary flex items-center gap-2"
                                                    >
                                                        <FiDownload />
                                                        <span>تحميل</span>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <FiLock />
                                                        <span className="text-sm">غير متاح</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Actions */}
                                <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                                    <Link
                                        href={`/order/${purchase.id}`}
                                        className="btn btn-sm btn-outline"
                                    >
                                        عرض التفاصيل
                                    </Link>
                                    {purchase.status === 'completed' && (
                                        <button className="btn btn-sm btn-outline">
                                            طلب دعم
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-2">هل تحتاج مساعدة؟</h3>
                    <p className="text-blue-800 mb-4">
                        إذا واجهت أي مشكلة في التحميل أو الوصول لمشترياتك، فريق الدعم جاهز لمساعدتك
                    </p>
                    <Link href="/support" className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                        تواصل مع الدعم
                    </Link>
                </div>
            </div>
        </div>
    );
}
