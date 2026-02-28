import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendOrderConfirmation, sendSubscriptionConfirmation } from '@/lib/email';
import { createCalendarEvent } from '@/lib/google-calendar';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
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

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            await handleSubscriptionEvent(event.data.object as Stripe.Subscription, event.type);
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

        const itemsDataString = metadata.itemsData || '';
        const rawItems = itemsDataString ? itemsDataString.split(',') : [];
        const items = rawItems.map(str => {
            const [id, type, price] = str.split(':');
            return { id, type, price: parseFloat(price || '0') };
        });

        const totalAmount = (session.amount_total || 0) / 100;
        const discountApplied = parseFloat(metadata.discountApplied || '0');
        const userId = metadata.userId || items[0]?.id || 'guest'; // We might need an actual user ID.
        const couponId = metadata.couponId;
        const affiliateRefCode = metadata.affiliateRef;

        // استخراج معرف الإحالة الحقيقي من الكود
        let affiliateLinkId = null;
        if (affiliateRefCode) {
            const link = await prisma.affiliateLink.findUnique({
                where: { code: affiliateRefCode }
            });
            if (link) {
                affiliateLinkId = link.id;
            }
        }

        // Appointment variables
        const apptDate = metadata.appointmentDate;
        const apptTime = metadata.appointmentTime;
        const apptSellerId = metadata.appointmentSellerId;

        // Calculate platform commission (10%)
        const platformFeePercentage = 10;
        const platformFee = (totalAmount * platformFeePercentage) / 100;
        const sellerAmount = totalAmount - platformFee;

        // Get seller ID from first item (assuming all items from same seller)
        let sellerId = null;
        if (apptSellerId) {
            sellerId = apptSellerId;
        } else if (items.length > 0) {
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
                userId: userId !== 'guest' ? userId : sellerId || '', // fallback
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
                        bundleId: item.type === 'bundle' ? item.id : undefined,
                        quantity: 1,
                        price: item.price || 0,
                    })),
                },
            },
        });

        // إذا كان هناك بيانات موعد، نقوم بإنشاء الموعد وربطه بالطلب
        if (apptDate !== undefined && apptDate !== '' && sellerId) {
            // Combine date and time
            const dateStr = `${apptDate}T${apptTime || '00:00'}:00Z`;
            const startDate = new Date(dateStr);
            const customerName = metadata.customerName || session.customer_details?.name || 'Vip Customer';
            const customerEmail = session.customer_email || '';

            // Try to create Google Calendar event first to get Meet link
            let meetData = null;
            try {
                meetData = await createCalendarEvent(sellerId, {
                    title: `استشارة برمجية/جلسة مع ${customerName}`,
                    startDateTime: startDate,
                    durationMinutes: 60,
                    customerName,
                    customerEmail,
                });
            } catch (err) {
                console.error('Failed to create Calendar Event in webhook', err);
            }

            await prisma.appointment.create({
                data: {
                    title: `استشارة برمجية/جلسة`,
                    price: totalAmount,
                    duration: 60, // Default duration 60 mins
                    date: startDate,
                    status: 'CONFIRMED',
                    customerName,
                    customerEmail,
                    customerPhone: metadata.customerPhone || session.customer_details?.phone || '',
                    userId: sellerId,
                    orderId: order.id,
                    meetingLink: meetData?.meetLink || undefined,
                }
            });
            console.log('✅ Appointment created successfully', meetData?.meetLink ? `with Meet URL: ${meetData.meetLink}` : '');
        }

        // Grant course enrollments for any courses bought directly or inside bundles
        for (const item of items) {
            if (item.type === 'course' && session.customer_email) {
                await prisma.courseEnrollment.upsert({
                    where: {
                        courseId_studentEmail: {
                            courseId: item.id,
                            studentEmail: session.customer_email
                        }
                    },
                    update: { orderId: order.id },
                    create: {
                        courseId: item.id,
                        studentName: metadata.customerName || 'العميل',
                        studentEmail: session.customer_email,
                        orderId: order.id
                    }
                });
            } else if (item.type === 'bundle' && session.customer_email) {
                // Determine if any courses exist inside this bundle
                const bundle = await prisma.bundle.findUnique({
                    where: { id: item.id },
                    include: { products: { include: { product: true } } }
                });

                if (bundle) {
                    for (const bp of bundle.products) {
                        if (bp.product.category === 'courses' || bp.product.category === 'course') {
                            await prisma.courseEnrollment.upsert({
                                where: {
                                    courseId_studentEmail: {
                                        courseId: bp.product.id,
                                        studentEmail: session.customer_email
                                    }
                                },
                                update: { orderId: order.id },
                                create: {
                                    courseId: bp.product.id,
                                    studentName: metadata.customerName || 'العميل',
                                    studentEmail: session.customer_email,
                                    orderId: order.id
                                }
                            });
                        }
                    }
                }
            }
        }

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
                    discount: discountApplied,
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

/**
 * معالجة أحداث الاشتراكات (SaaS)
 */
async function handleSubscriptionEvent(subscription: Stripe.Subscription, eventType: string) {
    try {
        const metadata = subscription.metadata;
        const planId = metadata?.planId;
        const userId = metadata?.userId;

        // إذا لم يكن هناك ميتاداتا، قد يكون اشتراك قديم أو يدوي، نحاول البحث عنه في قاعدة البيانات
        if (!planId || !userId) {
            const existingSub = await prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscription.id }
            });

            if (existingSub) {
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: {
                        status: subscription.status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    }
                });
                console.log(`✅ Subscription (existing) ${subscription.id} updated`);
            } else {
                console.log('⚠️ Skipping subscription event due to missing metadata');
            }
            return;
        }

        // إنشاء أو تحديث الاشتراك
        await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            update: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            create: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                planId: planId,
                customerId: userId,
            }
        });

        console.log(`✅ Subscription ${subscription.id} synced successfully`);

        // إرسال بريد التأكيد لو كان اشتراكاً جديداً
        if (eventType === 'customer.subscription.created' && subscription.status === 'active') {
            const planName = metadata?.planName || 'الباقة المتميزة';
            const userRecord = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true }
            });

            if (userRecord && userRecord.email) {
                const amount = (subscription.items.data[0]?.price?.unit_amount || 0) / 100;
                const interval = subscription.items.data[0]?.plan?.interval || 'month';

                await sendSubscriptionConfirmation({
                    to: userRecord.email,
                    customerName: userRecord.name || 'عزيزي المشترك',
                    planName,
                    amount,
                    billingCycle: interval
                });
            }
        }

    } catch (error) {
        console.error('Error handling subscription event:', error);
    }
}
