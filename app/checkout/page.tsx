'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiShoppingCart, FiTrash2, FiTag, FiCreditCard, FiLock } from 'react-icons/fi';

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

    // New payment flow state
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');

    useEffect(() => {
        if (isDirect) {
            // جلب بيانات الحجز المباشر من sessionStorage
            const directItems = JSON.parse(sessionStorage.getItem('direct_checkout_items') || '[]');
            const details = JSON.parse(sessionStorage.getItem('appointment_details') || 'null');
            setCart(directItems);
            setAppointmentDetails(details);
        } else {
            // جلب السلة من localStorage
            const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(savedCart);
        }
    }, [isDirect]);

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
                alert(`تم تطبيق الكوبون! خصم ${data.discount} ج.م`);
            } else {
                alert('الكوبون غير صالح');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
        }
    };

    const handleCheckout = async () => {
        if (!formData.name || !formData.email) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setLoading(true);

        try {
            const affiliateRef = sessionStorage.getItem('affiliate_ref') || localStorage.getItem('affiliate_ref');

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
                    if (!isDirect) {
                        localStorage.removeItem('cart');
                    } else {
                        sessionStorage.removeItem('direct_checkout_items');
                        sessionStorage.removeItem('appointment_details');
                    }
                    router.push(`/success?order_id=${data.orderId}`);
                } else {
                    const error = await res.json();
                    alert(error.error || 'حدث خطأ في إنشاء الطلب المجاني');
                }
            } else if (paymentMethod === 'stripe') {
                const res = await fetch('/api/stripe/create-checkout-session', {
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

    const effectiveBrandColor = cart[0]?.brandColor;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-primary-600 { color: ${effectiveBrandColor} !important; }
                    .bg-primary-600 { background-color: ${effectiveBrandColor} !important; }
                    .border-primary-600 { border-color: ${effectiveBrandColor} !important; }
                    .ring-primary-600 { --tw-ring-color: ${effectiveBrandColor} !important; }
                    .btn-primary { background-color: ${effectiveBrandColor} !important; border-color: ${effectiveBrandColor} !important; }
                    .shadow-primary-500\\/30 { --tw-shadow-color: ${effectiveBrandColor}4d !important; }
                    .bg-primary-50 { background-color: ${effectiveBrandColor}15 !important; }
                    .hover\\:text-primary-600:hover { color: ${effectiveBrandColor} !important; }
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
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all text-left"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        dir="ltr"
                                    />
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
                                            <span className="font-bold text-gray-900">{item.price > 0 ? `${Number(item.price).toFixed(2)} ج.م` : 'مجاني'}</span>
                                            <button onClick={() => removeFromCart(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="py-8 text-center text-gray-400">السلة فارغة</div>
                                )}
                            </div>
                        </div>
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
                                    <span>{subtotal.toFixed(2)} ج.م</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>الخصم</span>
                                    <span>-{discount.toFixed(2)} ج.م</span>
                                </div>
                                <div className="h-px bg-gray-100 my-4"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">الإجمالي</span>
                                    <span className="text-3xl font-black text-primary-700">{total.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            {/* طريقة الدفع */}
                            {total > 0 && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">وسيلة الدفع</h3>
                                    <div className="grid grid-cols-1 gap-3">
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
                                    </div>
                                </div>
                            )}

                            {/* زر الدفع */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-2 mt-4"
                            >
                                <FiCreditCard />
                                <span>{loading ? 'جاري التحويل...' : (total === 0 ? 'إتمام الطلب مجاناً' : 'الدفع الآن')}</span>
                            </button>

                            {/* الأمان */}
                            {total > 0 && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <FiLock />
                                    <span>دفع آمن ومشفر بواسطة Stripe</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="mt-16 py-8 text-center border-t border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    مدعوم من <a href="https://tmleen.com" className="text-primary-600 font-bold hover:underline">منصة تقانة</a>
                </p>
            </footer>
        </div>
    );
}
