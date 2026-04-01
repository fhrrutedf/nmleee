'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface BuyNowButtonProps {
    product: {
        id: string;
        title: string;
        price: number;
        slug?: string;
    };
    seller: {
        id: string;
        username: string;
        name: string;
    };
    variant?: 'default' | 'small' | 'full';
    brandColor?: string;
}

export default function BuyNowButton({ 
    product, 
    seller,
    variant = 'default',
    brandColor = '#10B981'
}: BuyNowButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleBuyNow = async () => {
        setIsLoading(true);
        
        try {
            // Create a temporary order or redirect to checkout with pre-filled product
            const checkoutData = {
                items: [{
                    productId: product.id,
                    type: 'product',
                    title: product.title,
                    price: product.price,
                    quantity: 1,
                    sellerId: seller.id,
                    sellerName: seller.name,
                    sellerUsername: seller.username
                }],
                total: product.price,
                isBuyNow: true
            };

            // Store checkout data in sessionStorage
            sessionStorage.setItem('buyNowCheckout', JSON.stringify(checkoutData));
            
            // Redirect to checkout
            router.push('/checkout?mode=buynow');
            
        } catch (error) {
            toast.error('حدث خطأ أثناء معالجة طلبك');
            setIsLoading(false);
        }
    };

    const buttonStyles = {
        default: 'px-6 py-3 text-base',
        small: 'px-4 py-2 text-sm',
        full: 'w-full py-3 text-base'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            disabled={isLoading}
            className={`
                relative overflow-hidden font-bold rounded-xl
                flex items-center justify-center gap-2
                ${buttonStyles[variant]}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}
                transition-all
            `}
            style={{ 
                background: `linear-gradient(135deg, ${brandColor}, #7c3aed)`,
                color: 'white'
            }}
        >
            {isLoading ? (
                <>
                    <FiLoader className="animate-spin" />
                    <span>جاري التحويل...</span>
                </>
            ) : (
                <>
                    <FiZap />
                    <span>اشترِ الآن</span>
                </>
            )}
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        </motion.button>
    );
}
