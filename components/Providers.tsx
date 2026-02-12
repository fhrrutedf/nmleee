'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from './ui/Toast';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from '@/context/I18nContext';
import { CartProvider } from '@/contexts/CartContext';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <I18nProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <CartProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </CartProvider>
                </ThemeProvider>
            </I18nProvider>
        </SessionProvider>
    );
}
