import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
    title: 'المدونة | منصتك الرقمية',
    description: 'أحدث المقالات والنصائح لتنمية أعمالك الرقمية وتحقيق النجاح، اكتشف استراتيجيات التسويق والأدوات المفيدة.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    // Fetch articles with categories and authors
    const articles = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: { name: true, avatar: true }
            },
            category: {
                select: { nameAr: true, slug: true }
            }
        }
    });

    // Fetch all categories that have at least one published article
    const categories = await prisma.blogCategory.findMany({
        where: {
            articles: {
                some: { status: 'PUBLISHED' }
            }
        },
        select: {
            nameAr: true,
            slug: true
        },
        orderBy: { nameAr: 'asc' }
    });

    // Format for client component
    const formattedArticles = articles.map(article => ({
        ...article,
        authorName: article.author?.name || 'الكاتب',
        categoryName: article.category?.nameAr || 'عام',
        categorySlug: article.category?.slug || 'general',
    }));

    const formattedCategories = [
        { nameAr: 'الكل', slug: 'all' },
        ...categories
    ];

    return (
        <BlogListClient 
            initialPosts={formattedArticles as any} 
            categories={formattedCategories}
        />
    );
}
