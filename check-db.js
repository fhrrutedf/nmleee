const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const broadcasts = await prisma.broadcast.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, subject: true, status: true, sentCount: true, recipientCount: true, createdAt: true }
    });
    console.log('--- RECENT BROADCASTS ---');
    console.log(JSON.stringify(broadcasts, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
