import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
    title: 'المدونة | منصتك الرقمية',
    description: 'أحدث المقالات والنصائح لتنمية أعمالك الرقمية وتحقيق النجاح، اكتشف استراتيجيات التسويق والأدوات المفيدة.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    // 1. Fetch real posts from DB
    const dbPosts = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
            author: { // New Article model uses 'author' relation
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
        author: { name: "ماهر", avatar: null }
    };

    // Prepare articles for client component matching expected interface
    const formattedDbPosts = dbPosts.map(post => ({
        ...post,
        authorName: post.author?.name || 'الكاتب',
        category: post.tags && post.tags.length > 0 ? post.tags[0] : 'مقالات',
    }));

    // 3. Combine them
    const hasMaherPost = formattedDbPosts.some(p => p.slug === maherPost.slug);
    const finalPosts = hasMaherPost ? formattedDbPosts : [maherPost, ...formattedDbPosts];

    return <BlogListClient initialPosts={finalPosts as any} />;
}
