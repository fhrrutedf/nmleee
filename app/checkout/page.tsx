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
            const res = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customerEmail: formData.email,
                    customerName: formData.name,
                    couponCode: discount > 0 ? couponCode : null,
                    appointmentDetails: appointmentDetails
                })
            });

            if (res.ok) {
                const data = await res.json();
                // إعادة توجيه لـ Stripe
                window.location.href = data.url;
            } else {
                alert('حدث خطأ في إنشاء طلب الدفع');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('حدث خطأ. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
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

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* الطلب */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* معلومات المشتري */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">معلومات المشتري</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم الكامل <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الهاتف
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input w-full"
                                        placeholder="+20 123 456 7890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* المنتجات */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">المنتجات ({cart.length})</h2>
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <FiShoppingCart className="text-2xl text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.title}</h3>
                                            <p className="text-primary-600 font-bold">{item.price.toFixed(2)} ج.م</p>
                                            {item.type === 'appointment' && appointmentDetails && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    بتاريخ: {appointmentDetails.date} | الساعة {appointmentDetails.time}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Return path for direct booking */}
                            {isDirect && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => router.back()}
                                        className="text-sm text-gray-500 hover:text-primary-600 underline"
                                    >
                                        إلغاء الحجز والعودة
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* الملخص */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>

                            {/* كوبون الخصم */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiTag className="inline ml-1" />
                                    كوبون الخصم
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="input flex-1"
                                        placeholder="COUPON123"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        className="btn btn-outline"
                                    >
                                        تطبيق
                                    </button>
                                </div>
                            </div>

                            {/* الأسعار */}
                            <div className="space-y-3 mb-6 pb-6 border-b">
                                <div className="flex justify-between text-gray-600">
                                    <span>المجموع الفرعي</span>
                                    <span>{subtotal.toFixed(2)} ج.م</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>الخصم</span>
                                        <span>-{discount.toFixed(2)} ج.م</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold">
                                    <span>الإجمالي</span>
                                    <span className="text-primary-600">{total.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            {/* زر الدفع */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full btn btn-primary text-lg py-4 flex items-center justify-center gap-2"
                            >
                                <FiCreditCard />
                                <span>{loading ? 'جاري التحويل...' : 'الدفع الآن'}</span>
                            </button>

                            {/* الأمان */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <FiLock />
                                <span>دفع آمن ومشفر بواسطة Stripe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
