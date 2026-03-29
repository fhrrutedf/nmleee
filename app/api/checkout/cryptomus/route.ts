import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCryptomusInvoice } from '@/lib/cryptomus';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, currency, orderId, description } = await req.json();

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cryptomus`;
        const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?order_id=${orderId}`;

        const invoice = await createCryptomusInvoice({
            amount: amount.toString(),
            currency: 'USD',
            orderId: orderId,
            callbackUrl,
            successUrl
        });

        // Save payment ID to database for tracking
        await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentId: invoice.uuid,
                paymentMethod: 'CRYPTOMUS'
            }
        });

        return NextResponse.json({ url: invoice.url });
    } catch (error: any) {
        console.error('Cryptomus Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
