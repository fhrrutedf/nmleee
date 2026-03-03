import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';

// GET /api/admin/payouts - all payout requests
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;

    const payouts = await prisma.payout.findMany({
        where: status ? { status: status as any } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            seller: {
                select: {
                    id: true, name: true, email: true,
                    payoutMethod: true, bankDetails: true,
                    paypalEmail: true, cryptoWallet: true,
                },
            },
        },
    });

    return NextResponse.json(payouts);
}

// PATCH /api/admin/payouts - approve or reject a payout
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { payoutId, action, transactionId, note } = await req.json();

    if (!payoutId || !action) {
        return NextResponse.json({ error: 'payoutId and action required' }, { status: 400 });
    }

    const payout = await prisma.payout.findUnique({
        where: { id: payoutId },
        include: { seller: { select: { name: true, email: true } } },
    });

    if (!payout) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'approve') {
        await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                transactionId,
                adminNotes: note,
            },
        });

        await logActivity({
            actorId: user.id,
            actorName: user.name,
            actorRole: 'ADMIN',
            action: LOG_ACTIONS.PAYOUT_APPROVED,
            entityType: 'Payout',
            entityId: payoutId,
            details: { amount: payout.amount, sellerId: payout.sellerId, transactionId },
        });

        return NextResponse.json({ success: true, message: 'تمت الموافقة' });
    }

    if (action === 'reject') {
        await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectionReason: note,
                adminNotes: note
            },
        });

        await logActivity({
            actorId: user.id,
            actorName: user.name,
            actorRole: 'ADMIN',
            action: LOG_ACTIONS.PAYOUT_REJECTED,
            entityType: 'Payout',
            entityId: payoutId,
            details: { amount: payout.amount, sellerId: payout.sellerId, note },
        });

        return NextResponse.json({ success: true, message: 'تم الرفض' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
