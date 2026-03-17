import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const { status, reason } = await request.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
        }

        // @ts-ignore
        const course = await prisma.course.update({
            where: { id },
            // @ts-ignore
            data: { status }
        });

        if (status === 'REJECTED' && reason) {
            // Also notify the seller
            await prisma.notification.create({
                data: {
                    receiverId: course.userId,
                    type: 'INTERNAL',
                    title: 'تم رفض الكورس الخاص بك',
                    content: `تم رفض كورس "${course.title}". السبب: ${reason}`,
                    senderId: adminUser.id,
                }
            });
        } else if (status === 'APPROVED') {
            // Also notify the seller
            await prisma.notification.create({
                data: {
                    receiverId: course.userId,
                    type: 'INTERNAL',
                    title: 'تمت الموافقة على الكورس!',
                    content: `تمت الموافقة على كورس "${course.title}" وأصبح متاحاً للجمهور حالياً.`,
                    senderId: adminUser.id,
                }
            });
        }

        return NextResponse.json({ success: true, course });
    } catch (error) {
        console.error('Error updating course status:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
