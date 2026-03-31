import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

// PUT - تحديث اشتراك المستخدم يدوياً
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
        const { planType, planExpiresAt, notes } = body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                planType: true, 
                planExpiresAt: true 
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Update user subscription
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(planType && { planType }),
                ...(planExpiresAt !== undefined && { 
                    planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null 
                }),
            }
        });

        // Log the change (optional - you can create an ActivityLog entry here)
        console.log(`[ADMIN] Subscription updated for ${user.email}: ${user.planType} -> ${planType || user.planType} by ${adminUser.email}`);

        return NextResponse.json({
            message: 'تم تحديث الاشتراك بنجاح',
            user: updatedUser,
            previousPlan: user.planType,
            previousExpiry: user.planExpiresAt
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الاشتراك' }, { status: 500 });
    }
}

// DELETE - إلغاء/حذف اشتراك المستخدم (إعادة للـ FREE)
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

        const user = await prisma.user.findUnique({
            where: { id },
            select: { name: true, email: true, planType: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Reset to FREE plan
        await prisma.user.update({
            where: { id },
            data: {
                planType: 'FREE',
                planExpiresAt: null
            }
        });

        console.log(`[ADMIN] Subscription cancelled for ${user.email} by ${adminUser.email}`);

        return NextResponse.json({
            message: 'تم إلغاء الاشتراك وإعادة المستخدم للباقة المجانية'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
