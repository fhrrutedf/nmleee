import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { transactionId, adminNotes } = await req.json();
        const { id } = await params;
        const payoutId = id;

        // Get payout
        const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: { seller: true },
        });

        if (!payout) {
            return NextResponse.json({ error: 'السحب غير موجود' }, { status: 404 });
        }

        if (payout.status !== 'PENDING') {
            return NextResponse.json({ error: 'السحب تمت معالجته بالفعل' }, { status: 400 });
        }

        // Get admin user id for audit trail
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        // Update payout status with full audit trail
        await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'COMPLETED',
                transactionId,
                adminNotes,
                processedAt: new Date(),
                completedAt: new Date(),
                paidAt: new Date(),
                approvedBy: adminUser?.id ?? null,
                approvedAt: new Date(),
            },
        });

        // Update related orders
        await prisma.order.updateMany({
            where: {
                sellerId: payout.sellerId,
                payoutStatus: 'available',
                payoutId: null,
            },
            data: {
                payoutStatus: 'paid_out',
                payoutId: payout.id,
                paidOutAt: new Date(),
            },
        });

        // Send notification to seller
        await prisma.notification.create({
            data: {
                type: 'INTERNAL',
                title: 'تمت الموافقة على طلب السحب',
                content: `تمت الموافقة على طلب السحب الخاص بك بقيمة $${payout.amount} ونعمل على تحويل المبلغ بنجاح.`,
                receiverId: payout.sellerId,
                receiverEmail: payout.seller.email,
            }
        });

        // TODO: Actually process the payment via bank/PayPal/crypto

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving payout:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
