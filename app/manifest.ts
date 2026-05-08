import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'منصة مناسة الرقمية',
        short_name: 'مناسة',
        description: 'منصة بيع وشراء المنتجات الرقمية والكورسات العربية',
        start_url: '/',
        display: 'standalone',
        background_color: '#0A0A0A',
        theme_color: '#10B981',
        orientation: 'portrait-primary',
        lang: 'ar',
        dir: 'rtl',
        categories: ['education', 'shopping', 'business'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        shortcuts: [
            {
                name: 'تصفح المنتجات',
                short_name: 'منتجات',
                description: 'تصفح أحدث المنتجات الرقمية',
                url: '/explore',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'الكورسات',
                short_name: 'كورسات',
                description: 'استعرض الكورسات المتاحة',
                url: '/courses',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
        ],
        screenshots: [
            {
                src: '/og-image.png',
                sizes: '1200x630',
                type: 'image/png',
            },
        ],
    };
}
