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

        // Test query with a RACE to detect timeout faster
        const userCountPromise = prisma.user.count();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DATABASE_CONNECTION_TIMEOUT (15s)')), 15000)
        );

        const userCount = await Promise.race([userCountPromise, timeoutPromise]) as number;

        return NextResponse.json({
            status: 'success',
            message: 'Connected to Database Successfully!',
            userCount,
            poolingDetected: dbUrl?.includes(':6543/'),
            advice: 'If userCount is returned, your connection is working.',
            debug: {
                databaseUrl: maskUrl(dbUrl),
                directUrl: maskUrl(directUrl)
            }
        });
    } catch (error: any) {
        console.error('SERVER DB TEST FAILED:', error);
        
        let customMessage = error.message;
        if (error.message.includes('TIMEOUT')) {
            customMessage = 'تعذر الاتصال بقاعدة البيانات (Timeout). تأكد من إعدادات الـ Pooler في Supabase والـ IP Whitelisting.';
        }

        return NextResponse.json({
            status: 'error',
            message: customMessage,
            details: error.toString(),
            code: error.code,
            advice: 'تأكد من استخدام المنفذ 6543 ورابط الـ Connection Pooler في Vercel لتجنب هذه المشكلة.'
        }, { status: 500 });
    }
}
