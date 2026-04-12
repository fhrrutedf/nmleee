import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, subject: true, status: true, sentCount: true, totalCount: true, createdAt: true }
    });
    console.log('--- RECENT BROADCASTS ---');
    console.table(broadcasts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
