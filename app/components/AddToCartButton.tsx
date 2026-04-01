'use client';

import { useCart } from '@/app/context/CartContext';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';

interface AddToCartButtonProps {
    product: {
        id: string;
        title: string;
        price: number;
        originalPrice?: number | null;
        image?: string | null;
        isFree?: boolean;
        slug?: string;
        category?: string;
        user: {
            id: string;
            name: string;
            username: string;
        };
    };
    variant?: 'default' | 'small' | 'icon';
    className?: string;
    brandColor?: string;
}

export default function AddToCartButton({ 
    product, 
    variant = 'default', 
    className = '',
    brandColor = '#10B981'
}: AddToCartButtonProps) {
    const { addItem, items } = useCart();
    
    const isInCart = items.some(item => item.id === product.id);

    const handleAddToCart = () => {
        const type = product.category === 'courses' || product.category === 'course' ? 'course' : 'product';
        
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image || undefined,
            sellerId: product.user.id,
            sellerName: product.user.name,
            sellerUsername: product.user.username,
            type,
            slug: product.slug,
            isFree: product.isFree || false,
            quantity: 1
        });
    };

    // Small icon-only variant for product cards
    if (variant === 'icon') {
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart();
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isInCart 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                } ${className}`}
                title={isInCart ? 'في السلة' : 'أضف للسلة'}
            >
                {isInCart ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
            </motion.button>
        );
    }

    // Small compact variant
    if (variant === 'small') {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    isInCart 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                } ${className}`}
            >
                {isInCart ? <FiCheck size={12} /> : <FiShoppingCart size={12} />}
                {isInCart ? 'في السلة' : 'أضف للسلة'}
            </motion.button>
        );
    }

    // Default full button
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isInCart 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'text-white'
            } ${className}`}
            style={!isInCart ? { background: `linear-gradient(135deg, ${brandColor}, #7c3aed)` } : {}}
        >
            {isInCart ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
            {isInCart ? 'في السلة' : 'أضف للسلة'}
        </motion.button>
    );
}
