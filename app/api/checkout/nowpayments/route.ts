import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNowPaymentsInvoice } from '@/lib/nowpayments';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, currency, orderId, description } = await req.json();

        const invoice = await createNowPaymentsInvoice({
            price_amount: amount,
            price_currency: 'usd',
            pay_currency: 'usdttrc20', // Default to USDT TRC20 for Nawaf
            order_id: orderId,
            order_description: description
        });

        // Save payment ID to database for tracking
        await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentId: invoice.payment_id,
                paymentMethod: 'USDT'
            }
        });

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error('NOWPayments Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
