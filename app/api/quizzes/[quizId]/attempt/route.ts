import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - تقديم محاولة اختبار
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const body = await req.json();
        const { answers, studentName, studentEmail } = body;

        if (!answers || !studentName || !studentEmail) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        const { quizId } = await params;
        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
        }

        // Calculate score
        const questions = quiz.questions as any[];
        let correctAnswers = 0;

        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            if (userAnswer === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / questions.length) * 100;
        const isPassed = score >= quiz.passingScore;

        // Save attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId: params.quizId,
                studentName,
                studentEmail,
                answers,
                score,
                isPassed,
            },
        });

        return NextResponse.json({
            ...attempt,
            totalQuestions: questions.length,
            correctAnswers,
        }, { status: 201 });
    } catch (error) {
        console.error('Error submitting quiz attempt:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تقديم الاختبار' }, { status: 500 });
    }
}

// GET - جلب محاولات الاختبار
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const studentEmail = searchParams.get('studentEmail');

        const { quizId } = await params;
        const where: any = { quizId };
        if (studentEmail) {
            where.studentEmail = studentEmail;
        }

        const attempts = await prisma.quizAttempt.findMany({
            where,
            orderBy: { completedAt: 'desc' },
        });

        return NextResponse.json(attempts);
    } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب المحاولات' }, { status: 500 });
    }
}
