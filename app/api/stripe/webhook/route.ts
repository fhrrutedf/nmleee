import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendOrderConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

/**
 * Webhook لاستقبال أحداث Stripe
 */
export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // معالجة الأحداث المختلفة
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;

        case 'payment_intent.succeeded':
            console.log('✅ Payment succeeded:', event.data.object.id);
            break;

        case 'payment_intent.payment_failed':
            console.log('❌ Payment failed:', event.data.object.id);
            break;

        default:
            console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
}

/**
 * معالجة إتمام الدفع
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
        const metadata = session.metadata;

        if (!metadata) {
            console.error('Missing metadata in session');
            return;
        }

        const items = metadata.items ? JSON.parse(metadata.items) : [];
        const totalAmount = (session.amount_total || 0) / 100;
        const userId = metadata.userId;
        const couponId = metadata.couponId;
        const affiliateLinkId = metadata.affiliateLinkId;

        // Calculate platform commission (10%)
        const platformFeePercentage = 10;
        const platformFee = (totalAmount * platformFeePercentage) / 100;
        const sellerAmount = totalAmount - platformFee;

        // Get seller ID from first item (assuming all items from same seller)
        let sellerId = null;
        if (items.length > 0) {
            const firstItem = items[0];
            if (firstItem.type === 'product') {
                const product = await prisma.product.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                sellerId = product?.userId;
            } else if (firstItem.type === 'course') {
                const course = await prisma.course.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                sellerId = course?.userId;
            }
        }

        // Create order with commission details
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerEmail: session.customer_email || '',
                customerName: metadata.customerName || '',
                customerPhone: metadata.customerPhone || '',
                totalAmount,
                platformFee,
                sellerAmount,
                status: 'PAID',
                userId: userId || undefined,
                sellerId: sellerId || undefined,
                couponId: couponId || undefined,
                affiliateLinkId: affiliateLinkId || undefined,
                payoutStatus: 'pending',
                availableAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                items: {
                    create: items.map((item: any) => ({
                        itemType: item.type,
                        productId: item.type === 'product' ? item.id : undefined,
                        courseId: item.type === 'course' ? item.id : undefined,
                        quantity: 1,
                        price: item.price || 0,
                    })),
                },
            },
        });

        console.log('✅ Order created:', order.id);
        console.log('💰 Platform Fee:', platformFee);
        console.log('💵 Seller Amount:', sellerAmount);

        // Update seller balance
        if (sellerId) {
            await prisma.user.update({
                where: { id: sellerId },
                data: {
                    pendingBalance: { increment: sellerAmount },
                    totalEarnings: { increment: sellerAmount },
                },
            });
            console.log('✅ Seller balance updated');
        }

        // Update coupon usage
        if (couponId) {
            await prisma.coupon.update({
                where: { id: couponId },
                data: {
                    usageCount: { increment: 1 },
                },
            });

            await prisma.couponUsage.create({
                data: {
                    couponId,
                    orderId: order.id,
                    discount: 0,
                    customerEmail: session.customer_email || '',
                },
            });
        }

        // Handle affiliate commission
        if (affiliateLinkId) {
            const affiliateLink = await prisma.affiliateLink.findUnique({
                where: { id: affiliateLinkId },
            });

            if (affiliateLink) {
                let commission = 0;
                if (affiliateLink.commissionType === 'percentage') {
                    commission = (totalAmount * affiliateLink.commissionValue) / 100;
                } else {
                    commission = affiliateLink.commissionValue;
                }

                await prisma.affiliateSale.create({
                    data: {
                        linkId: affiliateLinkId,
                        orderId: order.id,
                        amount: totalAmount,
                        commission,
                        status: 'pending',
                    },
                });

                await prisma.affiliateLink.update({
                    where: { id: affiliateLinkId },
                    data: {
                        salesCount: { increment: 1 },
                        revenue: { increment: totalAmount },
                        commission: { increment: commission },
                    },
                });

                console.log('✅ Affiliate commission calculated:', commission);
            }
        }

        // Send order confirmation email
        await sendOrderConfirmation({
            to: session.customer_email || '',
            customerName: metadata.customerName || 'العميل',
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items: items.map((item: any) => ({
                title: item.title || 'منتج',
                price: item.price || 0,
            })),
        });

    } catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}
