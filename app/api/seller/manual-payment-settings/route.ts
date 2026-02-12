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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                shamCashNumber: true,
                omtNumber: true,
                zainCashNumber: true,
                vodafoneCash: true,
                mtncashNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { shamCashNumber, omtNumber, zainCashNumber, vodafoneCash, mtncashNumber } = body;

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                shamCashNumber,
                omtNumber,
                zainCashNumber,
                vodafoneCash,
                mtncashNumber,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
