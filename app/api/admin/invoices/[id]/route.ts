import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/invoices/[id] — تفاصيل فاتورة واحدة
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        status: true,
                        customerName: true,
                        customerEmail: true,
                        customerPhone: true,
                        paymentMethod: true,
                        paymentProof: true,
                        transactionRef: true,
                        senderPhone: true,
                        paymentCountry: true,
                        paymentProvider: true,
                        createdAt: true,
                        items: {
                            select: {
                                price: true,
                                itemType: true,
                                product: { select: { title: true, image: true } },
                                course: { select: { title: true, image: true } },
                                bundle: { select: { title: true, image: true } },
                            },
                        },
                        seller: {
                            select: {
                                name: true,
                                username: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'الفاتورة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ error: 'خطأ في جلب الفاتورة' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/invoices/[id] — تحديث حالة الفاتورة
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, notes } = body;

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: 'خطأ في تحديث الفاتورة' }, { status: 500 });
    }
}
