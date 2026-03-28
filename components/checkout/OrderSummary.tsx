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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 space-y-10 sticky top-24">
            <div className="flex items-baseline justify-between overflow-hidden">
                <h2 className="text-xl font-bold text-ink tracking-tight">ملخص الطلب</h2>
                <span className="text-[10px] font-bold text-accent bg-accent-light px-3 py-1 rounded-full uppercase tracking-widest">
                    {items.length} Elements
                </span>
            </div>

            {/* Items List */}
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                {items.map((item, idx) => (
                    <div 
                        key={idx} 
                        className="flex gap-4 items-center group"
                    >
                        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-accent">
                                    <FiShoppingCart size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-ink truncate leading-tight mb-0.5">{item.title}</h4>
                            <span className="text-[10px] font-bold text-gray-400 font-inter uppercase tracking-widest">{item.type}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-ink font-mono font-inter">
                                {item.price > 0 ? `${item.price.toFixed(2)} $` : 'FREE'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coupon Section */}
            <div className="pt-8 border-t border-gray-50">
                <div className="relative group/input">
                    <input 
                        type="text" 
                        placeholder="هل لديك كود خصم؟"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all font-inter placeholder:text-gray-400"
                        value={couponCode}
                        onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
                    />
                    <div className="absolute top-1/2 left-1.5 -translate-y-1/2">
                        <button 
                            onClick={onApplyCoupon}
                            className="bg-accent text-white hover:bg-accent-hover px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                        >
                            تطبيق
                        </button>
                    </div>
                    <FiTag className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 group-focus-within/input:text-accent transition-colors" size={20} />
                </div>
            </div>

            {/* Final Totals */}
            <div className="space-y-4 pt-4">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span className="uppercase tracking-widest text-[10px] font-bold font-inter">Subtotal</span>
                    <span className="font-mono font-inter text-ink">{subtotal.toFixed(2)} $</span>
                </div>
                
                <AnimatePresence>
                    {discount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-sm font-bold text-accent bg-accent-light p-4 rounded-xl border border-accent/10"
                        >
                            <span className="flex items-center gap-1.5"><FiCheckCircle /> الخصم المُطبق</span>
                            <span className="font-mono font-inter">-{discount.toFixed(2)} $</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-px bg-gray-50 my-2"></div>
                
                <div className="flex justify-between items-center pb-4">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-400 font-inter uppercase tracking-[0.15em]">Total Amount</span>
                        <p className="text-[10px] text-gray-500">وصول فوري + حماية كاملة</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-ink tracking-tighter font-inter">
                            {total.toFixed(2)}
                            <span className="text-base font-bold text-gray-400 ml-1">$</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
                <button
                    onClick={onCheckout}
                    disabled={loading || disabled}
                    className="group relative w-full h-16 bg-ink text-white rounded-xl overflow-hidden shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="relative flex items-center justify-center gap-3 font-bold text-lg tracking-tight">
                        {loading ? (
                            <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {btnText}
                                <FiArrowRight className="group-hover:translate-x-[-8px] transition-transform" />
                            </>
                        )}
                    </div>
                </button>
                
                {/* Security Badges */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 group/badge transition-colors hover:bg-gray-100">
                        <FiShield className="text-accent group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-wider font-inter">Secure SSL<br/>Encryption</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 group/badge transition-colors hover:bg-gray-100">
                        <FiClock className="text-accent group-hover:scale-110 transition-transform" size={18} />
                        <span className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-wider font-inter">Instant<br/>Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
