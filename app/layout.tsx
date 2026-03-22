import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from 'react-hot-toast';
import NavbarWrapper from "@/app/components/NavbarWrapper";
import FooterWrapper from "@/app/components/FooterWrapper";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import AffiliateBanner from "@/components/marketing/AffiliateBanner";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

const ibmPlex = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    variable: '--font-ibm',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: "تمالين — بيع وشراء المنتجات الرقمية بالعربي",
    description: "المنصة الرائدة في العالم العربي لبيع الدورات، الكتب، والقوالب الرقمية. ابدأ مشروعك الرقمي اليوم بكل سهولة وأمان.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${ibmPlex.variable} ${inter.variable} font-sans antialiased text-slate-900 bg-white flex flex-col min-h-screen`}>
                <Providers>
                    <AffiliateBanner />
                    <ImpersonationBanner />
                    <NavbarWrapper />
                    <main className="flex-grow w-full overflow-x-hidden">
                        {children}
                    </main>
                    <FooterWrapper />
                    <WhatsAppButton />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 5000,
                            style: {
                                direction: 'rtl',
                                fontFamily: 'var(--font-ibm)',
                                borderRadius: '24px',
                                padding: '16px 24px',
                                fontSize: '14px',
                                fontWeight: '700',
                                boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                backdropFilter: 'blur(10px)',
                            },
                            success: {
                                style: {
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    color: '#4f46e5',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
