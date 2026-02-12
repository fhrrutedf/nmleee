'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    id: string;
    type: 'product' | 'course';
    title: string;
    price: number;
    image?: string;
    slug?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (item: CartItem) => {
        setItems((prevItems) => {
            // Check if already in cart
            const exists = prevItems.find((i) => i.id === item.id);
            if (exists) {
                return prevItems;
            }
            return [...prevItems, item];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotal = () => {
        return items.reduce((total, item) => total + item.price, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                clearCart,
                getTotal,
                itemCount: items.length,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
