import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not defined in environment variables!');
} else {
    // Hide actual value
    console.log('✅ DATABASE_URL is present');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
