'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiPackage, FiArrowRight, FiCheck, FiShoppingCart } from 'react-icons/fi';
import showToast from '@/lib/toast';

export default function BundlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlBrandColor = searchParams.get('brand');

    const [bundle, setBundle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        fetch(`/api/bundles/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { setBundle(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        // Use brand color from URL if available, otherwise default
        const spinColor = urlBrandColor ? `#${urlBrandColor.replace('#', '')}` : '#D41295';

        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div
                    className="animate-spin rounded-full h-14 w-14 border-4 border-transparent"
                    style={{
                        borderTopColor: spinColor,
                        borderRightColor: `${spinColor}40`,
                        borderBottomColor: `${spinColor}10`,
                        borderLeftColor: `${spinColor}80`
                    }}
                />
            </div>
        );
    }

    if (!bundle) return (
        <div className="min-h-[70vh] flex items-center justify-center text-center p-8">
            <div>
                <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-700">الباقة غير موجودة</h1>
            </div>
        </div>
    );

    const brandColor = bundle.user?.brandColor || '#D41295';
    const originalPrice = bundle.products.reduce((s: number, bp: any) => s + bp.product.price, 0);
    const discountPct = originalPrice > 0 ? Math.round(((originalPrice - bundle.price) / originalPrice) * 100) : 0;

    const handleBuyNow = () => {
        setBuying(true);
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const exists = cart.find((i: any) => i.id === `bundle-${bundle.id}`);
        if (!exists) {
            cart.push({
                id: `bundle-${bundle.id}`,
                type: 'bundle',
                bundleId: bundle.id,
                title: bundle.title,
                price: bundle.price,
                image: bundle.image || bundle.products[0]?.product?.image,
                brandColor,
                productIds: bundle.products.map((bp: any) => bp.product.id)
            });
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        setTimeout(() => router.push('/cart'), 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
            <style dangerouslySetInnerHTML={{
                __html: `
                .brand-bg { background-color: ${brandColor} !important; }
                .brand-text { color: ${brandColor} !important; }
                .brand-border { border-color: ${brandColor} !important; }
            `}} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
                {/* Breadcrumb */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-colors">
                    <FiArrowRight /> العودة
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Bundle Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="rounded-3xl overflow-hidden border-2" style={{ borderColor: `${brandColor}40` }}>
                            <div className="h-2" style={{ background: `linear-gradient(90deg, ${brandColor}, #7c3aed)` }} />
                            <div className="p-6 bg-white dark:bg-gray-900">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-black px-3 py-1 rounded-full text-white" style={{ background: brandColor }}>
                                        <FiPackage className="inline ml-1" />باقة مميزة
                                    </span>
                                    {discountPct > 0 && (
                                        <span className="text-xs font-black px-3 py-1 rounded-full text-white bg-green-500">
                                            وفر {discountPct}%
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
                                    {bundle.title}
                                </h1>
                                {bundle.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: bundle.description }} />
                                )}
                            </div>
                        </div>

                        {/* Products in Bundle */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                            <h2 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiPackage style={{ color: brandColor }} /> ما يشمله الباقة
                            </h2>
                            <div className="space-y-3">
                                {bundle.products.map((bp: any) => (
                                    <div key={bp.product.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                                        {bp.product.image ? (
                                            <img src={bp.product.image} alt={bp.product.title}
                                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                                                style={{ background: `${brandColor}20` }}>
                                                <FiPackage style={{ color: brandColor }} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{bp.product.title}</p>
                                            <p className="text-xs text-gray-500 line-through">{bp.product.price} ج.م</p>
                                        </div>
                                        <FiCheck className="text-green-500 flex-shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Purchase Card */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
                            <div className="h-2" style={{ background: `linear-gradient(90deg, ${brandColor}, #7c3aed)` }} />
                            <div className="p-8 space-y-6">
                                {/* Price */}
                                <div className="text-center">
                                    <div className="flex items-baseline justify-center gap-2 mb-1">
                                        <span className="text-5xl font-black" style={{ color: brandColor }}>
                                            {bundle.price}
                                        </span>
                                        <span className="text-xl font-bold text-gray-500">ج.م</span>
                                    </div>
                                    {originalPrice > bundle.price && (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-gray-400 line-through text-lg">{originalPrice} ج.م</span>
                                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-black px-3 py-1 rounded-full">
                                                وفر {discountPct}%!
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* What you get */}
                                {discountPct > 0 && (
                                    <div className="rounded-2xl p-4 text-center" style={{ background: `${brandColor}10`, border: `1px solid ${brandColor}30` }}>
                                        <p className="font-black text-sm" style={{ color: brandColor }}>
                                            ✨ وفّر {originalPrice - bundle.price} ج.م عند شراء هذه المجموعة!
                                        </p>
                                    </div>
                                )}

                                {/* Stacked mini images */}
                                <div className="flex justify-center">
                                    <div className="flex -space-x-3 rtl:space-x-reverse">
                                        {bundle.products.slice(0, 4).map((bp: any, i: number) => (
                                            bp.product.image && (
                                                <img key={i} src={bp.product.image}
                                                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
                                                    style={{ zIndex: 10 - i }} />
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buying}
                                    className="w-full py-5 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 disabled:opacity-80"
                                    style={{ background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` }}
                                >
                                    {buying ? (
                                        <><span className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" /> جاري التحويل...</>
                                    ) : (
                                        <><FiShoppingCart className="text-2xl" /> اشتري الباقة ←</>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 font-medium">
                                    ✅ وصول فوري لجميع المنتجات بعد الدفع
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
