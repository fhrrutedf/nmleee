'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { FiShoppingCart, FiX, FiTrash2 } from 'react-icons/fi';
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

    return (
        <>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
                <FiShoppingCart size={24} />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-900">
                            السلة ({itemCount})
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <FiShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">السلة فارغة</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        {item.image && (
                                            <div className="relative w-20 h-20 flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {item.type === 'course' ? 'كورس' : 'منتج'}
                                            </p>
                                            <p className="text-lg font-bold text-indigo-600 mt-1">
                                                {item.price.toFixed(2)} ج.م
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg h-fit transition-colors"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t p-4 space-y-4">
                            <div className="flex items-center justify-between text-lg">
                                <span className="font-medium text-gray-700">الإجمالي:</span>
                                <span className="font-bold text-gray-900">
                                    {getTotal().toFixed(2)} ج.م
                                </span>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={() => setIsOpen(false)}
                                className="block w-full py-3 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                إتمام الشراء
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
