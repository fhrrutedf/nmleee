'use client';

import Link from 'next/link';
import { FiPackage, FiZap, FiShoppingCart } from 'react-icons/fi';

interface BundleProduct {
    product: {
        id: string;
        title: string;
        price: number;
        image?: string;
    };
}

interface BundleCardProps {
    bundle: {
        id: string;
        title: string;
        description: string;
        price: number;
        image?: string;
        slug?: string;
        products: BundleProduct[];
    };
    brandColor?: string;
}

export default function BundleCard({ bundle, brandColor = '#D41295' }: BundleCardProps) {
    const originalPrice = bundle.products.reduce((sum, bp) => sum + bp.product.price, 0);
    const discountPct = originalPrice > 0
        ? Math.round(((originalPrice - bundle.price) / originalPrice) * 100)
        : 0;
    const productImages = bundle.products
        .map(bp => bp.product.image)
        .filter(Boolean)
        .slice(0, 3) as string[];

    return (
        <Link
            href={`/bundle/${bundle.slug || bundle.id}`}
            className="block group"
        >
            <div
                className="relative rounded-3xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{
                    borderColor: `${brandColor}60`,
                    background: `linear-gradient(135deg, ${brandColor}08, ${brandColor}03)`,
                    boxShadow: `0 4px 20px ${brandColor}15`
                }}
            >
                {/* Glowing Top Bar */}
                <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${brandColor}, #7c3aed, ${brandColor})` }}
                />

                {/* Savings Badge */}
                {discountPct > 0 && (
                    <div
                        className="absolute top-4 left-4 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10"
                        style={{ background: `linear-gradient(135deg, #10b981, #059669)` }}
                    >
                        <FiZap size={11} />
                        وفر {discountPct}%
                    </div>
                )}

                {/* Bundle Badge */}
                <div
                    className="absolute top-4 right-4 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10"
                    style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}
                >
                    <FiPackage size={11} />
                    باقة
                </div>

                <div className="p-5">
                    {/* Stacked Product Images */}
                    <div className="flex justify-center mb-5">
                        <div className="relative h-28 flex items-center justify-center" style={{ width: `${Math.min(productImages.length, 3) * 60 + 20}px` }}>
                            {productImages.length > 0 ? (
                                productImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg"
                                        style={{
                                            right: `${i * 40}px`,
                                            zIndex: productImages.length - i,
                                            transform: `rotate(${(i - 1) * 5}deg)`,
                                        }}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${brandColor}20` }}
                                >
                                    <FiPackage className="text-3xl" style={{ color: brandColor }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Count */}
                    <p className="text-center text-xs font-bold mb-3" style={{ color: brandColor }}>
                        {bundle.products.length} منتجات في باقة واحدة
                    </p>

                    {/* Title */}
                    <h3 className="text-center font-black text-gray-900 dark:text-white text-base leading-snug mb-2 line-clamp-2">
                        {bundle.title}
                    </h3>

                    {/* Description */}
                    {bundle.description && (
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                            {bundle.description.replace(/<[^>]*>/g, '')}
                        </p>
                    )}

                    {/* Pricing */}
                    <div
                        className="rounded-2xl p-3 flex items-center justify-between mt-3"
                        style={{ background: `${brandColor}10` }}
                    >
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black" style={{ color: brandColor }}>
                                    {bundle.price}
                                </span>
                                <span className="text-sm font-bold text-gray-500">ج.م</span>
                            </div>
                            {originalPrice > bundle.price && (
                                <span className="text-xs text-gray-400 line-through">
                                    {originalPrice} ج.م
                                </span>
                            )}
                        </div>

                        <div
                            className="flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-xl group-hover:scale-105 transition-transform shadow-md"
                            style={{ background: brandColor }}
                        >
                            <FiShoppingCart size={14} />
                            اشترِ الباقة
                        </div>
                    </div>

                    {/* Savings message */}
                    {discountPct > 0 && (
                        <p className="text-center text-xs font-bold text-green-600 dark:text-green-400 mt-2">
                            ✨ وفّر {discountPct}% عند شراء هذه المجموعة!
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
