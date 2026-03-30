import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                subscriptions: {
                    where: { status: 'active', currentPeriodEnd: { gt: new Date() } },
                    include: { plan: true },
                    orderBy: { currentPeriodEnd: 'desc' },
                    take: 1
                }
            }
        });

        if (!user || user.subscriptions.length === 0) {
            return NextResponse.json(null);
        }

        return NextResponse.json(user.subscriptions[0]);
    } catch (error) {
        console.error('Error fetching user subscription:', error);
        return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
    }
}
