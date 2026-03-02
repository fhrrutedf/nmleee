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
    const sumPrice = bundle.products.reduce((s: number, bp: any) => s + bp.product.price, 0);
    const originalPrice = Number(sumPrice.toFixed(2));
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
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 pb-24 font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                .brand-bg { background-color: ${brandColor} !important; }
                .brand-text { color: ${brandColor} !important; }
                .brand-border { border-color: ${brandColor} !important; }
            `}} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
                {/* Breadcrumb */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-colors">
                    <FiArrowRight className="text-lg" /> العودة
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left: Bundle Details */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Header Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 transition-shadow">
                            <div className="h-2.5 w-full" style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}80)` }} />
                            <div className="p-8 sm:p-10">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="text-sm font-bold px-4 py-1.5 rounded-full text-white shadow-sm flex items-center gap-1.5" style={{ background: brandColor }}>
                                        <FiPackage className="text-base" /> باقة مميزة
                                    </span>
                                    {discountPct > 0 && (
                                        <span className="text-sm font-bold px-4 py-1.5 rounded-full text-green-700 bg-green-100 border border-green-200 shadow-sm flex items-center gap-1.5">
                                            <FiCheck /> توفير {discountPct}%
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                    {bundle.title}
                                </h1>
                                {bundle.description && (
                                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed ql-editor px-0"
                                        dangerouslySetInnerHTML={{ __html: bundle.description.replace(/&nbsp;/g, ' ') }} />
                                )}
                            </div>
                        </div>

                        {/* Products Included */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800">
                            <h2 className="font-black text-2xl text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${brandColor}15` }}>
                                    <FiPackage className="text-xl" style={{ color: brandColor }} />
                                </span>
                                ما تشمله هذه الباقة
                            </h2>
                            <div className="space-y-4">
                                {bundle.products.map((bp: any) => (
                                    <div key={bp.product.id} className="group flex flex-row items-center gap-4 p-5 rounded-2xl bg-[#FCFCFC] dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md">

                                        {/* Title & Status (First / Right in RTL) */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-relaxed mb-1.5 line-clamp-2">{bp.product.title}</p>
                                            <div className="flex items-center gap-2">
                                                <FiCheck className="text-green-500 text-sm flex-shrink-0" />
                                                <span className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">مشمول في الباقة</span>
                                            </div>
                                        </div>

                                        {/* Price (Middle) */}
                                        <div className="text-start flex flex-col justify-center flex-shrink-0 ps-1">
                                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">السعر الأصلي</p>
                                            <p className="text-xs sm:text-sm text-gray-500 line-through font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md inline-block">{bp.product.price} ج.م</p>
                                        </div>

                                        {/* Image (Last / Left in RTL) */}
                                        <div className="flex-shrink-0">
                                            {bp.product.image ? (
                                                <img src={bp.product.image} alt={bp.product.title}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm"
                                                    style={{ background: `${brandColor}08` }}>
                                                    <FiPackage className="text-2xl" style={{ color: brandColor }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Purchase Sidebar */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-none">
                                <div className="h-2.5 w-full" style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}80)` }} />
                                <div className="p-8 sm:p-10 space-y-8">
                                    {/* Price Section */}
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">الإجمالي بعد الخصم</p>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-5xl lg:text-6xl font-black tracking-tight" style={{ color: brandColor }}>
                                                {bundle.price}
                                            </span>
                                            <span className="text-2xl font-bold text-gray-500">ج.م</span>
                                        </div>
                                        {originalPrice > bundle.price && (
                                            <div className="flex items-center justify-center gap-3 mt-4">
                                                <span className="text-gray-400 line-through text-lg font-mono">{originalPrice} ج.م</span>
                                                <span className="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 text-sm font-black px-4 py-1.5 rounded-full shadow-sm">
                                                    وفر {discountPct}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Value Proposition */}
                                    {discountPct > 0 && (
                                        <div className="rounded-2xl p-5 text-center transition-transform hover:scale-[1.02]" style={{ background: `${brandColor}08`, border: `1px dashed ${brandColor}40` }}>
                                            <p className="font-extrabold text-base leading-relaxed" style={{ color: brandColor }}>
                                                🎉 صفقة رابحة! ستحتفظ بمبلغ {originalPrice - bundle.price} ج.م في جيبك.
                                            </p>
                                        </div>
                                    )}

                                    {/* Stacked mini images */}
                                    <div className="flex justify-center py-2">
                                        <div className="flex -space-x-4 rtl:space-x-reverse">
                                            {bundle.products.slice(0, 5).map((bp: any, i: number) => (
                                                bp.product.image && (
                                                    <img key={i} src={bp.product.image} alt=""
                                                        className="w-14 h-14 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-md transition-transform hover:-translate-y-2 hover:z-50 relative"
                                                        style={{ zIndex: 10 - i }} />
                                                )
                                            ))}
                                            {bundle.products.length > 5 && (
                                                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-md relative z-0">
                                                    +{bundle.products.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="pt-4">
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={buying}
                                            className="w-full py-5 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-[0_8px_20px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgb(0,0,0,0.18)] disabled:opacity-80 disabled:hover:translate-y-0"
                                            style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
                                        >
                                            {buying ? (
                                                <><span className="w-6 h-6 rounded-full border-4 border-white/30 border-t-white animate-spin" /> جاري التجهيز...</>
                                            ) : (
                                                <><FiShoppingCart className="text-2xl" /> اشتري الباقة الآن</>
                                            )}
                                        </button>

                                        <div className="mt-6 space-y-3">
                                            <p className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                                                <FiCheck className="text-green-500 text-lg" />
                                                حق وصول فوري لجميع الملفات
                                            </p>
                                            <p className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                                                <FiCheck className="text-green-500 text-lg" />
                                                دفع آمن ومحمي بالكامل
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
