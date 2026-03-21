import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * 🛂 SELLER VERIFICATION: Submit documents for "Blue Checkmark"
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        const body = await request.json();
        const { documentUrl, documentType } = body;

        if (!documentUrl || !documentType) {
            return NextResponse.json({ error: 'يرجى تحميل الوثائق وتحديد نوعها' }, { status: 400 });
        }

        // Check if there is already a pending or approved request
        const existingRequest = await prisma.verificationRequest.findUnique({
            where: { userId: session.user.id }
        });

        if (existingRequest && (existingRequest.status === 'PENDING' || existingRequest.status === 'APPROVED')) {
            return NextResponse.json({ error: 'لديك طلب قيد المراجعة أو تم توثيقه بالفعل' }, { status: 400 });
        }

        const requestData = await prisma.verificationRequest.upsert({
            where: { userId: session.user.id },
            update: {
                documentUrl,
                documentType,
                status: 'PENDING',
                rejectionReason: null,
                updatedAt: new Date()
            },
            create: {
                userId: session.user.id,
                documentUrl,
                documentType,
                status: 'PENDING'
            }
        });

        // Trigger notification to admin (if needed)
        // await triggerAdminNotification('verification_requested', session.user.id);

        return NextResponse.json({ success: true, request: requestData });

    } catch (error) {
        console.error('Verification upload error:', error);
        return NextResponse.json({ error: 'فشل إرسال طلب التوثيق' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        const requestData = await prisma.verificationRequest.findUnique({
            where: { userId: session.user.id }
        });

        return NextResponse.json({ request: requestData });

    } catch (error) {
        return NextResponse.json({ error: 'فشل جلب الطلب' }, { status: 500 });
    }
}
