'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiStar, FiSearch, FiFilter, FiPackage } from 'react-icons/fi';
import { apiGet, handleApiError } from '@/lib/safe-fetch';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');

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

    const filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory && product.isActive;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold gradient-text mb-4">جميع المنتجات</h1>
                        <p className="text-xl text-gray-600">اكتشف منتجاتنا الرقمية المميزة</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-4">جميع المنتجات</h1>
                    <p className="text-xl text-gray-600">اكتشف منتجاتنا الرقمية المميزة</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ابحث عن منتج..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pr-10 w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input pr-10 w-full"
                            >
                                <option value="all">جميع الفئات</option>
                                <option value="برمجة">برمجة</option>
                                <option value="تصميم">تصميم</option>
                                <option value="تسويق">تسويق</option>
                                <option value="قوالب">قوالب</option>
                                <option value="رسوميات">رسوميات</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <EmptyState
                        icon={<FiPackage />}
                        title="لا توجد منتجات"
                        description={searchTerm || category !== 'all'
                            ? 'لم نجد منتجات تطابق بحثك. جرب كلمات مفتاحية أخرى.'
                            : 'لا توجد منتجات متاحة حالياً. تحقق مرة أخرى قريباً!'}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product: any) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow group"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                        <FiShoppingCart className="text-5xl text-primary-400" />
                                    </div>
                                )}

                                <div className="p-6">
                                    {product.category && (
                                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium mb-2">
                                            {product.category}
                                        </span>
                                    )}

                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {product.description ? product.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : ''}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar
                                                    key={i}
                                                    className={`text-sm ${i < Math.floor(product.averageRating || 0)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-bold text-primary-600">
                                            {product.price.toFixed(0)} ج.م
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
