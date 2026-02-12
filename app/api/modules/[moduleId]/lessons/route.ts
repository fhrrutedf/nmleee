import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - جلب دروس الوحدة
export async function GET(
    req: NextRequest,
    { params }: { params: { moduleId: string } }
) {
    try {
        const lessons = await prisma.lesson.findMany({
            where: { moduleId: params.moduleId },
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: {
                        comments: true,
                        quizzes: true,
                    }
                }
            }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الدروس' }, { status: 500 });
    }
}

// POST - إضافة درس جديد
export async function POST(
    req: NextRequest,
    { params }: { params: { moduleId: string } }
) {
    try {
        const body = await req.json();
        const { title, description, content, videoUrl, videoDuration, order, isFree, attachments } = body;

        if (!title) {
            return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
        }

        // Get the module to verify it exists
        const module = await prisma.module.findUnique({
            where: { id: params.moduleId },
        });

        if (!module) {
            return NextResponse.json({ error: 'الوحدة غير موجودة' }, { status: 404 });
        }

        // Get the next order number if not provided
        let lessonOrder = order;
        if (lessonOrder === undefined) {
            const lastLesson = await prisma.lesson.findFirst({
                where: { moduleId: params.moduleId },
                orderBy: { order: 'desc' },
            });
            lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
        }

        const lesson = await prisma.lesson.create({
            data: {
                title,
                description: description || '',
                content: content || '',
                videoUrl: videoUrl || null,
                videoDuration: videoDuration ? parseInt(videoDuration) : null,
                order: lessonOrder,
                isFree: isFree || false,
                attachments: attachments || [],
                moduleId: params.moduleId,
            },
        });

        return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الدرس' }, { status: 500 });
    }
}
