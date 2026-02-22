import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const couponId = id;
        if (!couponId) {
            return NextResponse.json({ error: 'معرف الكوبون مطلوب' }, { status: 400 });
        }

        const existingCoupon = await prisma.coupon.findUnique({
            where: { id: couponId }
        });

        if (!existingCoupon || existingCoupon.userId !== session.user.id) {
            return NextResponse.json({ error: 'الكوبون غير موجود أو غير مصرح' }, { status: 404 });
        }

        const body = await req.json();

        // Update active status or limits usually
        const updated = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                isActive: body.isActive !== undefined ? body.isActive : existingCoupon.isActive,
                usageLimit: body.usageLimit !== undefined ? parseInt(body.usageLimit) : existingCoupon.usageLimit,
                endDate: body.endDate !== undefined ? new Date(body.endDate) : existingCoupon.endDate,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء التحديث' }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const couponId = id;
        const existingCoupon = await prisma.coupon.findUnique({
            where: { id: couponId }
        });

        if (!existingCoupon || existingCoupon.userId !== session.user.id) {
            return NextResponse.json({ error: 'الكوبون غير موجود أو غير مصرح' }, { status: 404 });
        }

        await prisma.coupon.delete({
            where: { id: couponId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء الحذف' }, { status: 500 });
    }
}
