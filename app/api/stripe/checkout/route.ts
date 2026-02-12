import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

/**
 * إنشاء Checkout Session للدفع
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, customerEmail, customerName } = body;

        // الحصول على معلومات المنتج
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                user: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
        }

        // إنشاء Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: product.title,
                            description: product.description,
                            images: product.image ? [product.image] : [],
                        },
                        unit_amount: Math.round(product.price * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
            customer_email: customerEmail,
            metadata: {
                productId: product.id,
                userId: product.userId,
                customerName: customerName || '',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء جلسة الدفع' },
            { status: 500 }
        );
    }
}
