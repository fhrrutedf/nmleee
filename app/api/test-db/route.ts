import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    console.log('--- 🛡️ VERBOSE DB DIAGNOSTICS START ---');
    
    const envStatus = {
        time: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
    };

    try {
        // Level 2: Prisma Initialization Test
        console.log('Step 2: Initializing Prisma Client...');
        const startTime = Date.now();
        
        // Level 3: Real DB Query with strict timeout
        console.log('Step 3: Running DB Query (prisma.user.count)...');
        const dbPromise = prisma.user.count();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('INTERNAL_PRISMA_TIMEOUT (5s)')), 5000)
        );

        const count = await Promise.race([dbPromise, timeoutPromise]) as number;
        const duration = Date.now() - startTime;

        return NextResponse.json({
            status: '✅ SUCCESS',
            message: 'Database is reachable and responding!',
            env: envStatus,
            stats: {
                userCount: count,
                latencyMs: duration,
                pooling: process.env.DATABASE_URL?.includes(':6543/')
            }
        });

    } catch (error: any) {
        console.error('❌ DIAGNOSTIC FAILED:', error.message);
        
        return NextResponse.json({
            status: '❌ FAILED',
            error: error.message,
            advice: error.message.includes('TIMEOUT') 
                ? 'قاعدة البيانات لا تستجيب نهائياً. تأكد من أن الـ IP Whitelisting معطل في Supabase، أو بمراجعة كلمة المرور.'
                : 'حدث خطأ في الاتصال. تأكد من أن الرابط في Vercel صحيح.',
            env: envStatus,
            details: error.toString()
        }, { status: 500 });
    }
}
