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
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
