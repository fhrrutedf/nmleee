import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
    try {
        const { items, customerInfo, couponCode, affiliateRef } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'لا توجد منتجات في السلة' }, { status: 400 });
        }

        // Get user (seller)
        const session = await getServerSession(authOptions);
        let userId = '';

        if (session && (session.user as any)?.id) {
            userId = (session.user as any).id;
        } else {
            // Get the seller from the first item
            const firstItem = items[0];
            if (firstItem.type === 'product') {
                const product = await prisma.product.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                userId = product?.userId || '';
            } else if (firstItem.type === 'course') {
                const course = await prisma.course.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                userId = course?.userId || '';
            }
        }

        // Calculate total and apply coupon if provided
        let subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
        let discount = 0;
        let couponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() },
            });

            if (coupon && coupon.isActive) {
                if (coupon.type === 'percentage') {
                    discount = (subtotal * coupon.value) / 100;
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                        discount = coupon.maxDiscount;
                    }
                } else if (coupon.type === 'fixed') {
                    discount = coupon.value;
                }

                couponId = coupon.id;
            }
        }

        const total = subtotal - discount;

        // Find affiliate link if ref provided
        let affiliateLinkId = null;
        if (affiliateRef) {
            const affiliateLink = await prisma.affiliateLink.findUnique({
                where: { code: affiliateRef },
            });
            affiliateLinkId = affiliateLink?.id || null;
        }

        // Create Stripe checkout session
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'egp',
                product_data: {
                    name: item.title,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: 1,
        }));

        // Add discount if applicable
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
            customer_email: customerInfo.email,
            metadata: {
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone || '',
                items: JSON.stringify(items.map((i: any) => ({ id: i.id, type: i.type }))),
                couponCode: couponCode || '',
                couponId: couponId || '',
                affiliateLinkId: affiliateLinkId || '',
                userId,
            },
            ...(discount > 0 && {
                discounts: [{
                    coupon: await createStripeCoupon(discount),
                }],
            }),
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

async function createStripeCoupon(discountAmount: number) {
    const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'egp',
        duration: 'once',
    });
    return coupon.id;
}
