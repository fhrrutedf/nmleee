'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number | null;
    image?: string;
    sellerId: string;
    sellerName: string;
    sellerUsername: string;
    type: 'product' | 'course';
    slug?: string;
    isFree: boolean;
    quantity?: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (itemId: string) => void;
    removeFromCart: (itemId: string) => void; // alias
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    totalItems: number;
    itemCount: number; // alias
    totalPrice: number;
    getTotal: () => number; // alias
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tmleen_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setItems(parsed);
            } catch {
                console.error('Failed to parse cart');
            }
        }
        setIsLoading(false);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isLoading]);

    const addItem = useCallback((item: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                toast.success('تم تحديث الكمية في السلة');
                return prev.map(i => 
                    i.id === item.id 
                        ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
                        : i
                );
            }
            toast.success('تم إضافة المنتج للسلة');
            return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
        setIsOpen(true);
    }, []);

    const removeItem = useCallback((itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
        toast.success('تم إزالة المنتج من السلة');
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }
        setItems(prev => 
            prev.map(i => i.id === itemId ? { ...i, quantity } : i)
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
        toast.success('تم تفريغ السلة');
    }, []);

    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = items.reduce((sum, item) => {
        if (item.isFree) return sum;
        return sum + (item.price * (item.quantity || 1));
    }, 0);

    // Aliases for compatibility with existing components
    const removeFromCart = removeItem;
    const getTotal = () => totalPrice;
    const itemCount = totalItems;

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            removeFromCart,
            updateQuantity,
            clearCart,
            isOpen,
            setIsOpen,
            totalItems,
            itemCount,
            totalPrice,
            getTotal,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
