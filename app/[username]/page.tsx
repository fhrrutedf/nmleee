'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiMapPin, FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet } from '@/lib/safe-fetch';

export default function CreatorProfilePage() {
    const params = useParams();
    const [creator, setCreator] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.username) {
            fetchCreator();
        }
    }, [params.username]);

    const fetchCreator = async () => {
        try {
            const username = Array.isArray(params.username) ? params.username[0] : params.username;
            const data = await apiGet(`/api/creators/${username}`);
            setCreator(data.creator);
            setProducts(data.products || []);
        } catch (err) {
            console.error(err);
            setError('لم يتم العثور على هذا البائع أو الصفحة غير موجودة.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">{error || 'البائع غير موجود'}</h1>
                <Link href="/" className="btn btn-primary">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Cover Image */}
            <div className="h-64 relative overflow-hidden bg-gray-800">
                {creator.coverImage ? (
                    <img
                        src={creator.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary-600 to-purple-600 opacity-80"></div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            {creator.avatar ? (
                                <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary-600 bg-primary-50">
                                    {creator.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                                    <p className="text-gray-500 font-medium ltr">@{creator.username}</p>
                                </div>
                                <div className="flex gap-3">
                                    {creator.facebook && (
                                        <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                            <FiFacebook size={20} />
                                        </a>
                                    )}
                                    {creator.twitter && (
                                        <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors">
                                            <FiTwitter size={20} />
                                        </a>
                                    )}
                                    {creator.instagram && (
                                        <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                            <FiInstagram size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {creator.bio && (
                                <p className="text-gray-700 leading-relaxed max-w-3xl mb-4 text-lg">
                                    {creator.bio}
                                </p>
                            )}

                            {creator.website && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                    <FiLink className="text-primary-500" />
                                    <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 hover:underline transition-colors">
                                        {creator.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}

                            {/* زر حجز موعد */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-gray-700">
                                    <span className="text-sm">سعر الاستشارة: </span>
                                    <span className="font-bold text-primary-600">
                                        {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'مجانية'}
                                    </span>
                                </div>
                                <Link href={`/${creator.username}/book`} className="btn btn-primary px-6 py-2">
                                    احجز استشارة الآن
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-1 bg-primary-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">المنتجات والدورات ({products.length})</h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                            <FiShoppingCart className="mx-auto text-5xl text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات بعد</h3>
                            <p className="text-gray-500">هذا البائع لم يقم بإضافة أي منتجات حتى الآن.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link key={product.id} href={`/product/${product.id}`} className="group block h-full">
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border border-gray-100 flex flex-col">
                                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <FiShoppingCart className="text-4xl text-gray-300" />
                                                </div>
                                            )}
                                            {product.price === 0 && (
                                                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                    مجاني
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold px-2 py-1 bg-primary-50 text-primary-600 rounded">
                                                    {product.category || 'عام'}
                                                </span>
                                                {product.averageRating > 0 && (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                                                        <FiStar className="fill-current" />
                                                        <span>{product.averageRating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                                {product.title}
                                            </h3>

                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                                                {product.description}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                                <span className="font-bold text-lg text-primary-700">
                                                    {product.price > 0 ? `${product.price.toFixed(0)} ج.م` : 'مجاني'}
                                                </span>
                                                <span className="text-sm font-medium text-primary-600 group-hover:underline">
                                                    عرض التفاصيل
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
