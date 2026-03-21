'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiBook, FiArrowLeft, FiGift, FiShoppingCart, FiClock, FiMail, FiLock, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';

function SuccessContent() {
    const searchParams = useSearchParams();
    const { status: sessionStatus } = useSession();
    const sessionId = searchParams.get('session_id') || searchParams.get('order_id');
    const isManual = searchParams.get('manual') === 'true';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upsells, setUpsells] = useState<any[]>([]);
    const [social, setSocial] = useState<any>(null);

    useEffect(() => {
        if (sessionId) {
            fetchOrder();
            localStorage.removeItem('cart');
            localStorage.removeItem('affiliateRef');
        } else {
            setLoading(false);
        }
        // Fetch social links for contact info
        fetchSocial();
    }, [sessionId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/verify?session_id=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data.order || data);
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

    const fetchSocial = async () => {
        try {
            const res = await fetch('/api/platform/social');
            if (res.ok) setSocial(await res.json());
        } catch (e) { /* ignore */ }
    };

    const fetchUpsells = async (sellerId: string) => {
        try {
            const res = await fetch(`/api/store/${sellerId}/upsells`);
            if (res.ok) {
                const data = await res.json();
                setUpsells(data.slice(0, 2));
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
    const isPending = isManual || order.status === 'PENDING' || order.paymentMethod === 'manual';
    const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';
    const courseItem = order.items?.find((i: any) => i.type === 'course');
    const hasCourse = !!courseItem;

    // Social links array for display
    const socialLinks = [
        social?.supportWhatsapp && { icon: <FaWhatsapp size={18} />, label: 'واتساب', href: `https://wa.me/${social.supportWhatsapp}`, color: 'bg-green-500' },
        social?.socialTelegram && { icon: <FaTelegram size={18} />, label: 'تيليجرام', href: social.socialTelegram.startsWith('http') ? social.socialTelegram : `https://t.me/${social.socialTelegram}`, color: 'bg-blue-500' },
        social?.socialInstagram && { icon: <FaInstagram size={18} />, label: 'انستجرام', href: social.socialInstagram.startsWith('http') ? social.socialInstagram : `https://instagram.com/${social.socialInstagram}`, color: 'bg-pink-500' },
        social?.socialFacebook && { icon: <FaFacebook size={18} />, label: 'فيسبوك', href: social.socialFacebook.startsWith('http') ? social.socialFacebook : `https://facebook.com/${social.socialFacebook}`, color: 'bg-blue-700' },
        social?.socialTwitter && { icon: <FaTwitter size={18} />, label: 'تويتر', href: social.socialTwitter.startsWith('http') ? social.socialTwitter : `https://twitter.com/${social.socialTwitter}`, color: 'bg-sky-500' },
        social?.supportEmail && { icon: <FiMail size={18} />, label: 'البريد', href: `mailto:${social.supportEmail}`, color: 'bg-gray-600' },
    ].filter(Boolean) as any[];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-bg-dark py-12 pb-24">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-action-blue, .text-indigo-600 { color: ${effectiveBrandColor} !important; }
                    .bg-indigo-600 { background-color: ${effectiveBrandColor} !important; }
                    .btn-primary { background-color: ${effectiveBrandColor} !important; border-color: ${effectiveBrandColor} !important; }
                    .hover\\:bg-indigo-700:hover, .hover\\:bg-blue-600:hover { background-color: ${effectiveBrandColor}cc !important; }
                    `
                }} />
            )}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">

                    {/* ===== HEADER ===== */}
                    {isPending && !isPaid ? (
                        /* Manual Payment — Pending */
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                {hasCourse ? (
                                    <>
                                        <FiLock size={80} className="mx-auto mb-6 drop-shadow-md" />
                                        <h1 className="text-4xl font-black mb-3 drop-shadow-sm">الكورس مقفل حالياً 🔒</h1>
                                        <p className="text-amber-50 font-medium text-lg max-w-lg mx-auto">
                                            تم استلام طلبك! سيتم فتح الكورس بعد التأكد من الدفع من قبل الإدارة. سنرسل لك رابط التسجيل عبر البريد الإلكتروني.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <FiClock size={80} className="mx-auto mb-6 drop-shadow-md" />
                                        <h1 className="text-4xl font-black mb-3 drop-shadow-sm">تم استلام طلبك! ⏳</h1>
                                        <p className="text-amber-50 font-medium text-lg max-w-lg mx-auto">
                                            شكراً لك! سنتحقق من الدفعة وسنرسل لك التأكيد عبر البريد الإلكتروني.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Auto Payment — Confirmed */
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                <FiCheckCircle size={80} className="mx-auto mb-6 drop-shadow-md" />
                                <h1 className="text-4xl font-black mb-3 drop-shadow-sm">تم الدفع بنجاح! 🎉</h1>
                                <p className="text-green-50 font-medium text-lg max-w-lg mx-auto">
                                    {hasCourse
                                        ? 'تم تفعيل الدورة بنجاح! يمكنك البدء بالتعلم فوراً.'
                                        : 'شكراً لثقتك بنا! تم تأكيد طلبك وإرسال كافة التفاصيل إلى بريدك الإلكتروني.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row">
                        {/* ===== ORDER DETAILS ===== */}
                        <div className="p-8 md:p-12 md:w-1/2 border-b md:border-b-0 md:border-l border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white mb-6">تفاصيل طلبك</h2>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 space-y-4 mb-8">
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <span className="text-gray-500 font-medium">رقم العملية:</span>
                                    <span className="font-bold text-primary-charcoal dark:text-gray-200 font-mono text-sm">{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <span className="text-gray-500 font-medium">الإيميل:</span>
                                    <span className="font-bold text-primary-charcoal dark:text-gray-200 text-sm">{order.customerEmail}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                                    <span className="text-gray-500 font-medium">الحالة:</span>
                                    {isPending && !isPaid ? (
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">قيد التحقق</span>
                                    ) : (
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">تم الدفع ✓</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-bold">المبلغ:</span>
                                    <span className="font-black text-action-blue text-2xl">{order.totalAmount.toFixed(2)} $</span>
                                </div>
                            </div>

                            {/* ===== POST-PURCHASE MESSAGE ===== */}
                            {isPending && !isPaid ? (
                                <div className="space-y-4 mb-8">
                                    {hasCourse ? (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5">
                                            <p className="text-sm text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                                                🔒 <strong>الكورس مقفل حالياً</strong> حتى يتم التأكد من الدفع من قبل الإدارة. بعد التحقق، سنرسل لك رابط التسجيل والوصول عبر البريد الإلكتروني.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5">
                                            <p className="text-sm text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                                                ⏳ <strong>سنتحقق من إيصال الدفع</strong> وسنرسل لك رسالة تأكيد + المنتج عبر البريد الإلكتروني خلال وقت قصير.
                                            </p>
                                        </div>
                                    )}

                                    {/* Social Media Contact Section */}
                                    {socialLinks.length > 0 && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
                                            <p className="text-sm text-blue-900 dark:text-blue-300 font-bold mb-3 flex items-center gap-2">
                                                <FiMessageCircle /> إذا واجهتك مشكلة أو انتظرت كثيراً، تواصل معنا:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {socialLinks.map((link, i) => (
                                                    <a
                                                        key={i}
                                                        href={link.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`${link.color} text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-opacity`}
                                                    >
                                                        {link.icon} {link.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {hasCourse ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-2xl p-5 mb-8">
                                            <p className="text-sm text-green-900 dark:text-green-300 font-medium leading-relaxed">
                                                🎓 <strong>تم تفعيل الدورة بنجاح:</strong> يمكنك البدء في التعلم فوراً.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 mb-8">
                                            <p className="text-sm text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                                                📧 <strong>ملاحظة هامة:</strong> لقد أرسلنا إيصال الشراء وروابط التحميل إلى بريدك الإلكتروني.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ===== ACTION BUTTONS ===== */}
                            <div className="space-y-4">
                                {isPending && !isPaid ? (
                                    <Link
                                        href="/"
                                        className="block w-full py-4 bg-primary-charcoal hover:bg-black dark:bg-action-blue dark:hover:bg-blue-600 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                    >
                                        تصفح المزيد من المنتجات
                                    </Link>
                                ) : (
                                    <>
                                        {hasCourse && courseItem.id ? (
                                            sessionStatus === 'authenticated' ? (
                                                <Link
                                                    href={`/learn/${courseItem.id}`}
                                                    className="block w-full py-4 bg-green-600 hover:bg-green-700 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                                                >
                                                    <FiBook className="text-xl" /> البدء بالدورة الآن 🎓
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/login?callbackUrl=/learn/${courseItem.id}`}
                                                    className="block w-full py-4 bg-action-blue hover:bg-blue-600 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                                                >
                                                    <FiLock className="text-xl" /> تسجيل الدخول لبدء الدورة 🎓
                                                </Link>
                                            )
                                        ) : (
                                            <Link
                                                href="/my-purchases"
                                                className="block w-full py-4 bg-primary-charcoal hover:bg-black dark:bg-action-blue dark:hover:bg-blue-600 text-white text-center rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                            >
                                                تحميل المنتجات
                                            </Link>
                                        )}
                                        <Link
                                            href="/"
                                            className="block w-full py-4 border-2 border-gray-200 dark:border-gray-700 text-primary-charcoal dark:text-gray-300 text-center rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            تصفح المزيد من المنتجات
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ===== UPSELL COLUMN ===== */}
                        <div className="p-8 md:p-12 md:w-1/2 bg-gray-50/50 dark:bg-bg-dark/50">
                            {upsells.length > 0 ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 rounded-xl">
                                            <FiGift size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-primary-charcoal dark:text-white">قد يعجبك أيضاً!</h3>
                                    </div>
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
                                                    <div className="font-black text-gray-900 dark:text-gray-200 mt-1">{upsell.price} $</div>
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
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-action-blue rounded-full flex items-center justify-center mb-6">
                                        <FiPackage size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">رحلة سعيدة وموفقة!</h3>
                                    <p className="text-text-muted">نتمنى أن يكون المنتج قد لبى توقعاتك.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <footer className="mt-16 py-8 text-center border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    مدعوم من <a href="https://tmleen.com" className="text-action-blue font-bold hover:underline">منصة تمالين</a>
                </p>
            </footer>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-action-blue/20 border-t-action-blue rounded-full animate-spin"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
