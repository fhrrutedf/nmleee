'use client';

import { useCart } from '@/app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function CartDrawer() {
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

    const groupedBySeller = items.reduce((acc, item) => {
        if (!acc[item.sellerId]) {
            acc[item.sellerId] = {
                sellerName: item.sellerName,
                sellerUsername: item.sellerUsername,
                items: []
            };
        }
        acc[item.sellerId].items.push(item);
        return acc;
    }, {} as Record<string, { sellerName: string; sellerUsername: string; items: typeof items }>);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#7c3aed] flex items-center justify-center">
                                    <FiShoppingBag className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">سلة المشتريات</h2>
                                    <p className="text-xs text-gray-400">{totalItems} منتج</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <FiX className="text-gray-400" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {items.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <FiShoppingBag className="text-gray-400" size={32} />
                                    </div>
                                    <p className="text-gray-400">السلة فارغة</p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-4 text-sm text-[#10B981] hover:underline"
                                    >
                                        مواصلة التسوق ←
                                    </button>
                                </div>
                            ) : (
                                Object.entries(groupedBySeller).map(([sellerId, { sellerName, sellerUsername, items: sellerItems }]) => (
                                    <div key={sellerId} className="bg-white/5 rounded-xl p-4">
                                        {/* Seller Header */}
                                        <Link 
                                            href={`/${sellerUsername}`}
                                            className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
                                                {sellerName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-white text-sm">{sellerName}</span>
                                            <FiArrowRight className="text-gray-400 mr-auto" size={14} />
                                        </Link>

                                        {/* Seller Items */}
                                        <div className="space-y-3">
                                            {sellerItems.map(item => (
                                                <div key={item.id} className="flex gap-3">
                                                    {/* Image */}
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FiShoppingBag className="text-gray-500" size={20} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {item.isFree ? 'مجاني' : `${item.price} $`}
                                                        </p>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                            >
                                                                <FiMinus size={12} className="text-white" />
                                                            </button>
                                                            <span className="text-white text-sm w-6 text-center">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                            >
                                                                <FiPlus size={12} className="text-white" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-gray-400 hover:text-red-400 transition-colors self-start"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-white/10 p-4 space-y-3">
                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">المجموع:</span>
                                    <span className="text-xl font-bold text-white">{totalPrice.toFixed(2)} $</span>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#7c3aed] text-white font-bold text-center block hover:opacity-90 transition-opacity"
                                    >
                                        إتمام الشراء →
                                    </Link>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={clearCart}
                                            className="flex-1 py-2 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors"
                                        >
                                            تفريغ السلة
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 py-2 rounded-xl bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors"
                                        >
                                            مواصلة التسوق
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
