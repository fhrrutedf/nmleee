import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
    title: 'المدونة | تمالين',
    description: 'أحدث المقالات والنصائح لتنمية أعمالك الرقمية وتحقيق النجاح، اكتشف استراتيجيات التسويق والأدوات المفيدة.',
};

export const revalidate = 60; // 1 minute

export default async function BlogPage() {
    // 1. Fetch real posts from DB
    const dbPosts = await prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, avatar: true }
            }
        }
    });

    // 2. Define the "Master Post" by Maher as a permanent fixture or fallback
    const maherPost = {
        id: 'maher-post-1',
        title: "فن اختيار المنتج الرقمي: كيف تلاقي فكرة يدفع الناس لأجلها؟",
        slug: "choosing-winning-digital-product-idea-2026",
        content: `أسمع الكثير من المدربين يقولون: "عندي فكرة كورس خرافية، لكن لا أحد يشتري". الحقيقة المرة التي لا يحب أحد سماعها هي أن جمهورك لا يهتم بـ "فكرتك"، بل يهتم بـ "مشكلته"...`,
        excerpt: "الفكرة ليست هي الكنز.. الاحتياج هو الكنز الحقيقي. تعلم كيف تكتشف ما يحتاجه جمهورك فعلياً وتحوله إلى أرباح مستدامة.",
        coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        category: "تحليلات",
        authorName: "ماهر",
        createdAt: new Date().toISOString(),
        user: { name: "ماهر", avatar: null }
    };

    // 3. Combine them (ensure Maher's post is there if DB is empty or just as first post)
    // We'll check if the slug already exists in DB to avoid duplicates
    const hasMaherPost = dbPosts.some(p => p.slug === maherPost.slug);
    const finalPosts = hasMaherPost ? dbPosts : [maherPost, ...dbPosts];

    return <BlogListClient initialPosts={finalPosts as any} />;
}
