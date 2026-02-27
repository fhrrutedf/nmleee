'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiEye, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet, apiDelete, handleApiError } from '@/lib/safe-fetch';
import showToast from '@/lib/toast';

export default function ProductsPage() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await apiGet('/api/products');
            setProducts(data);
        } catch (error) {
            console.error('Error:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        try {
            await apiDelete(`/api/products/${id}`);
            showToast.success('تم حذف المنتج');
            fetchProducts();
        } catch (error) {
            showToast.error('فشل الحذف: ' + handleApiError(error));
        }
    };

    const filtered = products.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10">

            {/* رأس الصفحة */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white">المنتجات الرقمية</h1>
                    <p className="text-sm text-text-muted mt-1">إدارة جميع منتجاتك من مكان واحد</p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="btn btn-primary gap-2 w-full sm:w-auto justify-center"
                >
                    <FiPlus className="text-lg" />
                    إضافة منتج جديد
                </Link>
            </div>

            {/* بحث */}
            {products.length > 0 && (
                <div className="relative">
                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input pr-10 text-sm"
                    />
                </div>
            )}

            {/* حالة التحميل */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* لا يوجد منتجات */}
            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5">
                        <FiPackage className="text-4xl text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا توجد منتجات بعد</h2>
                    <p className="text-text-muted mb-6 max-w-sm">ابدأ ببيع دوراتك أو كتبك أو قوالبك الرقمية</p>
                    <Link href="/dashboard/products/new" className="btn btn-primary">
                        <FiPlus /> أضف أول منتج
                    </Link>
                </div>
            )}

            {/* شبكة المنتجات */}
            {!loading && filtered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((product: any) => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-card-white rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* صورة المنتج */}
                            <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <FiPackage className="text-5xl text-gray-300" />
                                    </div>
                                )}
                                {/* شارة الحالة */}
                                <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {product.isActive ? '● نشط' : '○ مخفي'}
                                </span>
                            </div>

                            {/* تفاصيل */}
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-primary-charcoal dark:text-white mb-1 line-clamp-1">{product.title}</h3>
                                <p className="text-xs text-text-muted line-clamp-2 mb-3 flex-1">
                                    {product.description || 'بدون وصف'}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xl font-black text-action-blue">
                                        {product.isFree ? 'مجاني' : `${product.price} ج.م`}
                                    </span>
                                    <span className="text-xs text-gray-400">{product.soldCount || 0} مبيعة</span>
                                </div>

                                {/* أزرار */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <Link
                                        href={`/dashboard/products/edit/${product.id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-action-blue hover:text-white text-gray-700 dark:text-gray-300 transition-colors text-sm font-semibold"
                                    >
                                        <FiEdit2 size={14} /> تعديل
                                    </Link>
                                    <Link
                                        href={`/@${(session?.user as any)?.username}/${product.slug || product.id}`}
                                        target="_blank"
                                        className="flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 hover:text-action-blue text-gray-500 transition-colors"
                                        title="معاينة"
                                    >
                                        <FiEye size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-colors"
                                        title="حذف"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* لا نتائج بحث */}
            {!loading && products.length > 0 && filtered.length === 0 && (
                <div className="text-center py-16 text-text-muted">
                    <FiSearch className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>لا توجد نتائج لـ "{search}"</p>
                </div>
            )}
        </div>
    );
}
