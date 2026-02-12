import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true, // Only show approved reviews
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب التقييمات' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const review = await prisma.review.create({
            data: {
                productId: body.productId,
                name: body.name,
                rating: body.rating,
                comment: body.comment,
                isApproved: true, // Auto-approve (or set to false for manual moderation)
            },
        });

        // Update product average rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: body.productId,
                isApproved: true,
            },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.product.update({
            where: { id: body.productId },
            data: {
                averageRating: avgRating,
                reviewCount: allReviews.length,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إضافة التقييم' },
            { status: 500 }
        );
    }
}
