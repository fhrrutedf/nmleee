import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

/**
 * إنشاء Checkout Session للدفع
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, customerEmail, customerName, couponCode, appointmentDetails } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 });
        }

        // Calculate total from items
        let totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
        let discountAmount = 0;

        // Verify coupon if provided
        if (couponCode) {
            const coupon = await prisma.coupon.findFirst({
                where: { code: couponCode, isActive: true }
            });

            if (coupon) {
                // Simplified validation for Stripe creation
                if (coupon.type === 'percentage') {
                    discountAmount = (totalAmount * coupon.value) / 100;
                } else {
                    discountAmount = coupon.value;
                }

                // Ensure discount doesn't exceed total
                discountAmount = Math.min(discountAmount, totalAmount);
            }
        }

        // Calculate proportional discount for each item (Stripe doesn't allow negative line items easily without creating Stripe Coupons)
        const discountRatio = discountAmount > 0 ? (totalAmount - discountAmount) / totalAmount : 1;

        const line_items = items.map((item: any) => {
            const discountedPrice = item.price * discountRatio;
            return {
                price_data: {
                    currency: 'egp',
                    product_data: {
                        name: item.title || 'منتج',
                        images: item.image ? [item.image] : [],
                    },
                    unit_amount: Math.round(discountedPrice * 100), // Convert to cents
                },
                quantity: 1,
            };
        });

        // إنشاء Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard/my-purchases?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
            customer_email: customerEmail,
            metadata: {
                customerName: customerName || '',
                couponCode: couponCode || '',
                discountApplied: discountAmount.toString(),
                itemsData: items.map((i: any) => `${i.id}:${i.type || 'product'}:${i.price || 0}`).join(','),
                appointmentDate: appointmentDetails?.date || '',
                appointmentTime: appointmentDetails?.time || '',
                appointmentSellerId: appointmentDetails?.sellerId || ''
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'حدث خطأ في إنشاء جلسة الدفع' },
            { status: 500 }
        );
    }
}
