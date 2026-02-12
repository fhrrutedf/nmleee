import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                lesson: true,
                course: true,
            },
        });

        if (!quiz || !quiz.isPublished) {
            return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
