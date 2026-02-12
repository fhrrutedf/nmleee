import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;

        const appointments = await prisma.appointment.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(appointments);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب المواعيد' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const userId = (session.user as any).id;
        const data = await request.json();

        const appointment = await prisma.appointment.create({
            data: {
                ...data,
                userId: userId
            }
        });

        return NextResponse.json(appointment, { status: 201 });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء الموعد' },
            { status: 500 }
        );
    }
}
