import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * 🛂 ADMIN VERIFICATION PROCESSING: Approve or Reject Sellers
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        // Admin check
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, id: true }
        });

        if (adminUser?.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

        const requests = await prisma.verificationRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ requests });

    } catch (error) {
        return NextResponse.json({ error: 'فشل جلب طلبات التوثيق' }, { status: 500 });
    }
}

/**
 * Process (Approve/Reject) a request
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, id: true }
        });

        if (adminUser?.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

        const body = await request.json();
        const { requestId, decision, rejectionReason } = body; // decision: 'APPROVE', 'REJECT'

        if (!requestId || !decision) {
            return NextResponse.json({ error: 'بيانات مفقودة' }, { status: 400 });
        }

        const verificationReq = await prisma.verificationRequest.findUnique({
            where: { id: requestId },
        });

        if (!verificationReq) return NextResponse.json({ error: 'طلب غير موجود' }, { status: 404 });

        if (decision === 'APPROVE') {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: verificationReq.userId },
                    data: { isVerified: true }
                }),
                prisma.verificationRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'APPROVED',
                        processedBy: adminUser.id,
                        processedAt: new Date()
                    }
                })
            ]);
        } else {
            await prisma.verificationRequest.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: rejectionReason || 'الوثائق غير واضحة أو ناقصة',
                    processedBy: adminUser.id,
                    processedAt: new Date()
                }
            });
            // Revoke status if manually verified before
            await prisma.user.update({
                where: { id: verificationReq.userId },
                data: { isVerified: false }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Verification processing error:', error);
        return NextResponse.json({ error: 'فشل معالجة الطلب' }, { status: 500 });
    }
}
