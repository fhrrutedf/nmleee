import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');

        const where: any = {};
        if (status) where.status = status;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const articles = await prisma.article.findMany({
            where,
            include: { category: true, author: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json({ success: true, data: articles });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { title, slug, excerpt, content, coverImage, status, categoryId, tags, seoTitle, seoDesc } = body;

        // Auto-generate slug if not provided
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const article = await prisma.article.create({
            data: {
                title,
                slug: finalSlug,
                excerpt,
                content,
                coverImage,
                status: status || 'DRAFT',
                categoryId: categoryId || null,
                seoTitle,
                seoDesc,
                userId: session.user.id,
                authorId: session.user.id, // For now map authorId to userId
            }
        });

        return NextResponse.json({ success: true, data: article });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
