import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/admin/',
                    '/api/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/checkout',
                    '/cart',
                    '/my-courses',
                    '/my-appointments',
                    '/certificates',
                ],
            },
        ],
        sitemap: 'https://manasadigital.com/sitemap.xml',
    };
}
