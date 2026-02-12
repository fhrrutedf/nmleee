import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Get session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session.metadata) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
        }

        // Find order in database
        const order = await prisma.order.findFirst({
            where: {
                customerEmail: session.customer_email || '',
                createdAt: {
                    gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        course: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Format response
        const response = {
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
            items: order.items.map((item) => ({
                type: item.itemType,
                title: item.product?.title || item.course?.title || 'Unknown',
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error verifying order:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
