import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { references } = await req.json();

        if (!Array.isArray(references) || references.length === 0) {
            return NextResponse.json({ error: 'لم يتم توفير أرقام مرجعية صالحة' }, { status: 400 });
        }

        // Clean references
        const cleanRefs = references.map(ref => ref.toString().trim()).filter(Boolean);

        // Find matching orders
        const matchedOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                paymentMethod: 'manual',
                transactionRef: { in: cleanRefs }
            }
        });

        if (matchedOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'لم يتم العثور على طلبات معلقة تتطابق مع هذه الأرقام المرجعية',
                matchedCount: 0
            });
        }

        // Update orders to PAID
        const matchedIds = matchedOrders.map(o => o.id);

        await prisma.order.updateMany({
            where: {
                id: { in: matchedIds }
            },
            data: {
                status: 'PAID',
                isPaid: true,
                paidAt: new Date(),
                verifiedAt: new Date(),
            }
        });

        return NextResponse.json({
            success: true,
            message: `تم التحقق واعتماد ${matchedOrders.length} طلب بنجاح`,
            matchedCount: matchedOrders.length,
            verifiedOrders: matchedOrders.map(o => o.orderNumber)
        });

    } catch (error) {
        console.error('Verify Transfers Error:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلبات' }, { status: 500 });
    }
}
