import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const username = 'ahmad_test';
        console.log(`Testing query for username: ${username}`);

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
            console.log('Creator not found in DB');
            return;
        }
        console.log('Creator fetched successfully:', creator.id);

        const products = await prisma.product.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
            select: {
                id: true, title: true, slug: true, description: true, price: true,
                image: true, category: true, averageRating: true, reviewCount: true,
                duration: true, sessions: true, isFree: true,
            }
        });
        console.log(`Fetched ${products.length} products successfully.`);

        const courses = await prisma.course.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, title: true, description: true, price: true,
                image: true, category: true, duration: true, sessions: true,
            }
        });
        console.log(`Fetched ${courses.length} courses successfully.`);

        console.log('All queries succeeded.');

    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
