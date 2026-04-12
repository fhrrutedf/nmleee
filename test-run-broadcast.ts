import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function processBroadcast(broadcastId: string) {
    console.log('Fetching broadcast', broadcastId);
    try {
        const broadcast = await prisma.broadcast.findUnique({
            where: { id: broadcastId },
            status: 'PENDING'
        } as any);

        console.log('Found broadcast:', !!broadcast);
        if (!broadcast) return;

        // Update status to SENDING
        console.log('Updating to SENDING');
        await prisma.broadcast.update({
            where: { id: broadcastId },
            data: { status: 'SENDING' }
        });
        console.log('DB Update Success');
    } catch(e) {
        console.error('Error during process:', e);
    }
}

async function main() {
    await processBroadcast('1b93dca6-ea5f-4a07-ad1f-8faa78da549f'); // Latest PENDING job
}
main().catch(console.error).finally(()=> prisma.$disconnect());
