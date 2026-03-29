import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOxapayInvoice } from '@/lib/oxapay';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, currency, orderId, description } = await req.json();

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/oxapay`;
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?order_id=${orderId}`;

        const invoice = await createOxapayInvoice({
            amount,
            currency: 'USD',
            orderId,
            description: description || 'Digital Purchase',
            callbackUrl,
            returnUrl
        });

        // Save track ID to database
        await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentId: invoice.trackId.toString(),
                paymentMethod: 'OXAPAY'
            }
        });

        return NextResponse.json({ url: invoice.payLink });
    } catch (error: any) {
        console.error('Oxapay Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
