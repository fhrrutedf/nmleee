import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Get user's wishlist
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wishlist = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        originalPrice: true,
                        image: true,
                        isFree: true,
                        averageRating: true,
                        reviewCount: true,
                        user: { select: { name: true, username: true } }
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        originalPrice: true,
                        image: true,
                        averageRating: true,
                        reviewCount: true,
                        user: { select: { name: true, username: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ wishlist });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

// Add to wishlist
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, courseId } = body;

        if (!productId && !courseId) {
            return NextResponse.json(
                { error: 'Product ID or Course ID required' },
                { status: 400 }
            );
        }

        // Create wishlist item
        const wishlistItem = await prisma.wishlistItem.upsert({
            where: {
                userId_productId_courseId: {
                    userId: session.user.id,
                    productId: productId || null,
                    courseId: courseId || null
                }
            },
            update: {},
            create: {
                userId: session.user.id,
                productId: productId || null,
                courseId: courseId || null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Added to wishlist',
            item: wishlistItem
        });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

// Remove from wishlist
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const courseId = searchParams.get('courseId');

        if (!productId && !courseId) {
            return NextResponse.json(
                { error: 'Product ID or Course ID required' },
                { status: 400 }
            );
        }

        await prisma.wishlistItem.deleteMany({
            where: {
                userId: session.user.id,
                productId: productId || undefined,
                courseId: courseId || undefined
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Removed from wishlist'
        });

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}

// Check if item is in wishlist
export async function HEAD(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productIdParam = searchParams.get('productId');
        const courseIdParam = searchParams.get('courseId');

        if (!productIdParam && !courseIdParam) {
            return NextResponse.json(
                { error: 'Product ID or Course ID required' },
                { status: 400 }
            );
        }

        // Use findFirst with where clause instead of findUnique for nullable fields
        const item = await prisma.wishlistItem.findFirst({
            where: {
                userId: session.user.id,
                productId: productIdParam || null,
                courseId: courseIdParam || null
            }
        });

        return NextResponse.json({ isInWishlist: !!item });

    } catch (error) {
        console.error('Error checking wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to check wishlist' },
            { status: 500 }
        );
    }
}
