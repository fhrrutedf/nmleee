import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';

// الرمز السري الذي اخترته أثناء الـ Setup في السيرفر الوسيط (حطه في ملف .env تبع تمكين)
const SHAM_CASH_CALLBACK_SECRET = process.env.SHAM_CASH_CALLBACK_SECRET || 'secret123';

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signatureHeader = req.headers.get('x-shamcash-signature');

        if (!signatureHeader) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const expectedSig = crypto
            .createHmac('sha256', SHAM_CASH_CALLBACK_SECRET)
            .update(bodyText)
            .digest('hex');

        if (signatureHeader !== `sha256=${expectedSig}`) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(bodyText);

        if (payload.event === 'payment.success') {
            const tmleenOrderId = payload.metadata?.tmleen_order_id;

            if (tmleenOrderId) {
                // نبحث عن الطلب
                const order = await prisma.order.findUnique({
                    where: { id: tmleenOrderId },
                    include: { items: true }
                });

                if (order && order.status === 'PENDING') {
                    // تحديث حالة الطلب لـ LEAD/PAID
                    await prisma.order.update({
                        where: { id: tmleenOrderId },
                        data: {
                            status: 'PAID',
                            isPaid: true,
                            paymentId: payload.payment_details?.transactionRef || payload.ref_code,
                            paidAt: new Date()
                        }
                    });

                    // تفعيل الكورسات / المنتجات (هذه دالة من منصة تمكين جاهزة)
                    if (order.items && order.items.length > 0) {
                        try {
                            await fulfillPurchase(order.id, order.userId);
                        } catch (err) {
                            console.error('[FULFILL_Purchase_ERROR]', err);
                        }
                    }

                    console.log(`[SHAM_CASH_WEBHOOK] Order ${tmleenOrderId} completed!`);
                }
            }
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (err) {
        console.error('[WEBHOOK_ERROR]', err);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
