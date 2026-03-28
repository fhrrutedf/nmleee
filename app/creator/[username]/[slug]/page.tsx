'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingCart, FiStar, FiClock, FiUsers, FiCheckCircle } from 'react-icons/fi';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const usernameRaw = params.username as string;
    const slugRaw = params.slug as string;

    // فك التشفير لدعم الروابط العربية
    const username = usernameRaw ? decodeURIComponent(usernameRaw) : '';
    const slug = slugRaw ? decodeURIComponent(slugRaw) : '';

    const [product, setProduct] = useState<any>(null);
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductData();
    }, [username, slug]);

    const trackView = async (pId: string) => {
        if (typeof window !== 'undefined' && pId) {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: pId,
                        referrer: document.referrer || 'direct'
                    }),
                });
            } catch (e) {
                console.error('Tracking Error:', e);
            }
        }
    };

    const fetchProductData = async () => {
        try {
            const res = await fetch(`/api/creators/${username}/products/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
                setCreator(data.creator);
                // تتبع المشاهدة فور التحميل
                if (data.product?.id) trackView(data.product.id);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = () => {
        if (product) {
            router.push(`/checkout?productId=${product.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!product || !creator) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-600 mb-6">المنتج غير موجود</p>
                    <Link href={`/@${username}`} className="btn btn-primary">
                        العودة للمتجر
                    </Link>
                </div>
            </div>
        );
    }

    const brandColor = creator.brandColor || '#0ea5e9';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-accent">الرئيسية</Link>
                        <span>/</span>
                        <Link href={`/@${creator.username}`} className="hover:text-accent">
                            @{creator.username}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.title}</span>
                    </div>
                </div>
            </div>

            {/* Product Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full rounded-2xl shadow-xl"
                            />
                        ) : (
                            <div
                                className="w-full aspect-video rounded-2xl shadow-xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${brandColor}20 0%, ${brandColor}40 100%)`
                                }}
                            >
                                <FiShoppingCart className="text-8xl" style={{ color: brandColor }} />
                            </div>
                        )}

                        {/* Creator Info Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">البائع</h3>
                            <Link
                                href={`/@${creator.username}`}
                                className="flex items-center gap-4 group"
                            >
                                {creator.avatar ? (
                                    <img
                                        src={creator.avatar}
                                        alt={creator.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {creator.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold group-hover:text-accent transition-colors">
                                        {creator.name}
                                    </p>
                                    <p className="text-sm text-gray-500">@{creator.username}</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        {product.category && (
                            <span
                                className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor: `${brandColor}20`,
                                    color: brandColor
                                }}
                            >
                                {product.category}
                            </span>
                        )}

                        <h1 className="text-4xl font-bold leading-tight">{product.title}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        className={`text-lg ${i < Math.floor(product.averageRating || 0)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-600">
                                ({product.reviewCount || 0} تقييم)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-2">
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-slate-400 line-through font-bold">
                                            {product.originalPrice} $
                                        </span>
                                        <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                                            وفر {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-bold tracking-tight" style={{ color: brandColor }}>
                                        {typeof product.price === 'number' ? product.price.toFixed(0) : '0'}
                                    </span>
                                    <span className="text-2xl text-slate-500 font-bold">$</span>
                                </div>
                            </div>
                            
                            {/* Urgency Countdown Placeholder (Simplified for now) */}
                            {product.offerExpiresAt && new Date(product.offerExpiresAt) > new Date() && (
                                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                                        <FiClock className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">عرض لفترة محدودة</p>
                                        <p className="text-sm font-bold text-amber-600">ينتهي العرض قريباً! سارع بالطلب</p>
                                    </div>
                                </div>
                            )}
                            
                            <p className="text-sm text-slate-400 mt-4 font-medium flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                وصول فوري وكامل للمحتوى مدى الحياة
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold mb-3">عن المنتج</h2>
                            <div
                                className="prose max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description?.replace(/&nbsp;/g, ' ') || '' }}
                            />
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold mb-3">المميزات</h2>
                                <ul className="space-y-2">
                                    {product.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA Button */}
                        <button
                            onClick={handlePurchase}
                            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            style={{ backgroundColor: brandColor }}
                        >
                            <FiShoppingCart className="inline ml-2" />
                            اشتري الآن
                        </button>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                            {(product.duration || product.sessions) && (
                                <div className="flex items-center gap-3 text-slate-600 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                        <FiClock className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">المدة / الفصول</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {product.duration || ''} 
                                            {product.sessions ? ` (${product.sessions} جلسة)` : ''}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-600 group">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                    <FiUsers className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">الطلاب</p>
                                    <p className="text-sm font-bold text-slate-800">{product.studentsCount || product.soldCount || 0} طالب</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
