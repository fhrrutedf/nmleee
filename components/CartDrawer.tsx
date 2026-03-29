'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { FiShoppingCart, FiX, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
    const { items, removeFromCart, getTotal, itemCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 text-gray-700 hover:text-[#10B981] transition-all bg-[#111111] hover:bg-[#0A0A0A] rounded-xl border border-transparent hover:border-gray-100 hover:shadow-lg shadow-[#10B981]/20 group"
            >
                <FiShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] font-bold rounded-xl w-5 h-5 flex items-center justify-center ring-2 ring-white">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Backdrop & Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40  z-[100]"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0A0A] shadow-lg shadow-[#10B981]/20 z-[101] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-700/10 rounded-xl flex items-center justify-center text-[#10B981]">
                                        <FiShoppingBag size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-[#10B981]">
                                        سلة المشتريات
                                        <span className="text-sm font-bold text-gray-400 mr-2">({itemCount})</span>
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-emerald-800 rounded-xl text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 bg-[#111111] rounded-xl flex items-center justify-center mb-6 text-gray-300">
                                            <FiShoppingCart size={48} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">سلتك فارغة حالياً</h3>
                                        <p className="text-gray-500 text-sm max-w-[200px] mb-8">استكشف المنتجات الرقمية والدورات المميزة وأضفها هنا.</p>
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="font-bold text-[#10B981] hover:underline"
                                        >
                                            تصفح المتجر الآن
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={item.id}
                                                className="flex gap-4 p-4 bg-[#0A0A0A] border border-gray-100 rounded-[1.5rem] hover:shadow-lg shadow-[#10B981]/20 hover:shadow-gray-200/50 transition-all group"
                                            >
                                                {item.image && (
                                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-[#10B981]/20">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-[#10B981] truncate mb-0.5">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-xs font-bold text-gray-400 mb-2">
                                                        {item.type === 'course' ? '📚 دورة تدريبية' : '📦 منتج رقمي'}
                                                    </p>
                                                    <p className="text-lg font-bold text-[#10B981]">
                                                        {item.price === 0 ? 'مجاني' : `${item.price.toFixed(2)} $`}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl h-fit transition-all"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Summary */}
                            {items.length > 0 && (
                                <div className="p-6 border-t border-gray-100 bg-[#111111]/50 ">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-gray-500 font-bold">إجمالي المبلغ:</span>
                                        <span className="text-2xl font-bold text-[#10B981]">
                                            {getTotal().toFixed(2)} <span className="text-sm">$</span>
                                        </span>
                                    </div>
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="group w-full py-4 bg-emerald-700 text-white flex items-center justify-center gap-2 rounded-[1.25rem] font-bold text-lg shadow-lg shadow-[#10B981]/20 shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1 transition-all"
                                    >
                                        <span>إتمام الشراء</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform rotate-180" />
                                    </Link>
                                    <p className="text-center text-[10px] text-gray-400 mt-4 px-4 font-medium uppercase tracking-wider">
                                        🔒 دفع آمن ومشفر بنسبة 100%
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
