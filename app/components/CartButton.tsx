'use client';

import { useCart } from '@/app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';

interface CartButtonProps {
    className?: string;
    variant?: 'header' | 'floating' | 'minimal';
}

export default function CartButton({ className = '', variant = 'header' }: CartButtonProps) {
    const { totalItems, setIsOpen } = useCart();

    if (variant === 'floating') {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed left-6 bottom-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#10B981] to-[#7c3aed] shadow-lg shadow-[#10B981]/30 flex items-center justify-center ${className}`}
            >
                <FiShoppingCart className="text-white" size={24} />
                <AnimatePresence>
                    {totalItems > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                        >
                            {totalItems > 99 ? '99+' : totalItems}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        );
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`relative p-2 hover:bg-white/5 rounded-lg transition-colors ${className}`}
            >
                <FiShoppingCart className="text-gray-400" size={20} />
                {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                )}
            </button>
        );
    }

    // Header variant (default)
    return (
        <button
            onClick={() => setIsOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors ${className}`}
        >
            <FiShoppingCart className="text-gray-300" size={18} />
            <span className="text-gray-300 text-sm hidden sm:inline">السلة</span>
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#10B981] to-[#7c3aed] rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
}
