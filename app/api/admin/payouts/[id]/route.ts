import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Next.js 16: params is a Promise
        const { id } = await params;

        // Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 });
        }

        const { action, reason, transactionId } = await req.json();

        // جلب الطلب
        const payout = await prisma.payout.findUnique({
            where: { id },
            include: { seller: true }
        });

        if (!payout) {
            return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
        }

        if (payout.status !== 'PENDING') {
            return NextResponse.json({ error: 'هذا الطلب تمت معالجته مسبقاً' }, { status: 400 });
        }

        if (action === 'approve') {
            await prisma.$transaction([
                prisma.payout.update({
                    where: { id },
                    data: {
                        status: 'PAID',
                        paidAt: new Date(),
                        approvedAt: new Date(),
                        approvedBy: admin.id,
                        transactionId: transactionId || null
                    }
                }),
                prisma.user.update({
                    where: { id: payout.sellerId },
                    data: {
                        pendingBalance: { decrement: payout.amount }
                    }
                })
            ]);
        } else if (action === 'reject') {
            await prisma.$transaction([
                prisma.payout.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        rejectedAt: new Date(),
                        rejectedBy: admin.id,
                        rejectionReason: reason || null
                    }
                }),
                prisma.user.update({
                    where: { id: payout.sellerId },
                    data: {
                        pendingBalance: { decrement: payout.amount },
                        availableBalance: { increment: payout.amount }
                    }
                })
            ]);
        } else {
            return NextResponse.json({ error: 'عملية غير صالحة' }, { status: 400 });
        }

        return NextResponse.json({ message: 'تم المعالجة بنجاح' });
    } catch (error) {
        console.error('Error handling payout:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
