import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const logs = await db.emailLog.findMany({
            where: { sellerId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
