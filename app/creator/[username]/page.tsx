'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingCart, FiStar, FiFacebook, FiInstagram, FiTwitter, FiGlobe } from 'react-icons/fi';

export default function CreatorStorePage() {
    const params = useParams();
    const username = params.username as string;

    const [creator, setCreator] = useState<any>(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreatorData();
    }, [username]);

    const fetchCreatorData = async () => {
        try {
            const res = await fetch(`/api/creators/${username}`);
            if (res.ok) {
                const data = await res.json();
                setCreator(data.creator);
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-600 mb-6">المتجر غير موجود</p>
                    <Link href="/" className="btn btn-primary">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        );
    }

    const brandColor = creator.brandColor || '#0ea5e9';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Creator Header */}
            <div className="relative">
                {/* Cover Image */}
                {creator.coverImage ? (
                    <div className="w-full h-64 md:h-80">
                        <img
                            src={creator.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div
                        className="w-full h-64 md:h-80"
                        style={{
                            background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`
                        }}
                    />
                )}

                {/* Creator Info */}
                <div className="max-w-5xl mx-auto px-4 -mt-20 relative">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {creator.avatar ? (
                                    <img
                                        src={creator.avatar}
                                        alt={creator.name}
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {creator.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-right">
                                <h1 className="text-3xl font-bold mb-2">{creator.name}</h1>
                                <p className="text-gray-600 mb-4">@{creator.username}</p>

                                {creator.bio && (
                                    <p className="text-gray-700 leading-relaxed mb-4 max-w-2xl">
                                        {creator.bio}
                                    </p>
                                )}

                                {/* Social Links */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {creator.website && (
                                        <a
                                            href={creator.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <FiGlobe />
                                            <span>الموقع</span>
                                        </a>
                                    )}
                                    {creator.facebook && (
                                        <a
                                            href={creator.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                        >
                                            <FiFacebook />
                                        </a>
                                    )}
                                    {creator.instagram && (
                                        <a
                                            href={creator.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors"
                                        >
                                            <FiInstagram />
                                        </a>
                                    )}
                                    {creator.twitter && (
                                        <a
                                            href={creator.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors"
                                        >
                                            <FiTwitter />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-8">المنتجات والدورات</h2>

                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد منتجات حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: any) => (
                            <Link
                                key={product.id}
                                href={`/@${creator.username}/${product.slug}`}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-48 flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${brandColor}20 0%, ${brandColor}40 100%)`
                                        }}
                                    >
                                        <FiShoppingCart className="text-5xl" style={{ color: brandColor }} />
                                    </div>
                                )}

                                <div className="p-6">
                                    {product.category && (
                                        <span
                                            className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                                            style={{
                                                backgroundColor: `${brandColor}20`,
                                                color: brandColor
                                            }}
                                        >
                                            {product.category}
                                        </span>
                                    )}

                                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {product.description}
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
                                        <span className="text-2xl font-bold" style={{ color: brandColor }}>
                                            {product.price.toFixed(0)} ج.م
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Minimal Branding */}
            <div className="text-center py-8 text-gray-500 text-sm border-t">
                <p>Powered by <span className="font-bold">تمكين</span></p>
            </div>
        </div>
    );
}
