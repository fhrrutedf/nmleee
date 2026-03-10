import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET - fetch quiz
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                lesson: { select: { id: true, title: true } },
                course: { select: { id: true, title: true, userId: true } },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

// PUT - update quiz
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { quizId } = await params;
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
        }

        const body = await req.json();
        const { title, description, passingScore, timeLimit, questions, isPublished } = body;

        const updated = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(passingScore !== undefined && { passingScore: Number(passingScore) }),
                ...(timeLimit !== undefined && { timeLimit: timeLimit ? Number(timeLimit) : null }),
                ...(questions !== undefined && { questions }),
                ...(typeof isPublished === 'boolean' && { isPublished }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating quiz:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الاختبار' }, { status: 500 });
    }
}

// DELETE - delete quiz
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { quizId } = await params;
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
        }

        await prisma.quiz.delete({ where: { id: quizId } });
        return NextResponse.json({ message: 'تم حذف الاختبار بنجاح' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الاختبار' }, { status: 500 });
    }
}
