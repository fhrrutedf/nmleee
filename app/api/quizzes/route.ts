import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - إنشاء اختبار جديد
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, passingScore, timeLimit, questions, lessonId, courseId } = body;

        if (!title || !questions) {
            return NextResponse.json({ error: 'العنوان والأسئلة مطلوبة' }, { status: 400 });
        }

        if (!lessonId && !courseId) {
            return NextResponse.json({ error: 'يجب تحديد الدرس أو الدورة' }, { status: 400 });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description: description || '',
                passingScore: passingScore || 70,
                timeLimit: timeLimit ? parseInt(timeLimit) : null,
                questions,
                lessonId: lessonId || null,
                courseId: courseId || null,
            },
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error('Error creating quiz:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الاختبار' }, { status: 500 });
    }
}
