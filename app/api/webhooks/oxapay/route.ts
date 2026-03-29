import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { status, trackId, orderId, amount, currency } = body;

        console.log(`[OXAPAY_WEBHOOK] Received: status=${status}, trackId=${trackId}, orderId=${orderId}`);

        // status: 0 (pending), 1 (success), 2 (expired)
        if (status === 1) {
            // Check if order exists and is not already paid
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                console.error(`[OXAPAY_WEBHOOK] Order ${orderId} not found`);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            if (order.isPaid) {
                return NextResponse.json({ message: 'Order already processed' });
            }

            // Update order status
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'PAID',
                    isPaid: true,
                    paidAt: new Date(),
                    cryptoStatus: 'CONFIRMED',
                    cryptoPaidAmount: parseFloat(amount)
                }
            });

            // Fulfill the purchase (Enroll in courses, send emails, update balance)
            await fulfillPurchase(orderId);

            console.log(`[OXAPAY_WEBHOOK] Fulfillment completed for ${orderId}`);
            return NextResponse.json({ message: 'Success' });
        }

        return NextResponse.json({ message: 'Processed status: ' + status });
    } catch (err: any) {
        console.error('[OXAPAY_WEBHOOK_ERROR]', err);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
    }
}
