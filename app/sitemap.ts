import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://manasadigital.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    // الصفحات الثابتة
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    try {
        // منتجات نشطة — استخدام slug إذا موجود وإلا id
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { id: true, slug: true, updatedAt: true },
        });

        const productPages: MetadataRoute.Sitemap = products.map((p) => ({
            url: `${SITE_URL}/product/${p.slug || p.id}`,
            lastModified: p.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // كورسات نشطة
        const courses = await prisma.course.findMany({
            where: { isActive: true },
            select: { id: true, slug: true, updatedAt: true },
        });

        const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
            url: `${SITE_URL}/course/${c.slug || c.id}`,
            lastModified: c.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // مقالات المدونة المنشورة
        const blogPosts = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, updatedAt: true },
        });

        const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        // صفحات البائعين/المنشئين
        const users = await prisma.user.findMany({
            where: { isActive: true },
            select: { username: true, updatedAt: true },
        });

        const userPages: MetadataRoute.Sitemap = users
            .filter((u) => u.username)
            .map((u) => ({
                url: `${SITE_URL}/@${u.username}`,
                lastModified: u.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.7,
            }));

        return [...staticPages, ...productPages, ...coursePages, ...blogPages, ...userPages];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return staticPages;
    }
}
