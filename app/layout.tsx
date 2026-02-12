import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const readexPro = Readex_Pro({
    subsets: ["arabic", "latin"],
    variable: '--font-readex-pro',
    display: 'swap',
    weight: ['200', '300', '400', '500', '600', '700'],
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
            <body className={`${readexPro.variable} font-sans antialiased text-primary-charcoal bg-bg-light`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
