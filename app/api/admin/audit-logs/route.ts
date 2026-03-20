import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActivityLogs } from '@/lib/activity-log';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const actorId = searchParams.get('actorId') || undefined;

        const logs = await getActivityLogs(limit, offset, actorId);
        
        // logs are raw from $queryRaw, they might need JSON parsing if details is string
        const parsedLogs = logs.map(log => ({
            ...log,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
        }));

        return NextResponse.json(parsedLogs);
    } catch (err) {
        console.error('Audit logs API error:', err);
        return NextResponse.json({ error: 'خطأ في جلب السجلات' }, { status: 500 });
    }
}
