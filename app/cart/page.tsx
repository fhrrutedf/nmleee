'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
        setLoading(false);
    }, []);

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const clearCart = () => {
        if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
            setCart([]);
            localStorage.removeItem('cart');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShoppingCart className="text-4xl text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">سلة المشتريات فارغة</h1>
                    <p className="text-gray-500 mb-8">لم تضف أي منتجات للسلة بعد. تصفح منتجاتنا وابدأ التسوق!</p>
                    <Link href="/products" className="btn btn-primary w-full flex items-center justify-center gap-2">
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    const effectiveBrandColor = cart.find(item => item.brandColor)?.brandColor;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-primary-600 { color: ${effectiveBrandColor} !important; }
                    .text-primary-700 { color: ${effectiveBrandColor} !important; filter: brightness(0.8); }
                    .bg-primary-600 { background-color: ${effectiveBrandColor} !important; }
                    .btn-primary { background-color: ${effectiveBrandColor} !important; border-color: ${effectiveBrandColor} !important; }
                    .shadow-primary-500\\/30 { --tw-shadow-color: ${effectiveBrandColor}4d !important; }
                    .hover\\:text-primary-600:hover { color: ${effectiveBrandColor} !important; }
                    `
                }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">سلة المشتريات ({cart.length})</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                        <FiTrash2 /> إفراغ السلة
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center group hover:shadow-md transition-shadow">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiShoppingCart className="text-2xl text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{item.category || 'منتج عام'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                            title="حذف من السلة"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-bold text-lg text-primary-600">
                                            {item.price > 0 ? `${item.price.toFixed(2)} ج.م` : 'مجاني'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-900">ملخص الطلب</h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>المجموع الفرعي</span>
                                    <span>{subtotal.toFixed(2)} ج.م</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>الخصم</span>
                                    <span>0.00 ج.م</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-gray-900">الإجمالي</span>
                                <span className="text-2xl font-bold text-primary-700">{subtotal.toFixed(2)} ج.م</span>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full btn btn-primary py-4 text-lg font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                            >
                                <span>إتمام عملية الدفع</span>
                                <FiArrowRight className="rtl:rotate-180" />
                            </button>

                            <div className="mt-4 text-center">
                                <Link href="/products" className="text-sm text-gray-500 hover:text-primary-600 underline">
                                    الاستمرار في التسوق
                                </Link>
                            </div>
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
