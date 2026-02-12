import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - جلب درس محدد
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                userId: true,
                            }
                        }
                    }
                },
                quizzes: {
                    select: {
                        id: true,
                        title: true,
                        passingScore: true,
                        isPublished: true,
                    }
                },
                _count: {
                    select: {
                        comments: true,
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الدرس' }, { status: 500 });
    }
}

// PUT - تحديث درس
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        const body = await req.json();
        const { title, description, content, videoUrl, videoDuration, isPublished, isFree, attachments } = body;

        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(content !== undefined && { content }),
                ...(videoUrl !== undefined && { videoUrl }),
                ...(videoDuration !== undefined && { videoDuration: parseInt(videoDuration) }),
                ...(typeof isPublished === 'boolean' && { isPublished }),
                ...(typeof isFree === 'boolean' && { isFree }),
                ...(attachments && { attachments }),
            },
        });

        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الدرس' }, { status: 500 });
    }
}

// DELETE - حذف درس
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        await prisma.lesson.delete({
            where: { id: lessonId },
        });

        return NextResponse.json({ message: 'تم حذف الدرس بنجاح' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الدرس' }, { status: 500 });
    }
}
