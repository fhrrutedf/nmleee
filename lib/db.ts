import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Diagnostics for database connection
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL is missing! Registration and DB calls will FAIL.');
} else {
    // Check for pooling (port 6543 for Supabase)
    const isPooled = dbUrl.includes(':6543/');
    console.log(`✅ DATABASE_URL is present ${isPooled ? '(Detected Connection Pooling)' : '(Direct Connection)'}`);
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma;
