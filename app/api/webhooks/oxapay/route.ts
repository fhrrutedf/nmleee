import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';
import { processPaymentCommission } from '@/lib/commission';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { status, orderId, trackId } = body;

        // Oxapay status 1 means Paid
        if (status === 'Paid') {
            const order = await prisma.order.findFirst({
                where: {
                    OR: [
                        { id: orderId },
                        { orderNumber: orderId }
                    ]
                }
            });

            if (order && !order.isPaid) {
                await prisma.$transaction(async (tx) => {
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'PAID',
                            isPaid: true,
                            paidAt: new Date(),
                            paymentMethod: 'OXAPAY',
                            paymentId: trackId.toString()
                        } as any
                    });

                    // Process commissions and fulfillment
                    await processPaymentCommission(order.id);
                });

                await fulfillPurchase(order.id);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Oxapay Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
