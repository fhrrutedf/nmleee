import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tmleen.com';

    // الصفحات الثابتة
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    try {
        // جلب المنتجات
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { id: true, updatedAt: true },
        });

        const productPages: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // جلب المستخدمين
        const users = await prisma.user.findMany({
            where: { isActive: true },
            select: { username: true, updatedAt: true },
        });

        const userPages: MetadataRoute.Sitemap = users.map((user) => ({
            url: `${baseUrl}/${user.username}`,
            lastModified: user.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        return [...staticPages, ...productPages, ...userPages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
