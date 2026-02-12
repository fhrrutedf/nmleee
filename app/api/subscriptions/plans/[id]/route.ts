import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET - جلب خطة محددة
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true,
                        avatar: true,
                    }
                },
                _count: {
                    select: { subscriptions: true }
                }
            }
        });

        if (!plan) {
            return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الخطة' }, { status: 500 });
    }
}

// PUT - تحديث خطة
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: params.id },
        });

        if (!plan) {
            return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
        }

        if (plan.userId !== user.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, price, interval, features, isActive } = body;

        const updatedPlan = await prisma.subscriptionPlan.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(interval && { interval }),
                ...(features && { features }),
                ...(typeof isActive === 'boolean' && { isActive }),
            },
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الخطة' }, { status: 500 });
    }
}

// DELETE - حذف خطة
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { subscriptions: true }
                }
            }
        });

        if (!plan) {
            return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
        }

        if (plan.userId !== user.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Check if plan has active subscriptions
        if (plan._count.subscriptions > 0) {
            return NextResponse.json(
                { error: 'لا يمكن حذف خطة تحتوي على اشتراكات نشطة' },
                { status: 400 }
            );
        }

        await prisma.subscriptionPlan.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'تم حذف الخطة بنجاح' });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الخطة' }, { status: 500 });
    }
}
