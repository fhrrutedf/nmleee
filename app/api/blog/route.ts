import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        // If 'status' is provided, we fetch by status (e.g. public blog only needs PUBLISHED posts).
        // For admin dashboard, we fetch all posts belonging to the user.
        // Or if the portal is a global admin, all posts. We will filter by the current seller/user.
        // Wait, the prompt says "Admin Management UI". Let's assume the user is managing their own blog posts,
        // or a global admin. Let's just filter by userId if the user is not ADMIN.

        let whereCondition: any = {};

        if (status) {
            whereCondition.status = status;
        }

        if (user && user.role !== 'ADMIN') {
            whereCondition.userId = user.id;
        }

        // if there's no user session and they are just fetching public posts
        if (!user && !status) {
            whereCondition.status = 'PUBLISHED';
        }

        const posts = await prisma.blogPost.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const body = await request.json();

        const { title, slug, content, excerpt, coverImage, category, tags, status } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
        }

        const newPost = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                category,
                tags: tags || [],
                status: status || 'DRAFT',
                authorName: user.name || '',
                userId: user.id,
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }
}
