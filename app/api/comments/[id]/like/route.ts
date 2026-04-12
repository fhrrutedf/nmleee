import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: commentId } = await params;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true },
        });

        if (!comment) {
            return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
        }

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: {
                likes: { increment: 1 },
            },
            select: { likes: true },
        });

        return NextResponse.json({ success: true, likes: updated.likes });
    } catch (error) {
        console.error('Error liking comment:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
