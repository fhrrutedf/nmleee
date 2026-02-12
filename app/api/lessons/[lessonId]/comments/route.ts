import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - جلب تعليقات الدرس
export async function GET(
    req: NextRequest,
    { params }: { params: { lessonId: string } }
) {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                lessonId: params.lessonId,
                parentId: null, // Only top-level comments
            },
            orderBy: { createdAt: 'desc' },
            include: {
                replies: {
                    orderBy: { createdAt: 'asc' },
                }
            }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب التعليقات' }, { status: 500 });
    }
}

// POST - إضافة تعليق
export async function POST(
    req: NextRequest,
    { params }: { params: { lessonId: string } }
) {
    try {
        const body = await req.json();
        const { content, authorName, authorEmail, parentId } = body;

        if (!content || !authorName || !authorEmail) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorName,
                authorEmail,
                lessonId: params.lessonId,
                parentId: parentId || null,
            },
            include: {
                replies: true,
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إضافة التعليق' }, { status: 500 });
    }
}
