import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Answer a question
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { questionId, content } = data;

        if (!questionId || !content?.trim()) {
            return NextResponse.json({ error: 'Question ID and content required' }, { status: 400 });
        }

        // Get question to verify seller owns the product
        const question = await prisma.productQuestion.findUnique({
            where: { id: questionId },
            include: {
                product: true
            }
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Only product owner can answer
        if (question.product.userId !== session.user.id) {
            return NextResponse.json({ error: 'Only product owner can answer' }, { status: 403 });
        }

        const answer = await prisma.productAnswer.create({
            data: {
                questionId,
                content: content.trim(),
                answererId: session.user.id
            },
            include: {
                answerer: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json({ answer, message: 'تم إرسال الإجابة بنجاح' });
    } catch (error) {
        console.error('Error creating answer:', error);
        return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
    }
}

// Delete answer (only by answerer)
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const answerId = searchParams.get('answerId');

        if (!answerId) {
            return NextResponse.json({ error: 'Answer ID required' }, { status: 400 });
        }

        const answer = await prisma.productAnswer.findUnique({
            where: { id: answerId }
        });

        if (!answer) {
            return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
        }

        if (answer.answererId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await prisma.productAnswer.delete({
            where: { id: answerId }
        });

        return NextResponse.json({ message: 'تم حذف الإجابة' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        return NextResponse.json({ error: 'Failed to delete answer' }, { status: 500 });
    }
}
