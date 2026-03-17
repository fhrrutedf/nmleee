import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const sort = searchParams.get('sort') || 'desc';

    let whereClause = {};
    if (status !== 'ALL') {
        whereClause = { status: status as any };
    }

    const tickets = await prisma.supportTicket.findMany({
        where: whereClause,
        include: {
            user: { select: { name: true, email: true, role: true } },
            _count: { select: { messages: true } },
        },
        orderBy: sort === 'oldest' ? { updatedAt: 'asc' } : { updatedAt: 'desc' },
        take: 100,
    });

    return NextResponse.json(tickets);
}
