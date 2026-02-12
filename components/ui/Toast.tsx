'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="flex items-center justify-between p-4 rounded-lg bg-white shadow-lg border border-gray-100 min-w-[320px] relative overflow-hidden"
                            layout
                        >
                            {/* Accent bar */}
                            <div className={`absolute right-0 top-0 bottom-0 w-1 ${toast.type === 'success' ? 'bg-green-500' :
                                    toast.type === 'error' ? 'bg-red-500' :
                                        'bg-action-blue'
                                }`} />

                            <div className="flex items-center gap-3">
                                <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600' :
                                        toast.type === 'error' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-action-blue'
                                    }`}>
                                    {toast.type === 'success' && <FiCheckCircle className="text-xl" />}
                                    {toast.type === 'error' && <FiAlertCircle className="text-xl" />}
                                    {toast.type === 'info' && <FiInfo className="text-xl" />}
                                </div>
                                <p className="font-medium text-gray-800 text-sm">{toast.message}</p>
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors mr-2"
                            >
                                <FiX />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
