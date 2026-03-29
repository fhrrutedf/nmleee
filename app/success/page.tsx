'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiCheckCircle, FiPackage, FiBook, FiArrowLeft, FiGift, FiShoppingCart, FiClock, FiMail, FiLock, FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-accent rounded-xl animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h1 className="text-2xl font-bold mb-4 text-ink">طلب غير موجود</h1>
                <Link href="/" className="px-8 py-3 bg-ink text-white rounded-xl font-bold">العودة للرئيسية</Link>
            </div>
        )
    }

    const isPending = isManual || order.status === 'PENDING' || order.paymentMethod === 'manual';
    const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';
    const courseItem = order.items?.find((i: any) => i.type === 'course');
    const hasCourse = !!courseItem;

    const socialLinks = [
        social?.supportWhatsapp && { icon: <FaWhatsapp size={18} />, label: 'واتساب الدعم', href: `https://wa.me/${social.supportWhatsapp}` },
        social?.socialTelegram && { icon: <FaTelegram size={18} />, label: 'قناة التليجرام', href: social.socialTelegram.startsWith('http') ? social.socialTelegram : `https://t.me/${social.socialTelegram}` },
        social?.socialInstagram && { icon: <FaInstagram size={18} />, label: 'انستقرام', href: social.socialInstagram.startsWith('http') ? social.socialInstagram : `https://instagram.com/${social.socialInstagram}` },
        social?.supportEmail && { icon: <FiMail size={18} />, label: 'البريد الرسمي', href: `mailto:${social.supportEmail}` },
    ].filter(Boolean) as any[];

    return (
        <div className="min-h-screen bg-white py-12 md:py-24 selection:bg-emerald-600/20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] shadow-sm shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col">

                    {/* ===== CLEAN STRATEGIC HEADER ===== */}
                    {isPending && !isPaid ? (
                        <div className="bg-ink text-white p-16 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-surface/10 rounded-xl flex items-center justify-center mx-auto mb-8 ">
                                    <FiClock size={40} className="text-white" />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">طلبك قيد المراجعة ⏳</h1>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto font-bold leading-relaxed">
                                    تم استلام بيانات الدفع بنجاح. سيقوم فريقنا بالتحقق من العملية وتفعيل المحتوى لك خلال أقل من 12 ساعة.
                                </p>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full bg-emerald-600/5 blur-[120px] pointer-events-none"></div>
                        </div>
                    ) : (
                        <div className="bg-emerald-600 text-white p-16 text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-surface/10 rounded-xl flex items-center justify-center mx-auto mb-8 ">
                                    <FiCheckCircle size={40} className="text-white" />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">تم تفعيل طلبك بنجاح! 🎉</h1>
                                <p className="text-white/80 text-lg max-w-xl mx-auto font-bold leading-relaxed">
                                    شكراً لثقتك بنا. جميع المواد والوصول متاح لك الآن. نتمنى لك رحلة تعليمية مثمرة.
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-ink/10 blur-[100px] pointer-events-none"></div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* ===== ORDER SUMMARY RECEIPT ===== */}
                        <div className="p-10 md:p-16 border-l border-gray-50 flex flex-col">
                            <h2 className="text-2xl font-bold text-ink mb-10 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-ink rounded-xl"></span> تفاصيل الفاتورة
                            </h2>
                            
                            <div className="bg-gray-50 rounded-xl p-8 space-y-6 mb-10 border border-gray-100">
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-5">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order ID</span>
                                    <span className="font-bold text-ink font-mono text-sm">#{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-5">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Customer</span>
                                    <span className="font-bold text-ink text-sm">{order.customerEmail}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200/50 pb-5">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Status</span>
                                    <span className={`text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest ${isPending && !isPaid ? 'bg-ink text-white' : 'bg-emerald-600 text-white'}`}>
                                        {isPending && !isPaid ? 'Verification' : 'Completed ✓'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3">
                                    <span className="text-ink font-bold text-lg">إجمالي المبلغ:</span>
                                    <span className="font-bold text-emerald-600 text-3xl font-inter tracking-tighter">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Verification/Welcome Message */}
                            <div className="mb-12">
                                {isPending && !isPaid ? (
                                    <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100 ring-4 ring-gray-50/50">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-ink shrink-0">
                                            <FiLock />
                                        </div>
                                        <p className="text-sm text-gray-500 font-bold leading-relaxed">
                                            سيتم فتح المحتوى تلقائياً في حسابك بعد مراجعة الإيصال. ستستلم رسالة تفعيل على بريدك الإلكتروني قريباً جداً.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex gap-4 p-6 bg-emerald-600/5 rounded-xl border border-emerald-600/10 ring-4 ring-accent/5">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                                            <FiBook />
                                        </div>
                                        <p className="text-sm text-ink font-bold leading-relaxed">
                                            جميع المواد الرقمية متاحة الآن. يمكنك الوصول إليها من حسابك الشخصي أو عبر الروابط المرسلة لبريدك.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Main CTA Buttons */}
                            <div className="mt-auto space-y-4">
                                {isPaid || (!isPending) ? (
                                    <>
                                        {hasCourse && courseItem.id ? (
                                            <Link
                                                href={sessionStatus === 'authenticated' ? `/learn/${courseItem.id}` : `/login?callbackUrl=/learn/${courseItem.id}`}
                                                className="flex items-center justify-center gap-3 w-full py-5 bg-ink text-white rounded-xl font-bold transition-all shadow-sm shadow-ink/10 hover:bg-gray-800 hover:shadow-ink/20 transform hover:-translate-y-0.5"
                                            >
                                                دخول الأكاديمية والبدء الآن <FiExternalLink />
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/my-purchases"
                                                className="flex items-center justify-center gap-3 w-full py-5 bg-ink text-white rounded-xl font-bold transition-all shadow-sm shadow-ink/10 hover:bg-gray-800 hover:shadow-ink/20 transform hover:-translate-y-0.5"
                                            >
                                                تحميل المنتجات الرقمية <FiPackage />
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href="/market"
                                        className="flex items-center justify-center gap-3 w-full py-5 bg-ink text-white rounded-xl font-bold transition-all shadow-sm shadow-ink/10 hover:bg-gray-800"
                                    >
                                        العودة للمتجر
                                    </Link>
                                )}
                                <Link
                                    href="/"
                                    className="block w-full py-5 text-center bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                                >
                                    العودة للرئيسية
                                </Link>
                            </div>
                        </div>

                        {/* ===== SOCIAL & SUPPORT COLUMN ===== */}
                        <div className="p-10 md:p-16 bg-gray-50/30 flex flex-col">
                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-ink mb-6 flex items-center gap-3">
                                    <FiMessageCircle className="text-emerald-600" /> قنوات تواصل رسمية
                                </h3>
                                <p className="text-sm text-gray-500 font-bold mb-8 leading-relaxed">نحن معك في كل خطوة. إذا كان لديك أي استفسار حول طلبك، لا تتردد في مراسلتنا فوراً.</p>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {socialLinks.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white border border-gray-100 p-5 rounded-xl flex items-center justify-between group hover:border-emerald-600 hover:shadow-sm hover:shadow-accent/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 text-ink rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    {link.icon}
                                                </div>
                                                <span className="font-bold text-ink text-sm">{link.label}</span>
                                            </div>
                                            <FiArrowLeft className="text-gray-300 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-all" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* High-End Upsell Section */}
                            {upsells.length > 0 && (
                                <div className="mt-8 pt-10 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">عروض حصرية لك</h3>
                                    <div className="space-y-4">
                                        {upsells.map((upsell) => (
                                            <Link key={upsell.id} href={`/${upsell.id}`} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between hover:border-emerald-600 group transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                                                        {upsell.image ? (
                                                            <img src={upsell.image} alt={upsell.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <FiPackage />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-ink text-xs line-clamp-1 group-hover:text-emerald-600 transition-colors">{upsell.title}</h4>
                                                        <p className="text-emerald-600 font-bold font-inter tracking-tighter mt-1">${upsell.price}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 text-ink flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-all">
                                                    <FiShoppingCart size={14} />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        POWERED BY <span className="text-ink">TMLEEN INFRASTRUCTURE</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-accent rounded-xl animate-spin"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
