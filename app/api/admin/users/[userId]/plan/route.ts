import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/users/[userId]/plan
 * Admin-only: Manually upgrade or downgrade a user's plan
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as any;

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { planType, durationMonths } = await req.json();

    // Validate plan type
    if (!['FREE', 'GROWTH', 'PRO'].includes(planType)) {
        return NextResponse.json({ error: 'نوع الباقة غير صالح' }, { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!targetUser) {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Calculate expiration date
    let planExpiresAt: Date | null = null;
    if (planType !== 'FREE' && durationMonths) {
        planExpiresAt = new Date();
        planExpiresAt.setMonth(planExpiresAt.getMonth() + parseInt(durationMonths));
    }

    // Update user plan
    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            planType,
            planExpiresAt: planType === 'FREE' ? null : planExpiresAt,
        } as any,
    });

    return NextResponse.json({
        success: true,
        message: `تم تحديث باقة ${targetUser.name} إلى ${planType}`,
        user: updated,
    });
}
