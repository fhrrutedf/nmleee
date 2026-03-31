import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

// PUT - تحديث باقة
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, description, price, interval, features, isActive, planType } = body;

        // Check if plan exists
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id }
        });

        if (!existingPlan) {
            return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 });
        }

        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(interval && { interval }),
                ...(features && { features }),
                ...(isActive !== undefined && { isActive }),
                ...(planType && { planType }),
            }
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الباقة' }, { status: 500 });
    }
}

// DELETE - حذف باقة
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;

        // Check if plan exists
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { subscriptions: true }
                }
            }
        });

        if (!existingPlan) {
            return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 });
        }

        // Check if plan has active subscriptions
        if (existingPlan._count.subscriptions > 0) {
            return NextResponse.json(
                { error: 'لا يمكن حذف باقة تحتوي على اشتراكات نشطة' },
                { status: 400 }
            );
        }

        await prisma.subscriptionPlan.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'تم حذف الباقة بنجاح' });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الباقة' }, { status: 500 });
    }
}
