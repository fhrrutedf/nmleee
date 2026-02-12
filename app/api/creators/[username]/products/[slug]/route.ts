import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { username: string; slug: string } }
) {
    try {
        const { username, slug } = params;

        // Get creator
        const creator = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                avatar: true,
                brandColor: true,
                website: true,
                facebook: true,
                instagram: true,
                twitter: true
            }
        });

        if (!creator) {
            return NextResponse.json(
                { error: 'Creator not found' },
                { status: 404 }
            );
        }

        // Get product - MUST belong to this creator (Data Isolation)
        const product = await prisma.product.findFirst({
            where: {
                slug,
                userId: creator.id, // CRITICAL: Filter by creator
                isActive: true
            },
            include: {
                reviews: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            product,
            creator
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
