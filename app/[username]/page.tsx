'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiMapPin, FiLink, FiFacebook, FiInstagram, FiTwitter, FiStar, FiShoppingCart, FiClock, FiCheckCircle } from 'react-icons/fi';
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
            setError('لم يتم العثور على هذا المدرب/البائع أو الصفحة غير موجودة.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-bg-light dark:bg-bg-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
                <FiStar className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-primary-charcoal dark:text-gray-200">{error || 'البائع غير موجود'}</h1>
                <Link href="/" className="btn btn-primary mt-4">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pb-24">
            {/* Spectacular Cover Image Area */}
            <div className="h-72 sm:h-96 relative overflow-hidden bg-gradient-to-br from-action-blue to-purple-800">
                {creator.coverImage ? (
                    <img
                        src={creator.coverImage}
                        alt="Cover bg"
                        className="w-full h-full object-cover mix-blend-overlay opacity-60"
                    />
                ) : (
                    <div className="absolute inset-0 pattern-dots text-white/10 dark:text-black/10 mix-blend-overlay"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-light dark:from-bg-dark via-transparent to-black/30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-6 md:p-10 mb-12 animate-fade-in-up border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-right">
                        {/* Avatar */}
                        <div className="w-40 h-40 rounded-3xl border-4 border-white dark:border-card-white shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 -mt-16 sm:-mt-24 rotate-3 hover:rotate-0 transition-transform duration-500 relative group">
                            {creator.avatar ? (
                                <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-action-blue bg-blue-50 dark:bg-blue-900/20">
                                    {creator.name?.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Creator Info */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-primary-charcoal dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                                        {creator.name}
                                        <FiCheckCircle className="text-action-blue text-2xl" title="مدرب موثق" />
                                    </h1>
                                    <p className="text-action-blue font-bold tracking-wider font-mono ltr flex justify-center md:justify-start">@{creator.username}</p>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    {creator.facebook && (
                                        <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                            <FiFacebook size={20} />
                                        </a>
                                    )}
                                    {creator.twitter && (
                                        <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all transform hover:-translate-y-1">
                                            <FiTwitter size={20} />
                                        </a>
                                    )}
                                    {creator.instagram && (
                                        <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                                            <FiInstagram size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {creator.bio && (
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl text-lg">
                                    {creator.bio}
                                </p>
                            )}

                            {creator.website && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium pb-4">
                                    <FiLink className="text-action-blue" />
                                    <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:text-action-blue hover:underline transition-colors block truncate max-w-xs">
                                        {creator.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}

                            {/* Book Consultation Section (If enabled) */}
                            {creator.consultationPrice !== undefined && (
                                <div className="mt-6 p-6 sm:p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-bg-dark rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                                            <FiClock className="text-xl" />
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <span className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">جلسة استشارية خاصة</span>
                                            <span className="font-black text-xl text-primary-charcoal dark:text-white">
                                                {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'متاحة مجاناً للطلاب'}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/${creator.username}/book`} className="w-full sm:w-auto btn btn-primary px-8 shadow-xl shadow-action-blue/20 hover:scale-105 transition-transform text-lg">
                                        حجز موعد الآن
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-primary-charcoal dark:text-white flex items-center gap-3">
                                أحدث المنتجات والدورات
                                <span className="bg-action-blue text-white text-sm font-bold px-3 py-1 rounded-full">{products.length}</span>
                            </h2>
                            <p className="text-text-muted font-medium mt-2">استكشف خبرات ومنتجات <strong>{creator.name}</strong> المتاحة للاقتناء.</p>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm p-16 text-center border border-gray-100 dark:border-gray-800">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiStar className="text-4xl text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-2">قريباً جداً!</h3>
                            <p className="text-gray-500 font-medium">هذا المبدع يعمل حالياً على تجهيز منتجاته ودوراته. عد قريباً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <Link key={product.id} href={`/product/${product.id}`} className="group relative block h-full">
                                    <div className="absolute inset-0 bg-gradient-to-r from-action-blue to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                                    <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                    <FiShoppingCart className="text-5xl" />
                                                </div>
                                            )}

                                            {product.isFree || product.price === 0 ? (
                                                <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                                                    مجاني بالكامل
                                                </div>
                                            ) : product.category && (
                                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                                                    {product.category === 'courses' ? 'دورة' : 'رقمي'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-lg text-primary-charcoal dark:text-white line-clamp-2 group-hover:text-action-blue transition-colors flex-1 ml-2 leading-snug">
                                                    {product.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-1 mb-4">
                                                <FiStar className={product.averageRating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                                    {product.averageRating > 0 ? product.averageRating.toFixed(1) : 'جديد'}
                                                    {product.reviewCount > 0 && <span className="text-gray-400 text-xs mr-1">({product.reviewCount})</span>}
                                                </span>
                                            </div>

                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                                                {product.description?.replace(/<[^>]*>?/gm, '')}
                                            </p>

                                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <span className="font-black text-xl text-action-blue drop-shadow-sm">
                                                    {product.price > 0 ? `${product.price.toFixed(0)} ج.م` : 'مجاني'}
                                                </span>
                                                <span className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-action-blue group-hover:text-white transition-colors">
                                                    <FiShoppingCart />
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
