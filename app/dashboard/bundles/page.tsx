'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiPackage, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function BundlesPage() {
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBundles();
    }, []);

    const fetchBundles = async () => {
        try {
            const res = await fetch('/api/bundles');
            if (res.ok) {
                const data = await res.json();
                setBundles(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white">الباقات والحزم</h1>
                    <p className="text-text-muted mt-1">اجمع أكثر من منتج في باقة واحدة لزيادة المبيعات</p>
                </div>
                <Link href="/dashboard/bundles/new" className="btn btn-primary flex items-center gap-2">
                    <FiPlus />
                    <span>إنشاء باقة جديدة</span>
                </Link>
            </div>

            {/* List */}
            {bundles && bundles.length === 0 ? (
                <div className="bg-white dark:bg-card-white rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="text-2xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا توجد باقات بعد</h3>
                    <p className="text-text-muted mb-6">قم بإنشاء وتجميع باقات خاصة بمنتجاتك لتوفير أسعار مميزة لعملائك</p>
                    <Link href="/dashboard/bundles/new" className="btn btn-primary inline-flex">
                        أضف أول باقة
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bundles?.map((bundle) => (
                        <div key={bundle.id} className="bg-white dark:bg-card-white rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-gray-100 relative">
                                {bundle.image ? (
                                    <img src={bundle.image} alt={bundle.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiPackage className="text-4xl text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-action-blue text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <FiPackage />
                                    <span>{bundle.products?.length || 0} منتجات</span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{bundle.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{bundle.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xl font-black text-primary-charcoal dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                        {bundle.price} ج.م
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <FiTag />
                                        <span>{bundle._count?.orderItems || 0} مبيعة</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button className="flex-1 btn btn-outline flex items-center justify-center gap-2 text-sm py-2 px-3">
                                        <FiEdit2 />
                                        <span>تعديل</span>
                                    </button>
                                    <button className="btn btn-outline text-red-500 hover:bg-red-50 hover:border-red-200 py-2 px-3">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
