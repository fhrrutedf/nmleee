import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const settings = await prisma.automationSettings.findUnique({
            where: { userId: session.user.id }
        });

        return NextResponse.json(settings || {});
    } catch (error) {
        console.error('Error fetching automation settings:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب الإعدادات' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();

        // Remove id and userId if they exist in body to prevent updating them
        const { id, userId, ...updateData } = body;

        const settings = await prisma.automationSettings.upsert({
            where: { userId: session.user.id },
            update: updateData,
            create: {
                ...updateData,
                userId: session.user.id
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating automation settings:', error);
        return NextResponse.json({ error: 'حدث خطأ في تحديث الإعدادات' }, { status: 500 });
    }
}
