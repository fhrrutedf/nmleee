import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const directUrl = process.env.DIRECT_URL;

        // Mask sensitive info for logging
        const maskUrl = (url?: string) => {
            if (!url) return 'UNDEFINED';
            try {
                // Show protocol, user, host, port. Hide password.
                const urlObj = new URL(url);
                return `${urlObj.protocol}//${urlObj.username}:****@${urlObj.host}${urlObj.pathname}${urlObj.search}`;
            } catch (e) {
                return 'INVALID URL FORMAT';
            }
        }

        console.log('--- DB CONNECTION TEST ---');
        console.log('DATABASE_URL:', maskUrl(dbUrl));
        console.log('DIRECT_URL:', maskUrl(directUrl));

        // Test query
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'success',
            message: 'Connected to Supabase!',
            userCount,
            debug: {
                databaseUrl: maskUrl(dbUrl),
                directUrl: maskUrl(directUrl)
            }
        });
    } catch (error: any) {
        console.error('SERVER DB TEST FAILED:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            details: error.toString(),
            code: error.code
        }, { status: 500 });
    }
}
