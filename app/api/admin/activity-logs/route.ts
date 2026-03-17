import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';

// GET /api/admin/activity-logs
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const actorId = searchParams.get('actorId') ?? undefined;

    try {
        let logs: any[];
        if (actorId) {
            logs = await prisma.$queryRaw`
                SELECT * FROM activity_logs WHERE actor_id = ${actorId}
                ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
            `;
        } else {
            logs = await prisma.$queryRaw`
                SELECT * FROM activity_logs
                ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
            `;
        }

        const total = await prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) FROM activity_logs
        `;

        return NextResponse.json({ logs, total: Number((total[0] as any).count) });
    } catch (error) {
        return NextResponse.json({ logs: [], total: 0 });
    }
}
