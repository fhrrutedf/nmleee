'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiUsers, FiStar } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    slug?: string;
    price: number;
    originalPrice?: number;
    image?: string;
    averageRating?: number;
    reviewCount?: number;
    soldCount?: number;
    user: {
        username: string;
        name: string;
    };
}

interface SmartRecommendationsProps {
    currentProductId: string;
    sellerId: string;
    category?: string;
    type: 'related' | 'bestsellers' | 'frequently_bought' | 'recently_viewed';
    maxItems?: number;
    brandColor?: string;
}

export default function SmartRecommendations({
    currentProductId,
    sellerId,
    category,
    type,
    maxItems = 4,
    brandColor = '#10B981'
}: SmartRecommendationsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [currentProductId, type]);

    const fetchRecommendations = async () => {
        try {
            const params = new URLSearchParams({
                currentProductId,
                sellerId,
                type,
                max: maxItems.toString()
            });
            if (category) params.append('category', category);

            const response = await fetch(`/api/recommendations?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'related':
                return { text: 'منتجات مشابهة', icon: FiZap };
            case 'bestsellers':
                return { text: 'الأكثر مبيعاً', icon: FiTrendingUp };
            case 'frequently_bought':
                return { text: 'يشترى معاً بكثرة', icon: FiUsers };
            case 'recently_viewed':
                return { text: 'شاهدته مؤخراً', icon: FiStar };
            default:
                return { text: 'منتجات مقترحة', icon: FiZap };
        }
    };

    const title = getTitle();
    const Icon = title.icon;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Icon className="text-gray-500" />
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div 
                    className="p-2 rounded-lg"
                    style={{ background: `${brandColor}20` }}
                >
                    <Icon size={18} style={{ color: brandColor }} />
                </div>
                <h3 className="text-lg font-bold text-white">{title.text}</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link 
                            href={`/${product.user.username}/products/${product.slug || product.id}`}
                            className="group block bg-[#0A0A0A] rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden bg-white/5">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FiZap className="text-gray-600" size={32} />
                                    </div>
                                )}
                                
                                {/* Discount Badge */}
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                        {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3 space-y-2">
                                <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                    {product.title}
                                </h4>

                                {/* Rating */}
                                {product.averageRating && product.averageRating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
                                        <span className="text-xs text-gray-400">
                                            {product.averageRating.toFixed(1)} ({product.reviewCount})
                                        </span>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold" style={{ color: brandColor }}>
                                        ${product.price}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-xs text-gray-500 line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Sales count for bestsellers */}
                                {type === 'bestsellers' && product.soldCount && product.soldCount > 0 && (
                                    <p className="text-xs text-gray-500">
                                        {product.soldCount} مبيع
                                    </p>
                                )}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
