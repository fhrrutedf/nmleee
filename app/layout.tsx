import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from 'react-hot-toast';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const tajawal = Tajawal({
    subsets: ["arabic", "latin"],
    variable: '--font-tajawal',
    display: 'swap',
    weight: ['200', '300', '400', '500', '700', '800', '900'],
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
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
