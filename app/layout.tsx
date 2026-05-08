import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
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

const cairo = Cairo({
    subsets: ["arabic", "latin"],
    variable: '--font-cairo',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    title: {
        default: "منصة مناسة الرقمية | بيع وشراء المنتجات الرقمية والكورسات العربية",
        template: "%s | منصة مناسة الرقمية"
    },
    description: "منصة مناسة الرقمية هي وجهتك الأولى لبيع وشراء المنتجات الرقمية، الكورسات، القوالب، والملفات في العالم العربي. ابدأ رحلتك الرقمية معنا اليوم!",
    keywords: ['منتجات رقمية', 'كورسات', 'قوالب', 'بيع', 'شراء', 'منصة عربية', 'دخل سلبي', 'تسويق رقمي', 'manasa digital'],
    authors: [{ name: 'Manasa Digital', url: 'https://manasadigital.com' }],
    creator: 'Manasa Digital',
    publisher: 'Manasa Digital',
    metadataBase: new URL('https://manasadigital.com'),
    alternates: { canonical: 'https://manasadigital.com' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    openGraph: {
        title: 'منصة مناسة الرقمية | بيع وشراء المنتجات الرقمية والكورسات العربية',
        description: 'منصة مناسة الرقمية هي وجهتك الأولى لبيع وشراء المنتجات الرقمية، الكورسات، القوالب، والملفات في العالم العربي.',
        url: 'https://manasadigital.com',
        siteName: 'Manasa Digital',
        locale: 'ar_AR',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'منصة مناسة الرقمية' }],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@manasadigital',
        creator: '@manasadigital',
        title: 'منصة مناسة الرقمية | بيع وشراء المنتجات الرقمية',
        description: 'وجهتك الأولى للمنتجات الرقمية والكورسات في العالم العربي.',
        images: ['/og-image.png'],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${cairo.variable} ${inter.variable} font-sans antialiased text-white bg-[#0A0A0A] flex flex-col min-h-screen selection:bg-emerald-500`} style={{ fontFamily: "'Cairo', 'Inter', sans-serif" }}>
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
                                fontFamily: "'Cairo', 'Inter', sans-serif",
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
                                    primary: '#10B981',
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
