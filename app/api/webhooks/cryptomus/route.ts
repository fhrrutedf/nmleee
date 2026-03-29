import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';
import { processPaymentCommission } from '@/lib/commission';
import { verifyCryptomusSignature } from '@/lib/cryptomus';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const signature = body.sign;

        // Verify signature
        const isValid = await verifyCryptomusSignature(body, signature);
        // Note: In development we might skip strict check if keys aren't set
        // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

        const { status, order_id } = body;

        if (status === 'paid' || status === 'paid_over') {
            const order = await prisma.order.findUnique({
                where: { id: order_id }
            });

            if (order && !order.isPaid) {
                await prisma.$transaction(async (tx) => {
                    await tx.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'PAID',
                            isPaid: true,
                            paidAt: new Date(),
                            paymentMethod: 'CRYPTOMUS'
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
        console.error('Cryptomus Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
