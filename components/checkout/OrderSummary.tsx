'use client';

import { FiShoppingCart, FiTag, FiLock, FiCheckCircle, FiShield, FiClock, FiArrowRight } from 'react-icons/fi';
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
        <div className="bg-[#111827]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl p-8 space-y-10 sticky top-24">
            <div className="flex items-baseline justify-between overflow-hidden">
                <h2 className="text-2xl font-black text-white tracking-tight">ملخص الطلب</h2>
                <motion.span 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest"
                >
                    {items.length} Elements
                </motion.span>
            </div>

            {/* Items List */}
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                {items.map((item, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 items-center group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0 relative">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-emerald-500 font-black">
                                    <FiShoppingCart size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate leading-tight mb-0.5">{item.title}</h4>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.type}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-white font-mono">
                                {item.price > 0 ? `${item.price.toFixed(2)} $` : 'FREE'}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Coupon Section */}
            <div className="pt-8 border-t border-white/5">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        placeholder="هل لديك كود خصم؟"
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 pr-14 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-mono placeholder:text-slate-600"
                        value={couponCode}
                        onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                    />
                    <div className="absolute top-1/2 left-2 -translate-y-1/2">
                        <button 
                            onClick={onApplyCoupon}
                            className="bg-emerald-500 text-white hover:bg-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
                        >
                            تطبيق
                        </button>
                    </div>
                    <FiTag className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors" size={22} />
                </div>
            </div>

            {/* Final Totals */}
            <div className="space-y-5 pt-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span className="uppercase tracking-widest text-[10px] font-black">Subtotal</span>
                    <span className="font-mono text-white">{subtotal.toFixed(2)} $</span>
                </div>
                
                <AnimatePresence>
                    {discount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-sm font-bold text-emerald-400 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10"
                        >
                            <span className="flex items-center gap-1.5"><FiCheckCircle /> الخصم المُطبق</span>
                            <span className="font-mono">-{discount.toFixed(2)} $</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-px bg-white/5 my-4"></div>
                
                <div className="flex justify-between items-end pb-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount</span>
                        <p className="text-[9px] text-slate-600 font-bold">شامل الضرائب والوصول الفوري</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black text-white tracking-tighter">
                            {total.toFixed(2)}
                            <span className="text-lg font-black text-emerald-500 ml-1">$</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
                <button
                    onClick={onCheckout}
                    disabled={loading || disabled}
                    className="group relative w-full h-20 bg-emerald-600 text-white rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-3 font-black text-xl tracking-tight">
                        {loading ? (
                            <div className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {btnText}
                                <FiArrowRight className="group-hover:translate-x-[-10px] transition-transform" />
                            </>
                        )}
                    </div>
                </button>
                
                {/* Security Badges */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group/badge transition-colors hover:bg-white/10">
                        <FiShield className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                        <span className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-wider">Secure SSL<br/>Encryption</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group/badge transition-colors hover:bg-white/10">
                        <FiClock className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                        <span className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-wider">Instant<br/>Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
