import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';
import { processPaymentCommission } from '@/lib/commission';
import {
    getSpaceremitPaymentStatus
} from '@/lib/spaceremit';

export async function POST(req: NextRequest) {
    try {
        // Spaceremit V2 often sends data as Form Data or JSON depending on config
        const contentType = req.headers.get('content-type') || '';
        let payload: any = {};

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                payload[key] = value;
            });
        }

        // 1. Extract Payment Code (V2 Logic)
        const paymentCode = payload.SP_payment_code || payload.payment_code;
        
        if (!paymentCode) {
            console.error('[SPACEREMIT_WEBHOOK] No payment code found in payload');
            return NextResponse.json({ error: 'No code' }, { status: 400 });
        }

        console.log(`[SPACEREMIT_WEBHOOK] Received callback for code: ${paymentCode}`);

        // 2. Double-Check System (MANDATORY V2 Logic)
        const verifyData = await getSpaceremitPaymentStatus(paymentCode);

        // Verify if it's REALLY completed (Tag A)
        if (!verifyData.isCompleted) {
            console.warn(`[SPACEREMIT_WEBHOOK] Payment ${paymentCode} is NOT completed yet. Status: ${verifyData.raw?.tag || 'Unknown'}`);
            return NextResponse.json({ status: 'pending_verification' });
        }

        // 3. Resolve Order
        // The notes field in V2 contains our Order Number
        const orderNumber = verifyData.raw?.notes || payload.notes;

        if (!orderNumber) {
            console.error('[SPACEREMIT_WEBHOOK] Could not resolve order number from gateway response');
            return NextResponse.json({ error: 'No order reference' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { user: true }
        });

        if (!order) {
            console.error(`[SPACEREMIT_WEBHOOK] Order ${orderNumber} not found in database`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 4. Idempotency Guard
        if (order.isPaid || order.status === 'PAID') {
            return NextResponse.json({ status: 'already_processed' });
        }

        // 5. Finalize Success
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: 'PAID',
                    isPaid: true,
                    paidAt: new Date(),
                    transactionRef: paymentCode
                } as any
            });

            // Process commissions and fulfillment
            await processPaymentCommission(order.id);
        });

        await fulfillPurchase(order.id);

        console.log(`[SPACEREMIT_WEBHOOK] SUCCESS: Order ${order.orderNumber} confirmed via Double-Check (Tag A)`);

        return NextResponse.json({ status: 'success', orderId: order.id });

    } catch (error: any) {
        console.error('[SPACEREMIT_WEBHOOK_CRITICAL]', error.message);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 200 });
    }
}

