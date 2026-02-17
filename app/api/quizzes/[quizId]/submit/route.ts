import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

export async function POST(
    req: Request,
    { params }: { params: { quizId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { answers, timeSpent } = body;
        const quizId = params.quizId;

        // Fetch quiz with questions and correct answers
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            return new NextResponse('Quiz not found', { status: 404 });
        }

        const questions = quiz.questions as any[];
        let correctCount = 0;
        const totalQuestions = questions.length;

        // Calculate Score
        // Assuming answers is an object like { questionIndex: answerValue }
        questions.forEach((q, index) => {
            const userAnswer = answers[index];
            if (userAnswer !== undefined && userAnswer === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = (correctCount / totalQuestions) * 100;
        const isPassed = score >= quiz.passingScore;

        // Record Attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId,
                studentEmail: session.user.email,
                studentName: session.user.name || session.user.email,
                score,
                isPassed,
                answers, // Store user answers for review
                timeSpent,
            },
        });

        return NextResponse.json({
            success: true,
            score,
            isPassed,
            passingScore: quiz.passingScore,
            attemptId: attempt.id,
        });

    } catch (error) {
        console.error('[QUIZ_SUBMIT_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
