'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBook, FiDownload, FiClock } from 'react-icons/fi';

interface Purchase {
    id: string;
    type: 'course' | 'product';
    title: string;
    image?: string;
    slug?: string;
    progress?: number;
    purchasedAt: string;
}

export default function MyCoursesPage() {
    const { data: session } = useSession();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'courses' | 'products'>('all');

    useEffect(() => {
        if (session) {
            fetchPurchases();
        }
    }, [session]);

    const fetchPurchases = async () => {
        try {
            const response = await fetch('/api/my-purchases');
            if (response.ok) {
                const data = await response.json();
                setPurchases(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPurchases = purchases.filter((p) => {
        if (filter === 'all') return true;
        if (filter === 'courses') return p.type === 'course';
        if (filter === 'products') return p.type === 'product';
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">يجب تسجيل الدخول أولاً</p>
                <Link href="/login" className="text-indigo-600 hover:underline mt-2 inline-block">
                    تسجيل الدخول
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">مشترياتي</h1>

                {/* Filters */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        الكل ({purchases.length})
                    </button>
                    <button
                        onClick={() => setFilter('courses')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'courses'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        الكورسات ({purchases.filter((p) => p.type === 'course').length})
                    </button>
                    <button
                        onClick={() => setFilter('products')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'products'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        المنتجات ({purchases.filter((p) => p.type === 'product').length})
                    </button>
                </div>

                {/* Grid */}
                {filteredPurchases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <FiBook size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">لا توجد مشتريات بعد</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            تصفح المنتجات
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPurchases.map((purchase) => (
                            <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {purchase.image && (
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={purchase.image}
                                            alt={purchase.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {purchase.type === 'course' ? (
                                            <FiBook className="text-indigo-600" />
                                        ) : (
                                            <FiDownload className="text-green-600" />
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {purchase.type === 'course' ? 'كورس' : 'منتج'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                        {purchase.title}
                                    </h3>

                                    {purchase.type === 'course' && purchase.progress !== undefined && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">التقدم</span>
                                                <span className="font-medium text-indigo-600">{purchase.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${purchase.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <FiClock size={14} />
                                        <span>
                                            تم الشراء في {new Date(purchase.purchasedAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>

                                    <Link
                                        href={
                                            purchase.type === 'course'
                                                ? `/learn/${purchase.slug || purchase.id}`
                                                : `/download/${purchase.id}`
                                        }
                                        className="block w-full py-2 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        {purchase.type === 'course' ? 'متابعة التعلم' : 'تحميل'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
