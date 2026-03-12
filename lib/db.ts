import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL;

// Extremely simple initialization
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasourceUrl: dbUrl,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

console.log('⚡ Prisma Client Initialized');

export default prisma;
