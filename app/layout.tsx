import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from 'react-hot-toast';
import NavbarWrapper from "@/app/components/NavbarWrapper";
import FooterWrapper from "@/app/components/FooterWrapper";

const tajawal = Tajawal({
    subsets: ["arabic", "latin"],
    variable: '--font-tajawal',
    display: 'swap',
    weight: ['200', '300', '400', '500', '700', '800', '900'],
    preload: false,
    fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
    title: "منصة المنتجات الرقمية - بيع منتجاتك بكل سهولة",
    description: "منصة متكاملة لبيع المنتجات الرقمية والدورات التدريبية مع نظام دفع وحجز مواعيد احترافي",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${tajawal.variable} font-sans antialiased text-primary-charcoal bg-bg-light flex flex-col min-h-screen`}>
                <Providers>
                    <NavbarWrapper />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <FooterWrapper />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                direction: 'rtl',
                                fontFamily: 'var(--font-tajawal)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                            },
                            success: {
                                style: {
                                    background: '#f0fdf4',
                                    color: '#166534',
                                    border: '1px solid #bbf7d0',
                                },
                                iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
                            },
                            error: {
                                style: {
                                    background: '#fef2f2',
                                    color: '#991b1b',
                                    border: '1px solid #fecaca',
                                },
                                iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
