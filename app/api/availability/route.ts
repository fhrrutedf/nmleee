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

        const availabilities = await prisma.availability.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dayOfWeek: 'asc'
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { consultationPrice: true }
        });

        return NextResponse.json({
            availabilities,
            consultationPrice: user?.consultationPrice || 0
        });

    } catch (error) {
        console.error('Error fetching availabilities:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب أوقات العمل' },
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
        const { availabilities, consultationPrice } = await request.json();

        if (!Array.isArray(availabilities)) {
            return NextResponse.json(
                { error: 'البيانات المرسلة غير صحيحة' },
                { status: 400 }
            );
        }

        // نقوم بتحديث أو إنشاء المواقيت باستخدام upsert أو الحذف والإنشاء
        // الطريقة الأبسط هي حذف كل القديم وإضافة الجديد
        await prisma.$transaction(async (tx) => {
            await tx.availability.deleteMany({
                where: { userId }
            });

            if (availabilities.length > 0) {
                await tx.availability.createMany({
                    data: availabilities.map((a: any) => ({
                        userId: userId,
                        dayOfWeek: Number(a.dayOfWeek),
                        startTime: a.startTime,
                        endTime: a.endTime,
                        isActive: Boolean(a.isActive)
                    }))
                });
            }

            if (consultationPrice !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: { consultationPrice: parseFloat(consultationPrice) || 0 }
                });
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Error updating availabilities:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في تحديث أوقات العمل' },
            { status: 500 }
        );
    }
}
