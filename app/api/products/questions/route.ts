import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get questions for a product
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const questions = await prisma.productQuestion.findMany({
            where: {
                productId,
                isApproved: true
            },
            include: {
                answers: {
                    include: {
                        answerer: {
                            select: {
                                name: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                asker: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}

// Ask a question
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const data = await request.json();
        const { productId, content, isAnonymous, askerName, askerEmail } = data;

        if (!productId || !content?.trim()) {
            return NextResponse.json({ error: 'Product ID and content required' }, { status: 400 });
        }

        // Get product to check seller
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { user: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const question = await prisma.productQuestion.create({
            data: {
                productId,
                content: content.trim(),
                isAnonymous: isAnonymous || false,
                askerId: session?.user?.id || null,
                askerName: isAnonymous ? null : (askerName || session?.user?.name || 'زائر'),
                askerEmail: isAnonymous ? null : (askerEmail || session?.user?.email || null),
                isApproved: true // Auto-approve for now
            }
        });

        // TODO: Send notification to seller

        return NextResponse.json({ question, message: 'تم إرسال السؤال بنجاح' });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
    }
}
