'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiGet, apiDelete, handleApiError } from '@/lib/safe-fetch';

export default function ProductsPage() {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await apiGet('/api/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            await apiDelete(`/api/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', handleApiError(error));
            alert('فشل حذف المنتج: ' + handleApiError(error));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">المنتجات الرقمية</h1>
                    <p className="text-text-muted mt-1">إدارة جميع منتجاتك الرقمية من مكان واحد</p>
                </div>
                <Link href="/dashboard/products/new" className="btn btn-primary shadow-lg hover:shadow-blue-500/25">
                    <FiPlus className="ml-2 text-xl" />
                    <span>إضافة منتج جديد</span>
                </Link>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="card text-center py-16 px-6 border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiPackage className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا توجد منتجات حتى الآن</h3>
                    <p className="text-text-muted mb-8 max-w-md mx-auto">
                        ابدأ رحلتك في التجارة الإلكترونية بإضافة أول منتج رقمي لك. يمكنك بيع كتب إلكترونية، قوالب، دورات، والمزيد.
                    </p>
                    <Link href="/dashboard/products/new" className="btn btn-primary px-8">
                        إضافة أول منتج
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-card-white dark:bg-card-white border border-gray-100 dark:border-gray-800"
                        >
                            <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <FiPackage className="text-5xl opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${product.isActive
                                        ? 'bg-white/90 text-green-600 backdrop-blur-sm'
                                        : 'bg-gray-100/90 text-gray-600 backdrop-blur-sm'
                                        }`}>
                                        {product.isActive ? 'نشط' : 'مسودة'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-primary-charcoal dark:text-white mb-2 line-clamp-1 group-hover:text-action-blue transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-text-muted text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {product.description || 'لا يوجد وصف متاح'}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-primary-charcoal dark:text-white">
                                        {product.price} <span className="text-sm font-normal text-text-muted">ج.م</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    <Link
                                        href={`/@${(session?.user as any)?.username}/${product.slug || product.id}`}
                                        target="_blank"
                                        className="col-span-1 btn btn-secondary p-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 border-none"
                                        title="عرض الصفحة"
                                    >
                                        <FiEye className="text-lg" />
                                    </Link>
                                    <Link
                                        href={`/dashboard/products/edit/${product.id}`}
                                        className="col-span-2 btn btn-outline py-2 text-sm flex items-center justify-center gap-2"
                                    >
                                        <FiEdit2 /> تعديل
                                    </Link>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="col-span-1 btn p-0 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <FiTrash2 className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
