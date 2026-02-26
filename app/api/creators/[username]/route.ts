import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username: rawUsername } = await params;
        const decodedUsername = decodeURIComponent(rawUsername);
        const username = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername;

        // Get creator
        const creator = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                avatar: true,
                coverImage: true,
                brandColor: true,
                website: true,
                facebook: true,
                instagram: true,
                twitter: true,
                consultationPrice: true,
                availabilities: true
            }
        });

        if (!creator) {
            return NextResponse.json(
                { error: 'Creator not found' },
                { status: 404 }
            );
        }

        // Get creator's active products ONLY
        const products = await prisma.product.findMany({
            where: {
                userId: creator.id,
                isActive: true
            },
            orderBy: [
                { displayOrder: 'asc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                price: true,
                image: true,
                category: true,
                averageRating: true,
                reviewCount: true,
                duration: true,
                sessions: true,
                isFree: true,
            }
        });

        // Get creator's active courses ONLY
        const courses = await prisma.course.findMany({
            where: {
                userId: creator.id,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                image: true,
                category: true,
                duration: true,
                sessions: true,
            }
        });

        const combinedProducts = [
            ...products.map(p => ({ ...p, itemType: 'product' })),
            ...courses.map(c => ({
                ...c,
                itemType: 'course',
                averageRating: 0,
                reviewCount: 0,
            }))
        ];

        return NextResponse.json({
            creator,
            products: combinedProducts.sort((a, b) => ((b as any).soldCount || 0) - ((a as any).soldCount || 0))
        });

    } catch (error) {
        console.error('Error fetching creator data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch creator data' },
            { status: 500 }
        );
    }
}
