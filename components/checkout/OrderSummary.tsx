'use client';

import { FiShoppingCart, FiTag, FiLock, FiCheckCircle, FiShield, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
    id: string;
    title: string;
    price: number;
    image?: string;
    brandColor?: string;
    type: string;
}

interface OrderSummaryProps {
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    couponCode: string;
    onCouponChange: (code: string) => void;
    onApplyCoupon: () => void;
    loading?: boolean;
    btnText: string;
    onCheckout: () => void;
    disabled?: boolean;
}

export default function OrderSummary({
    items,
    subtotal,
    discount,
    total,
    couponCode,
    onCouponChange,
    onApplyCoupon,
    loading,
    btnText,
    onCheckout,
    disabled
}: OrderSummaryProps) {
    return (
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 shadow-premium shadow-slate-200/50 p-8 space-y-8 sticky top-24">
            <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">ملخص الطلب</h2>
                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{items.length} منتجات</span>
            </div>

            {/* Items List */}
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center group">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <FiShoppingCart size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate leading-tight mb-0.5">{item.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900">
                                {item.price > 0 ? `${item.price.toFixed(2)} $` : 'مجاني'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coupon Section */}
            <div className="pt-6 border-t border-slate-100">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        placeholder="هل لديك كود خصم؟"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 pr-14 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-indigo-500/10 focus:border-primary-indigo-500 transition-all font-mono"
                        value={couponCode}
                        onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                    />
                    <div className="absolute top-1/2 left-2 -translate-y-1/2">
                        <button 
                            onClick={onApplyCoupon}
                            className="bg-primary-charcoal text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-black/10"
                        >
                            تطبيق
                        </button>
                    </div>
                    <FiTag className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary-indigo-500 transition-colors" size={20} />
                </div>
            </div>

            {/* Final Totals */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>المجموع الفرعي</span>
                    <span className="font-mono">{subtotal.toFixed(2)} $</span>
                </div>
                
                <AnimatePresence>
                    {discount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-sm font-bold text-success-green bg-success-green/5 p-3 rounded-xl border border-success-green/10"
                        >
                            <span className="flex items-center gap-1.5"><FiCheckCircle /> الخصم المُطبق</span>
                            <span className="font-mono">-{discount.toFixed(2)} $</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-px bg-slate-100 my-2"></div>
                
                <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-400">الإجمالي النهائي</span>
                        <p className="text-[10px] text-slate-400 font-medium">شامل ضرائب ورسوم المنصة</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">
                            {total.toFixed(2)}
                            <span className="text-lg font-bold text-slate-400 ml-1">$</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-4">
                <button
                    onClick={onCheckout}
                    disabled={loading || disabled}
                    className="group relative w-full h-16 bg-primary-charcoal text-white rounded-3xl overflow-hidden shadow-2xl shadow-primary-charcoal/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo-500 to-action-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2 font-black text-xl tracking-tight">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {btnText}
                                <span className="text-sm opacity-50 font-medium">(آمن تماماً)</span>
                            </>
                        )}
                    </div>
                </button>
                
                {/* Security Badges */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 group/badge">
                        <FiShield className="text-primary-indigo-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-600 leading-tight">تشفير SSL بنكي آمن</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 group/badge">
                        <FiClock className="text-primary-indigo-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-600 leading-tight">وصول فوري للمحتوى</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
