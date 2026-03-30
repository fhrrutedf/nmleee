import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { ensurePlanCurrent } from '@/lib/commission';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

/**
 * 🛒 BULLETPROOF SALES FLOW: Order Pre-creation
 * 1. Calculate totals & discounts.
 * 2. Pre-create PENDING order in DB (Prevents Metadata Truncation).
 * 3. Include ONLY orderId in Stripe Metadata.
 */
export async function POST(req: NextRequest) {
    try {
        const { items, customerInfo, couponCode, affiliateRef, appointmentData } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'لا توجد منتجات في السلة' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        let buyerId = session?.user && (session.user as any).id ? (session.user as any).id : null;

        // 1. Determine Seller ID (from first item)
        const firstItem = items[0];
        let sellerId = '';
        if (firstItem.type === 'product') {
            const p = await prisma.product.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = p?.userId || '';
        } else if (firstItem.type === 'course') {
            const c = await prisma.course.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = c?.userId || '';
        } else if (firstItem.type === 'subscription') {
            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
            sellerId = admin?.id || '';
        }

        if (!sellerId) return NextResponse.json({ error: 'لم يتم العثور على البائع' }, { status: 400 });

        // 2. Plan Protection
        await ensurePlanCurrent(sellerId);

        // 3. Totals & Discounts
        let subtotal = items.reduce((sum: number, i: any) => sum + i.price, 0);
        let discount = 0;
        let couponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
            if (coupon && coupon.isActive) {
                if (coupon.type === 'percentage') {
                    discount = (subtotal * coupon.value) / 100;
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
                } else {
                    discount = coupon.value;
                }
                couponId = coupon.id;
            }
        }

        const totalAmount = Math.max(0, subtotal - discount);

        // 4. Affiliate Tracking
        let affiliateLinkId = null;
        if (affiliateRef) {
            const link = await prisma.affiliateLink.findUnique({ where: { code: affiliateRef } });
            affiliateLinkId = link?.id || null;
        }

        // 5. PRE-CREATE ORDER (PENDING)
        // This solves the "Metadata Truncation" problem by storing all item data in DB first.
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                customerEmail: customerInfo.email,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone || '',
                totalAmount,
                discount,
                status: 'PENDING',
                userId: buyerId || sellerId, // Buyer ID if logged in, else Seller ID as placeholder
                sellerId,
                couponId: couponId || undefined,
                affiliateLinkId: affiliateLinkId || undefined,
                paymentMethod: 'stripe',
                items: {
                    create: items.map((i: any) => ({
                        itemType: i.type,
                        productId: i.type === 'product' ? i.id : undefined,
                        courseId: i.type === 'course' ? i.id : undefined,
                        bundleId: i.type === 'bundle' ? i.id : undefined,
                        licenseKeyId: i.type === 'subscription' ? String(i.id) : undefined,
                        quantity: 1,
                        price: i.price,
                    })),
                },
                // If it's an appointment, store metadata
                paymentNotes: appointmentData ? JSON.stringify(appointmentData) : undefined,
            },
        });

        // 6. Stripe Checkout Session
        const lineItems = items.map((i: any) => ({
            price_data: {
                currency: 'usd', // Usually USD for international Stripe
                product_data: { name: i.title, images: i.image ? [i.image] : [] },
                unit_amount: Math.round(i.price * 100),
            },
            quantity: 1,
        }));

        // Add discount if applicable (Stripe level)
        let stripeDiscountCoupon = null;
        if (discount > 0) {
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(discount * 100),
                currency: 'usd',
                duration: 'once',
            });
            stripeDiscountCoupon = stripeCoupon.id;
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
            customer_email: customerInfo.email,
            metadata: {
                orderId: order.id, // THE ONLY KEY METADATA NEEDED
                sellerId,
            },
            ...(stripeDiscountCoupon && {
                discounts: [{ coupon: stripeDiscountCoupon }],
            }),
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error?.message);
        return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
    }
}
