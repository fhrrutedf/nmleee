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

        // Check if admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Get all pending payouts
        const payouts = await prisma.payout.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(payouts);
    } catch (error) {
        console.error('Error fetching payouts:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
