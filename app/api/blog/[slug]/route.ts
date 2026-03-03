import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const post = await prisma.blogPost.findUnique({
            where: { slug }
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const { slug } = await params;

        const body = await request.json();

        const currentPost = await prisma.blogPost.findUnique({
            where: { slug }
        });

        if (!currentPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (currentPost.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updatedPost = await prisma.blogPost.update({
            where: { slug },
            data: body,
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error('Error updating blog post:', error);
        return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const { slug } = await params;

        const currentPost = await prisma.blogPost.findUnique({
            where: { slug }
        });

        if (!currentPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (currentPost.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.blogPost.delete({
            where: { slug },
        });

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
    }
}
