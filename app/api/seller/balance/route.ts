import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                pendingBalance: true,
                availableBalance: true,
                totalEarnings: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        return NextResponse.json({
            pending: user.pendingBalance,
            available: user.availableBalance,
            total: user.totalEarnings,
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
