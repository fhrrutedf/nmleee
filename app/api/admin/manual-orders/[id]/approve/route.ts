import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const orderId = params.id;

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json({ error: 'الطلب تمت معالجته بالفعل' }, { status: 400 });
        }

        // Update order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                isPaid: true,
                paidAt: new Date(),
                verifiedBy: admin.id,
                verifiedAt: new Date(),
            },
        });

        // Update seller balance
        if (order.sellerId) {
            await prisma.user.update({
                where: { id: order.sellerId },
                data: {
                    pendingBalance: { increment: order.sellerAmount },
                    totalEarnings: { increment: order.sellerAmount },
                },
            });
        }

        // TODO: Send notification to customer
        // TODO: Send notification to seller

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving order:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
