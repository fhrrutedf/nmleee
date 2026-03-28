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
                            duration: 4000,
                            style: {
                                direction: 'rtl',
                                fontFamily: 'var(--font-ibm)',
                                borderRadius: '8px',
                                padding: '12px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                border: '1px solid #E5E7EB',
                            },
                            success: {
                                style: {
                                    background: '#FFFFFF',
                                    color: '#1A1A1A',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
