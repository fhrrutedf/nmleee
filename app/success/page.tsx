'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiBook, FiArrowLeft, FiGift, FiShoppingCart } from 'react-icons/fi';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id') || searchParams.get('order_id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upsells, setUpsells] = useState<any[]>([]);

    useEffect(() => {
        if (sessionId) {
            fetchOrder();
            // Clear cart
            localStorage.removeItem('cart');
            // Clear affiliate ref
            localStorage.removeItem('affiliateRef');
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    const fetchOrder = async () => {
        try {
            // Can be stripe session ID or local order ID
            const response = await fetch(`/api/orders/verify?session_id=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data.order || data);

                // Fetch Upsells (products from same seller) if order has products
                if (data.order?.sellerId || data.sellerId) {
                    fetchUpsells(data.order?.sellerId || data.sellerId);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpsells = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/store/${sellerId}/upsells`);
            if (res.ok) {
                const data = await res.json();
                setUpsells(data.slice(0, 2)); // Show only 2 recommendations
            }
        } catch (e) {
            console.error("Failed to load upsells", e);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-bg-dark">
                <h1 className="text-2xl font-bold mb-4 text-primary-charcoal dark:text-white">طلب غير موجود</h1>
                <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
            </div>
        )
    }

    const effectiveBrandColor = order.brandColor;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-dark py-12 pb-24">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-action-blue, .text-indigo-600 { color: ${effectiveBrandColor} !important; }
                    .bg-indigo-600 { background-color: ${effectiveBrandColor} !important; }
                    .btn-primary { background-color: ${effectiveBrandColor} !important; border-color: ${effectiveBrandColor} !important; }
                    .hover\\:bg-indigo-700:hover, .hover\\:bg-blue-600:hover { background-color: ${effectiveBrandColor}cc !important; }
                    .hover\\:border-action-blue:hover { border-color: ${effectiveBrandColor} !important; }
                    .shadow-action-blue\\/20 { --tw-shadow-color: ${effectiveBrandColor}33 !important; }
                    `
                }} />
            )}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    {/* Success Header */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <FiCheckCircle size={80} className="mx-auto mb-6 drop-shadow-md" />
                            <h1 className="text-4xl font-black mb-3 drop-shadow-sm">تم الدفع بنجاح! 🎉</h1>
                            <p className="text-green-50 font-medium text-lg max-w-lg mx-auto">
                                شكراً لثقتك بنا! تم تأكيد طلبك وإرسال كافة التفاصيل إلى بريدك الإلكتروني.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Order Details Column */}
                        <div className="p-8 md:p-12 md:w-1/2 border-b md:border-b-0 md:border-l border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-6">تفاصيل طلبك</h2>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 space-y-4 mb-8">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <span className="text-gray-500 font-medium">رقم العملية:</span>
                                    <span className="font-bold text-primary-charcoal dark:text-gray-200 font-mono text-sm">{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <span className="text-gray-500 font-medium">الإيميل المسجل:</span>
                                    <span className="font-bold text-primary-charcoal dark:text-gray-200 text-sm">{order.customerEmail}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-bold">المبلغ المدفوع:</span>
                                    <span className="font-black text-action-blue text-2xl">
                                        {order.totalAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                            </div>

                            {(() => {
                                const courseItem = order.items?.find((i: any) => i.type === 'course');
                                if (courseItem) {
                                    return (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-5 mb-8">
                                            <p className="text-sm text-green-900 dark:text-green-300 font-medium leading-relaxed">
                                                🎓 <strong>تم تفعيل الدورة بنجاح:</strong> يمكنك البدء في التعلم فوراً، سيتم توجيهك الآن إلى محتوى الدورة.
                                            </p>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 mb-8">
                                        <p className="text-sm text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                                            📧 <strong>ملاحظة هامة:</strong> لقد أرسلنا إيصال الشراء وروابط التحميل المباشرة إلى البريد الإلكتروني الخاص بك. يرجى تفقده (ومجلد المهملات).
                                        </p>
                                    </div>
                                );
                            })()}

                            <div className="space-y-4">
                                {(() => {
                                    const courseItem = order.items?.find((i: any) => i.type === 'course');
                                    if (courseItem && courseItem.id) {
                                        return (
                                            <Link
                                                href={`/learn/${courseItem.id}`}
                                                className="block w-full py-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                                            >
                                                <FiBook className="text-xl" /> البدء بالدورة الآن
                                            </Link>
                                        );
                                    }
                                    return (
                                        <Link
                                            href="/my-purchases"
                                            className="block w-full py-4 bg-primary-charcoal hover:bg-black dark:bg-action-blue dark:hover:bg-blue-600 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                        >
                                            تحميل المنتجات
                                        </Link>
                                    );
                                })()}
                                <Link
                                    href="/"
                                    className="block w-full py-4 border-2 border-gray-200 dark:border-gray-700 text-primary-charcoal dark:text-gray-300 text-center rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    تصفح المزيد من المنتجات
                                </Link>
                            </div>
                        </div>

                        {/* Upsell / Cross-sell Column */}
                        <div className="p-8 md:p-12 md:w-1/2 bg-gray-50/50 dark:bg-bg-dark/50">
                            {upsells.length > 0 ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 rounded-xl">
                                            <FiGift size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary-charcoal dark:text-white">بما أنك اشتريت هذا، قد يعجبك أيضاً!</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6 font-medium">منتجات حصرية إضافية من نفس المبدع لتكملة رحلتك:</p>

                                    <div className="space-y-4">
                                        {upsells.map((upsell) => (
                                            <div key={upsell.id} className="bg-white dark:bg-card-white border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex gap-4 hover:border-action-blue transition-colors group">
                                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                                    {upsell.image ? (
                                                        <img src={upsell.image} alt={upsell.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FiPackage size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h4 className="font-bold text-primary-charcoal dark:text-white text-sm line-clamp-1 group-hover:text-action-blue transition-colors">{upsell.title}</h4>
                                                    <div className="font-black text-gray-900 dark:text-gray-200 mt-1">{upsell.price} ج.م</div>
                                                    <Link href={`/${upsell.id}`} className="text-action-blue font-bold text-sm mt-2 flex items-center gap-1">
                                                        عرض التفاصيل <FiArrowLeft />
                                                    </Link>
                                                </div>
                                                <button className="self-center p-3 bg-action-blue text-white rounded-xl shadow-lg shadow-action-blue/20 hover:bg-blue-600 transition-colors" title="إضافة للسلة">
                                                    <FiShoppingCart />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                                        <p className="text-xs text-gray-400 font-medium">العروض تتوفر لفترة محدودة، استفد منها الآن وجرب إضافتها لسلتك.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-action-blue rounded-full flex items-center justify-center mb-6">
                                        <FiPackage size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">رحلة سعيدة وموفقة!</h3>
                                    <p className="text-text-muted">نتمنى أن يكون المنتج قد لبى توقعاتك. لا تتردد في تقييم تجربتك معنا.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Simple Footer */}
            <footer className="mt-16 py-8 text-center border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    مدعوم من <a href="https://tmleen.com" className="text-action-blue font-bold hover:underline">منصة تقانة</a>
                </p>
            </footer>
        </div>
    );
}
