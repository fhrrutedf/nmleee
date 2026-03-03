import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
    title: 'المدونة | منصتي الرقمية',
    description: 'أحدث المقالات والنصائح لتنمية أعمالك الرقمية وتحقيق النجاح، اكتشف استراتيجيات التسويق والأدوات المفيدة.',
};

export const revalidate = 60; // 1 minute

export default async function BlogPage() {
    // Fetch real posts from DB
    const posts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, avatar: true }
            }
        }
    });

    return <BlogListClient initialPosts={posts} />;
}
