import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { sendOrderConfirmation } from '@/lib/email';
import { createCalendarEvent } from '@/lib/google-calendar';
import { processPaymentCommission, reversePaymentCommission } from '@/lib/commission';
import { markCartConverted, triggerWelcomeEmail, triggerSellerNotification } from '@/lib/automation-helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

/**
 * 🛰️ STRIPE WEBHOOK: Bulletproof Processing
 * 1. Order Status Tracking.
 * 2. Automated Financial Reconciliation (tiered commission, escrow).
 * 3. Atomic Refund Handling.
 * 4. Background non-blocking execution.
 */
export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;

        case 'charge.refunded':
            const charge = event.data.object as Stripe.Charge;
            await handleRefund(charge);
            break;

        case 'customer.subscription.created':
        case 'customer.subscription.deleted':
            // Logic for Stripe subscriptions (SaaS)
            break;
    }

    return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    try {
        // 1. Mark Order as PAID (prevents double processing)
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true, seller: true }
        });

        if (!order || order.status === 'PAID') return;

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAID', isPaid: true, paidAt: new Date() }
        });

        // 2. Financial Logic (Commission, Escrow, Referrals)
        await processPaymentCommission(orderId);

        // 3. BACKGROUND TASKS (Non-blocking but vital)
        // These are triggered but we don't 'await' them to ensure Stripe gets 200 Fast.
        backgroundTasks(order, session);

    } catch (error: any) {
        console.error('Webhook processing failure:', error?.message);
    }
}

/**
 * ↩️ REFUND HANDLING: Automatic Access Revocation
 */
async function handleRefund(charge: Stripe.Charge) {
    // Find the order linked to this check-out or payment intent
    const session = await stripe.checkout.sessions.list({ 
        payment_intent: charge.payment_intent as string, limit: 1 
    });
    const orderId = session.data[0]?.metadata?.orderId;
    if (!orderId) return;

    await reversePaymentCommission(orderId);

    // Revoke access (Enrollments)
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (order) {
        for (const item of order.items) {
            if (item.courseId) {
                await prisma.courseEnrollment.deleteMany({
                    where: { courseId: item.courseId, studentEmail: order.customerEmail }
                });
            }
        }
    }

    console.log(`❌ Order ${orderId} has been REFUNDED and access revoked.`);
}

/**
 * Executes high-latency tasks in safe async flow
 */
async function backgroundTasks(order: any, session: Stripe.Checkout.Session) {
    try {
        const { items, sellerId, customerEmail, customerName, totalAmount } = order;

        // I. Digital Item Enrollments (Courses)
        for (const item of items) {
            if (item.courseId) {
                await prisma.courseEnrollment.upsert({
                    where: { courseId_studentEmail: { courseId: item.courseId, studentEmail: customerEmail } },
                    update: {},
                    create: { courseId: item.courseId, studentName: customerName, studentEmail: customerEmail, orderId: order.id }
                });
            }
        }

        // II. Appointment / Calendar (if present in paymentNotes)
        if (order.paymentNotes && sellerId) {
            try {
                const apptData = JSON.parse(order.paymentNotes);
                const startDate = new Date(`${apptData.date}T${apptData.time || '00:00'}:00Z`);
                
                const meetData = await createCalendarEvent(sellerId, {
                    title: `جلسة مع ${customerName}`,
                    startDateTime: startDate,
                    durationMinutes: 60,
                    customerName,
                    customerEmail
                });

                await prisma.appointment.create({
                    data: {
                        title: `استشارة برمجية/جلسة مع ${customerName}`,
                        price: totalAmount,
                        duration: 60,
                        date: startDate,
                        status: 'CONFIRMED',
                        customerName,
                        customerEmail,
                        customerPhone: order.customerPhone || '',
                        userId: sellerId,
                        orderId: order.id,
                        meetingLink: meetData?.meetLink || undefined
                    }
                });
            } catch (e) { console.error('Calendar failing...', e); }
        }

        // III. Emails & Notifications
        await sendOrderConfirmation({
            to: customerEmail,
            customerName,
            orderNumber: order.orderNumber,
            totalAmount,
            items: [] // fetch titles locally in prod
        });

        if (sellerId) {
            await markCartConverted(customerEmail, sellerId);
            await triggerWelcomeEmail({ customerEmail, customerName, sellerId, productName: 'منتجاتك المشتراة' });
            await triggerSellerNotification({
                sellerId,
                type: 'sale',
                title: '💰 مبيعة جديدة',
                content: `استلمت $${totalAmount} من ${customerName}`,
                payload: { amount: totalAmount }
            });
        }

    } catch (e) {
        console.error('Background task error:', e);
    }
}
