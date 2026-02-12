'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { FiShoppingCart, FiCheck, FiStar, FiUsers, FiClock, FiVideo } from 'react-icons/fi';

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
    features?: string[];
    averageRating?: number;
    reviewCount?: number;
    user: {
        name: string;
        avatar?: string;
    };
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, items } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInCart, setIsInCart] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [params.slug]);

    useEffect(() => {
        if (product) {
            setIsInCart(items.some((item) => item.id === product.id));
        }
    }, [items, product]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.slug}`);
            if (response.ok) {
                const data = await response.json();
                setProduct(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                id: product.id,
                type: 'product',
                title: product.title,
                price: product.price,
                image: product.image,
                slug: product.slug,
            });
        }
    };

    const handleBuyNow = () => {
        if (product && !isInCart) {
            handleAddToCart();
        }
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">المنتج غير موجود</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Image Section */}
                        <div>
                            {product.image ? (
                                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FiVideo size={64} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="space-y-6">
                            {product.category && (
                                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                                    {product.category}
                                </span>
                            )}

                            <h1 className="text-3xl font-bold text-gray-900">
                                {product.title}
                            </h1>

                            {/* Rating */}
                            {product.averageRating && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar
                                                key={i}
                                                size={20}
                                                className={
                                                    i < Math.floor(product.averageRating!)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-600">
                                        {product.averageRating.toFixed(1)} ({product.reviewCount} تقييم)
                                    </span>
                                </div>
                            )}

                            {/* Creator */}
                            <div className="flex items-center gap-3">
                                {product.user.avatar && (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={product.user.avatar}
                                            alt={product.user.name}
                                            fill
                                            className="object-cover rounded-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">المدرب</p>
                                    <p className="font-medium text-gray-900">{product.user.name}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="text-4xl font-bold text-indigo-600 mb-4">
                                    {product.price.toFixed(2)} ج.م
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        اشترِ الآن
                                    </button>

                                    {!isInCart ? (
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FiShoppingCart />
                                            أضف للسلة
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <FiCheck />
                                            في السلة
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            {product.features && product.features.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">المميزات:</h3>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <FiCheck className="text-green-600 mt-1 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border-t p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">عن المنتج</h2>
                        <div className="prose max-w-none text-gray-700">
                            {product.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
