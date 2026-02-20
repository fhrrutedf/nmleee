import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
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

        const { id } = params;
        const { action, reason, transactionId } = await req.json();

        // 1. جلب الطلب
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

        // 2. تحديث الطلب وبناء معاملة (Transaction) لضمان الأمان
        if (action === 'approve') {
            await prisma.$transaction([
                // تحديث حالة الطلب
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
                // خصم المبلغ من الرصيد المعلق للبائع
                prisma.user.update({
                    where: { id: payout.sellerId },
                    data: {
                        pendingBalance: { decrement: payout.amount }
                    }
                })
            ]);
        } else if (action === 'reject') {
            await prisma.$transaction([
                // تحديث حالة الطلب
                prisma.payout.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        rejectedAt: new Date(),
                        rejectedBy: admin.id,
                        rejectionReason: reason || null
                    }
                }),
                // إعادة المبلغ من الرصيد المعلق إلى الرصيد المتاح للبائع
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
