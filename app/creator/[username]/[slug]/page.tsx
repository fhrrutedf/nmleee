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

    const fetchProductData = async () => {
        try {
            const res = await fetch(`/api/creators/${username}/products/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
                setCreator(data.creator);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
                        <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
                        <span>/</span>
                        <Link href={`/@${creator.username}`} className="hover:text-primary-600">
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
                                    <p className="font-bold group-hover:text-primary-600 transition-colors">
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
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-bold" style={{ color: brandColor }}>
                                    {typeof product.price === 'number' ? product.price.toFixed(0) : '0'}
                                </span>
                                <span className="text-2xl text-gray-600">ج.م</span>
                            </div>
                            <p className="text-sm text-gray-500">شامل الضريبة</p>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold mb-3">عن المنتج</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
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
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                            {product.duration && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiClock />
                                    <span className="text-sm">{product.duration}</span>
                                </div>
                            )}
                            {product.studentsCount && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiUsers />
                                    <span className="text-sm">{product.studentsCount} طالب</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
