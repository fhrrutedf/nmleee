'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FiShoppingCart, FiTrash2, FiTag, FiCreditCard, FiLock,
    FiUpload, FiCopy, FiCheck, FiX, FiGlobe, FiArrowRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import showToast from '@/lib/toast';
import {
    paymentMethodsByCountry,
    getPaymentMethodsForCountry,
    convertCurrency,
    formatCurrency,
    type PaymentMethod,
} from '@/config/paymentMethods';
import { getCookie } from '@/lib/marketing';

// الدول المحظورة التي لا تدعم Stripe
const RESTRICTED_COUNTRIES = ['SY', 'IQ'];

// أرقام محافظ المنصة
const PLATFORM_WALLETS: Record<string, string> = {
    shamcash: '0933000000',
    omt: '0933000000',
    hawala: '0933000000',
    mtncash: '0955000000',
    zaincash: '07801000000',
    qicard: '07801000000',
    asiahawala: '07801000000',
    vodafonecash: '01000000000',
    fawry: 'FAWRY-1234567',
    instapay: '01000000000',
    stcpay: '0500000000',
    banktransfer: 'SA00 0000 0000 0000 0000 0000',
    westernunion: 'Platform Admin',
};

const COUNTRY_FLAGS: Record<string, string> = {
    SY: '🇸🇾', IQ: '🇮🇶', EG: '🇪🇬', SA: '🇸🇦', DEFAULT: '🌍',
};

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDirect = searchParams.get('direct') === 'true';

    const [cart, setCart] = useState<any[]>([]);
    const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Country & Payment State
    const [customerCountry, setCustomerCountry] = useState('');
    const [isRestricted, setIsRestricted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto' | 'manual'>('stripe');
    const [selectedLocalMethod, setSelectedLocalMethod] = useState<PaymentMethod | null>(null);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Manual Payment Fields
    const [senderPhone, setSenderPhone] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isDirect) {
            const directItems = JSON.parse(sessionStorage.getItem('direct_checkout_items') || '[]');
            const details = JSON.parse(sessionStorage.getItem('appointment_details') || 'null');
            setCart(directItems);
            setAppointmentDetails(details);
        } else {
            const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(savedCart);
        }
    }, [isDirect]);

    // Auto-detect country
    useEffect(() => {
        fetch('/api/geo')
            .then(r => r.ok ? r.json() : { country: 'DEFAULT' })
            .then(d => {
                const code = d.country || 'DEFAULT';
                setCustomerCountry(code);
                if (RESTRICTED_COUNTRIES.includes(code)) {
                    setIsRestricted(true);
                    setPaymentMethod('manual');
                }
            })
            .catch(() => setCustomerCountry('DEFAULT'));
    }, []);

    // Update restriction status when country changes manually
    const handleCountryChange = (code: string) => {
        setCustomerCountry(code);
        const restricted = RESTRICTED_COUNTRIES.includes(code);
        setIsRestricted(restricted);
        if (restricted) {
            setPaymentMethod('manual');
        } else {
            setPaymentMethod('stripe');
        }
        setSelectedLocalMethod(null);
    };

    const removeFromCart = (index: number) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        if (!isDirect) {
            localStorage.setItem('cart', JSON.stringify(newCart));
        } else {
            sessionStorage.setItem('direct_checkout_items', JSON.stringify(newCart));
            if (newCart.length === 0) {
                sessionStorage.removeItem('appointment_details');
            }
        }
    };

    const applyCoupon = async () => {
        if (!couponCode) return;
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, total: subtotal })
            });
            if (res.ok) {
                const data = await res.json();
                setDiscount(data.discount);
                showToast.success(`تم تطبيق الكوبون! خصم ${data.discount} $`);
            } else {
                showToast.error('الكوبون غير صالح');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast.error('حجم الصورة أكبر من 5MB'); return; }
        setProofFile(file);
        const reader = new FileReader();
        reader.onload = () => setProofPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleCheckout = async () => {
        if (!formData.name || !formData.email) {
            showToast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (!agreeToTerms) {
            showToast.error('يرجى الموافقة على شروط الخدمة وسياسة الاسترداد');
            return;
        }

        if (!customerCountry) {
            showToast.error('يرجى اختيار دولتك');
            return;
        }

        setLoading(true);

        try {
            const affiliateRef = getCookie('aff_code') || sessionStorage.getItem('affiliate_ref') || localStorage.getItem('affiliate_ref');

            if (total === 0) {
                // Free Checkout Bypass
                const res = await fetch('/api/checkout/free', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerEmail: formData.email,
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        affiliateRef: affiliateRef
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!isDirect) localStorage.removeItem('cart');
                    else {
                        sessionStorage.removeItem('direct_checkout_items');
                        sessionStorage.removeItem('appointment_details');
                    }
                    router.push(`/success?order_id=${data.orderId}`);
                } else {
                    const error = await res.json();
                    alert(error.error || 'حدث خطأ في إنشاء الطلب المجاني');
                }
            } else if (paymentMethod === 'manual') {
                // Manual / Local Payment
                if (!selectedLocalMethod) {
                    showToast.error('يرجى اختيار وسيلة الدفع المحلية');
                    setLoading(false);
                    return;
                }
                if (!transactionRef) {
                    showToast.error('يرجى إدخال رقم العملية');
                    setLoading(false);
                    return;
                }
                if (!proofFile) {
                    showToast.error('يرجى رفع إيصال الدفع');
                    setLoading(false);
                    return;
                }

                // Upload proof image
                let proofUrl = '';
                if (proofFile) {
                    const fd = new FormData();
                    fd.append('file', proofFile);
                    fd.append('type', 'image');
                    const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                    if (upRes.ok) {
                        const d = await upRes.json();
                        proofUrl = d.url;
                    }
                }

                const res = await fetch('/api/orders/manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerName: formData.name,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                        country: customerCountry,
                        paymentProvider: selectedLocalMethod.id,
                        senderPhone,
                        transactionRef,
                        paymentProof: proofUrl,
                        paymentNotes,
                        affiliateRef: affiliateRef,
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (!isDirect) localStorage.removeItem('cart');
                    else {
                        sessionStorage.removeItem('direct_checkout_items');
                        sessionStorage.removeItem('appointment_details');
                    }
                    router.push(`/success?order_id=${data.orderId}&manual=true`);
                } else {
                    const error = await res.json();
                    alert(error.error || 'حدث خطأ في إنشاء الطلب');
                }
            } else if (paymentMethod === 'stripe') {
                const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerEmail: formData.email,
                        customerName: formData.name,
                        couponCode: discount > 0 ? couponCode : null,
                        appointmentDetails: appointmentDetails,
                        affiliateRef: affiliateRef
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    window.location.href = data.url;
                } else {
                    alert('حدث خطأ في إنشاء طلب الدفع عبر البطاقة');
                }
            } else if (paymentMethod === 'crypto') {
                const res = await fetch('/api/coinremitter/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerEmail: formData.email,
                        customerName: formData.name,
                        couponCode: discount > 0 ? couponCode : null,
                        appointmentDetails: appointmentDetails,
                        totalAmountInUsd: total,
                        affiliateRef: affiliateRef
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    router.push(`/checkout/crypto/${data.orderId}`);
                } else {
                    alert('حدث خطأ في إنشاء فاتورة العملات الرقمية. تأكد من إعدادات API.');
                }
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('حدث خطأ. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const total = subtotal - discount;

    const countryConfig = customerCountry ? getPaymentMethodsForCountry(customerCountry) : null;
    const localPrice = customerCountry
        ? convertCurrency(total, customerCountry)
        : { amount: total, currency: 'USD' };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
                    <p className="text-gray-600 mb-6">لم تضف أي منتجات بعد</p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-primary"
                    >
                        تصفح المنتجات
                    </button>
                </div>
            </div>
        );
    }

    const effectiveBrandColor = cart.find(item => item.brandColor)?.brandColor;

    return (
        <div
            className="min-h-screen bg-gray-50 py-12"
            style={effectiveBrandColor ? { '--brand': effectiveBrandColor } as React.CSSProperties : {}}
        >
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-primary-600, .text-primary-700 { color: ${effectiveBrandColor} !important; }
                    .text-primary-700 { filter: brightness(0.85); }
                    .bg-primary-600 { background-color: ${effectiveBrandColor} !important; }
                    .bg-primary-50 { background-color: ${effectiveBrandColor}15 !important; }
                    .border-primary-600 { border-color: ${effectiveBrandColor} !important; }
                    .ring-1.ring-primary-600, .ring-primary-600 { --tw-ring-color: ${effectiveBrandColor} !important; }
                    .focus\\:ring-primary-600:focus, .focus\\:ring-2:focus { --tw-ring-color: ${effectiveBrandColor} !important; }
                    .btn-primary { background-color: ${effectiveBrandColor} !important; border-color: ${effectiveBrandColor} !important; }
                    .btn-primary:hover { background-color: ${effectiveBrandColor} !important; filter: brightness(0.85); }
                    .shadow-primary-500\\/30 { --tw-shadow-color: ${effectiveBrandColor}4d !important; }
                    .hover\\:text-primary-600:hover { color: ${effectiveBrandColor} !important; }
                    a[class*="text-primary"] { color: ${effectiveBrandColor} !important; }
                    input[type="radio"].text-primary-600 { accent-color: ${effectiveBrandColor} !important; }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">إتمام عملية الشراء</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Customer Info */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm">1</span>
                                المعلومات الشخصية
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all text-left"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        dir="ltr"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">سيتم إرسال روابط التحميل وبيانات الدخول إلى هذا البريد</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all text-left"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                                {/* Country Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <FiGlobe className="inline ml-1" />
                                        الدولة *
                                    </label>
                                    <select
                                        value={customerCountry}
                                        onChange={(e) => handleCountryChange(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="">اختر دولتك</option>
                                        {Object.entries(paymentMethodsByCountry).map(([code, cfg]) => (
                                            <option key={code} value={code}>
                                                {COUNTRY_FLAGS[code] || '🌍'} {cfg.nameAr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FiShoppingCart className="text-primary-600" /> مراجعة المنتجات
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {cart.map((item, index) => (
                                    <div key={index} className="py-4 flex justify-between items-center group">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FiShoppingCart className="text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                                <span className="text-xs text-gray-400 capitalize">{item.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900">{item.price > 0 ? `${Number(item.price).toFixed(2)} $` : 'مجاني'}</span>
                                            <button onClick={() => removeFromCart(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manual Payment Section - Only shows for restricted countries */}
                        {paymentMethod === 'manual' && total > 0 && countryConfig && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm">3</span>
                                    الدفع المحلي — {COUNTRY_FLAGS[customerCountry] || '🌍'} {countryConfig.nameAr}
                                </h2>

                                {/* Notice */}
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                                    <strong>⚠️ ملاحظة:</strong> الدفع يتم مباشرة إلى محفظة المنصة. بعد التحقق من الدفعة سيتم تفعيل طلبك.
                                </div>

                                {/* Local Method Selection */}
                                {!selectedLocalMethod ? (
                                    <div className="grid gap-3">
                                        {countryConfig.methods.filter(m => m.enabled).map(method => (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedLocalMethod(method)}
                                                className="w-full bg-gray-50 hover:bg-primary-50 rounded-2xl border-2 border-gray-100 hover:border-primary-600 p-4 flex items-center gap-3.5 transition-all duration-200 group"
                                            >
                                                <span className="text-2xl">{method.icon}</span>
                                                <div className="text-right flex-1">
                                                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{method.nameAr}</p>
                                                    <p className="text-[11px] text-gray-400">{method.name}</p>
                                                </div>
                                                <FiArrowRight className="text-gray-300 group-hover:text-primary-600 transition-colors rotate-180" size={16} />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Change Method Button */}
                                        <button
                                            onClick={() => setSelectedLocalMethod(null)}
                                            className="text-xs text-gray-400 hover:text-primary-600 font-medium flex items-center gap-1"
                                        >
                                            <FiArrowRight size={14} />
                                            تغيير وسيلة الدفع
                                        </button>

                                        {/* Selected Method + Amount */}
                                        <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border border-primary-600/10 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xl">{selectedLocalMethod.icon}</span>
                                                <span className="font-bold text-sm">{selectedLocalMethod.nameAr}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">المبلغ المطلوب:</p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {formatCurrency(localPrice.amount, localPrice.currency)}
                                            </p>
                                            {localPrice.currency !== 'USD' && (
                                                <p className="text-xs text-gray-400 mt-1">≈ ${total.toFixed(2)} USD</p>
                                            )}
                                        </div>

                                        {/* Platform Wallet */}
                                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                                            <label className="text-xs text-gray-400 font-medium block mb-1.5">رقم محفظة المنصة ({selectedLocalMethod.nameAr})</label>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-white rounded-xl px-3.5 py-3 font-mono text-base font-bold text-gray-900 tracking-wider text-left border border-gray-100" dir="ltr">
                                                    {PLATFORM_WALLETS[selectedLocalMethod.id] || '—'}
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(PLATFORM_WALLETS[selectedLocalMethod.id] || '')}
                                                    className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white hover:opacity-90 active:scale-95'}`}
                                                >
                                                    {copied ? <FiCheck size={18} /> : <FiCopy size={16} />}
                                                </button>
                                            </div>
                                            {copied && <p className="text-[11px] text-emerald-500 mt-1.5 font-medium">✓ تم النسخ</p>}
                                        </div>

                                        {/* Manual Payment Form Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-1">رقم هاتف المُرسل</label>
                                                <input
                                                    type="tel"
                                                    value={senderPhone}
                                                    onChange={e => setSenderPhone(e.target.value)}
                                                    placeholder="الرقم الذي حوّلت منه"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all text-left"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                                    رقم العملية <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={transactionRef}
                                                    onChange={e => setTransactionRef(e.target.value)}
                                                    placeholder="Transaction ID / رقم المرجع"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all text-left"
                                                    dir="ltr"
                                                    required
                                                />
                                            </div>

                                            {/* Receipt Upload */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                                    إيصال الدفع <span className="text-red-500">*</span>
                                                </label>
                                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                                                {proofPreview ? (
                                                    <div className="relative">
                                                        <img src={proofPreview} alt="إيصال" className="w-full rounded-xl border border-gray-200 max-h-44 object-cover" />
                                                        <button
                                                            onClick={() => { setProofFile(null); setProofPreview(null); }}
                                                            className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary-600/40 hover:bg-primary-50 transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                                            <FiUpload className="text-gray-400 group-hover:text-primary-600" size={20} />
                                                        </div>
                                                        <p className="text-xs text-gray-400 group-hover:text-primary-600 font-medium">اضغط لرفع صورة الإيصال</p>
                                                        <p className="text-[10px] text-gray-300">PNG, JPG حتى 5MB</p>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-1">ملاحظات (اختياري)</label>
                                                <textarea
                                                    value={paymentNotes}
                                                    onChange={e => setPaymentNotes(e.target.value)}
                                                    placeholder="أي معلومات إضافية..."
                                                    rows={2}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50 sticky top-24">
                            <h2 className="text-2xl font-bold mb-8">ملخص الطلب</h2>

                            {/* Coupon Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">هل لديك كود خصم؟</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="كود الخصم"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-600 transition-all font-mono"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2"
                                    >
                                        <FiTag /> تطبيق
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-500">
                                    <span>المجموع الفرعي</span>
                                    <span>{subtotal.toFixed(2)} $</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>الخصم</span>
                                    <span>-{discount.toFixed(2)} $</span>
                                </div>
                                <div className="h-px bg-gray-100 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">الإجمالي</span>
                                    <span className="text-3xl font-black text-primary-700">{total.toFixed(2)} $</span>
                                </div>

                                {/* Mix of Free and Paid Alert */}
                                {cart.some(item => item.price === 0) && cart.some(item => item.price > 0) && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 leading-relaxed font-bold">
                                        💡 ملاحظة: سلتك تحتوي على منتجات مجانية ومدفوعة. المنتجات المجانية ستظهر في حسابك فوراً بعد إتمام الطلب، بينما المدفوعة ستنتظر تأكيد الدفع.
                                    </div>
                                )}

                                {/* Show local currency equivalent for restricted countries */}
                                {isRestricted && localPrice.currency !== 'USD' && total > 0 && (
                                    <div className="text-sm text-gray-400 text-left">
                                        ≈ {formatCurrency(localPrice.amount, localPrice.currency)}
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            {total > 0 && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">وسيلة الدفع</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Stripe - only for non-restricted */}
                                        {!isRestricted && (
                                            <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    value="stripe"
                                                    checked={paymentMethod === 'stripe'}
                                                    onChange={() => setPaymentMethod('stripe')}
                                                    className="w-4 h-4 text-primary-600"
                                                />
                                                <FiCreditCard className="text-xl ml-3 text-primary-600" />
                                                <div className="flex-1 mr-2">
                                                    <span className="font-bold block text-sm">البطاقة البنكية (Visa/Mastercard)</span>
                                                    <span className="text-xs text-gray-500">دفع سريع وآمن عبر Stripe</span>
                                                </div>
                                            </label>
                                        )}

                                        {/* Crypto - available for all */}
                                        <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                value="crypto"
                                                checked={paymentMethod === 'crypto'}
                                                onChange={() => setPaymentMethod('crypto')}
                                                className="w-4 h-4 text-primary-600"
                                            />
                                            <span className="text-xl mx-2">🪙</span>
                                            <div className="flex-1 mr-2">
                                                <span className="font-bold block text-sm">عملات رقمية (USDT)</span>
                                                <span className="text-xs text-gray-500">دفع عبر شبكة TRC20</span>
                                            </div>
                                        </label>

                                        {/* Manual/Local - always shown, auto-selected for restricted */}
                                        <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                value="manual"
                                                checked={paymentMethod === 'manual'}
                                                onChange={() => setPaymentMethod('manual')}
                                                className="w-4 h-4 text-primary-600"
                                            />
                                            <span className="text-xl mx-2">💵</span>
                                            <div className="flex-1 mr-2">
                                                <span className="font-bold block text-sm">
                                                    دفع محلي {customerCountry && countryConfig ? `(${countryConfig.nameAr})` : ''}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {isRestricted ? 'شام كاش، MTN، زين كاش...' : 'تحويل يدوي عبر محفظة محلية'}
                                                </span>
                                            </div>
                                            {isRestricted && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">مطلوب</span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                             {/* Terms & Conditions */}
                             <div className="mb-6 flex items-start gap-2.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                 <input
                                     type="checkbox"
                                     id="terms"
                                     checked={agreeToTerms}
                                     onChange={(e) => setAgreeToTerms(e.target.checked)}
                                     className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-600 cursor-pointer"
                                 />
                                 <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                                     أنا أوافق على <a href="/terms" target="_blank" className="text-primary-600 font-bold hover:underline">شروط الخدمة</a> و <a href="/refund-policy" target="_blank" className="text-primary-600 font-bold hover:underline">سياسة الاسترداد</a>. 
                                     أفهم أن هذا المحتوى رقمي وغير قابل للإرجاع بمجرد بدء التحميل أو المشاهدة.
                                 </label>
                             </div>

                             {/* Pay Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-2 mt-4"
                            >
                                <FiCreditCard />
                                <span>{loading ? 'جاري التحويل...' : (total === 0 ? 'إتمام الطلب مجاناً' : 'الدفع الآن')}</span>
                            </button>

                            {/* Security */}
                            {total > 0 && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <FiLock />
                                    <span>{paymentMethod === 'manual' ? 'الدفع يتم للمنصة مباشرة — نظام Escrow آمن' : 'دفع آمن ومشفر بواسطة Stripe'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="mt-16 py-8 text-center border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    مدعوم من <a href="https://tmleen.com" className="text-primary-600 font-bold hover:underline">منصة تمالين</a>
                </p>
            </footer>
        </div>
    );
}
