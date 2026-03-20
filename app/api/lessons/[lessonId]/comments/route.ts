import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * GET: جلب التعليقات للدرس
 * POST: إضافة تعليق جديد
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const comments = await prisma.comment.findMany({
            where: {
                lessonId: lessonId,
                parentId: null // الدرجة الأولى فقط
            },
            include: {
                replies: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, parentId, courseId } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorName: session.user.name || 'مستخدم',
                authorEmail: session.user.email,
                lessonId: lessonId,
                courseId,
                parentId
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Comment Error:", error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
