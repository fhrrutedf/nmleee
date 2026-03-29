'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>(() => {
        if (typeof window === 'undefined') return [];
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            <div className="flex justify-center items-center min-h-screen bg-[#0A0A0A]">
                <div className="animate-spin rounded-xl h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
                <div className="bg-[#111111] p-10 rounded-2xl border border-white/10 shadow-2xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FiShoppingCart className="text-4xl text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">سلة المشتريات فارغة</h2>
                    <p className="text-gray-400 mb-8 font-medium">لم تضف أي منتجات للسلة بعد. ابدأ بناء إمبراطوريتك الآن.</p>
                    <Link href="/explore" className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">سلة المشتريات <span className="text-emerald-500 text-2xl ml-2">({cart.length})</span></h1>
                    <button
                        onClick={clearCart}
                        className="text-gray-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <FiTrash2 /> إفراغ السلة
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-center group hover:border-emerald-500/30 transition-all shadow-lg">
                                <div className="w-full sm:w-28 h-48 sm:h-28 bg-[#0A0A0A] border border-white/5 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiShoppingCart className="text-2xl text-gray-700" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-center sm:text-right w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-emerald-500 transition-colors">{item.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">{item.category || 'منتج رقمي'}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-gray-600 hover:text-red-500 p-2 transition-colors sm:self-start"
                                            title="حذف من السلة"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="mt-6 sm:mt-4">
                                        <span className="font-bold text-xl text-emerald-500">
                                            {item.price > 0 ? `${item.price.toFixed(2)} $` : 'مجاني'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 sticky top-32 shadow-2xl">
                            <h2 className="text-xl font-bold mb-8 text-white">ملخص الإمبراطورية</h2>

                            <div className="space-y-5 mb-8 pb-8 border-b border-white/5">
                                <div className="flex justify-between text-gray-400 text-sm font-medium">
                                    <span>المجموع الفرعي</span>
                                    <span className="text-white">{subtotal.toFixed(2)} $</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm font-medium">
                                    <span>رسوم النظام</span>
                                    <span className="text-emerald-500">مشمولة</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-10">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">الإجمالي النهائي</span>
                                <span className="text-3xl font-black text-emerald-500">{subtotal.toFixed(2)} $</span>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-emerald-500 text-white py-5 rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <span>إتمام العملية</span>
                                <FiArrowRight className="rtl:rotate-180" />
                            </button>

                            <div className="mt-6 text-center">
                                <Link href="/explore" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors">
                                    ← العودة للمتجر
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-32 py-12 text-center border-t border-white/5">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.3em]">
                    Institutional Grade Infrastructure by <span className="text-emerald-500">Tmleen</span>
                </p>
            </footer>
        </div>
    );
}
