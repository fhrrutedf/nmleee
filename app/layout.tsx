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
    weight: ['400', '500', '600', '700', '900'],
});

const ibmPlex = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    variable: '--font-ibm',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    title: {
        default: "تمالين — بيع وشراء المنتجات الرقمية بالعربي",
        template: "%s | تمالين"
    },
    description: "المنصة الرائدة في العالم العربي لبيع الدورات، الكتب، والقوالب الرقمية. ابدأ مشروعك الرقمي اليوم بكل سهولة وأمان.",
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${ibmPlex.variable} ${inter.variable} font-sans antialiased text-white bg-[#0A0A0A] flex flex-col min-h-screen selection:bg-emerald-500 text-white/20`}>
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
                                borderRadius: '24px',
                                padding: '16px 28px',
                                fontSize: '13px',
                                fontWeight: '700',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: '#111111',
                                color: '#FFFFFF',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#065f46',
                                    secondary: '#FFFFFF',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
