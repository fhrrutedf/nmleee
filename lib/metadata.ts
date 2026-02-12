import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
    title: {
        default: 'tmleen - منصة المنتجات الرقمية والدورات التدريبية',
        template: '%s | tmleen'
    },
    description: 'منصة عربية احترافية لبيع وشراء المنتجات الرقمية والدورات التدريبية. ابدأ مشروعك الرقمي اليوم!',
    keywords: ['منتجات رقمية', 'دورات تدريبية', 'كتب إلكترونية', 'قوالب', 'تصميم', 'برمجة', 'تسويق'],
    authors: [{ name: 'tmleen' }],
    creator: 'tmleen',
    publisher: 'tmleen',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://tmleen.com'),
    alternates: {
        canonical: '/',
        languages: {
            'ar': '/ar',
            'en': '/en',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'ar_AR',
        url: 'https://tmleen.com',
        title: 'tmleen - منصة المنتجات الرقمية والدورات التدريبية',
        description: 'منصة عربية احترافية لبيع وشراء المنتجات الرقمية والدورات التدريبية',
        siteName: 'tmleen',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'tmleen',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'tmleen - منصة المنتجات الرقمية والدورات التدريبية',
        description: 'منصة عربية احترافية لبيع وشراء المنتجات الرقمية والدورات التدريبية',
        images: ['/twitter-image.jpg'],
        creator: '@tmleen',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
};

export function generateProductMetadata(product: {
    title: string;
    description: string;
    image?: string | null;
    price: number;
}): Metadata {
    return {
        title: product.title,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description,
            images: product.image ? [product.image] : [],
            type: 'product' as any,
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description,
            images: product.image ? [product.image] : [],
        },
    };
}

export function generateUserMetadata(user: {
    name: string;
    username: string;
    bio?: string | null;
    avatar?: string | null;
}): Metadata {
    return {
        title: user.name,
        description: user.bio || `تصفح منتجات ${user.name} على tmleen`,
        openGraph: {
            title: user.name,
            description: user.bio || `تصفح منتجات ${user.name} على tmleen`,
            images: user.avatar ? [user.avatar] : [],
            type: 'profile' as any,
        },
        twitter: {
            card: 'summary',
            title: user.name,
            description: user.bio || `تصفح منتجات ${user.name} على tmleen`,
            images: user.avatar ? [user.avatar] : [],
        },
    };
}
