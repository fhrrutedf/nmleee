import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// PATCH /api/admin/users/[id] → toggle active, change role
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { isActive, role, customCommissionRate } = body;

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined) updateData.role = role;
    if (customCommissionRate !== undefined) {
        // Store via raw SQL since it's a new column not in Prisma schema
        await prisma.$executeRaw`
            UPDATE "User" SET custom_commission_rate = ${customCommissionRate === '' ? null : customCommissionRate}
            WHERE id = ${params.id}
        `;
        // Log it
        const { logActivity, LOG_ACTIONS } = await import('@/lib/activity-log');
        await logActivity({
            actorId: (session?.user as any)?.id,
            actorName: (session?.user as any)?.name,
            actorRole: 'ADMIN',
            action: LOG_ACTIONS.USER_COMMISSION_CHANGED,
            entityType: 'User',
            entityId: params.id,
            details: { customCommissionRate },
        });
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true });
        }
    }

    const user = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user);
}

// DELETE /api/admin/users/[id] → soft delete (deactivate)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.update({
        where: { id: params.id },
        data: { isActive: false },
        select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, user });
}
