/**
 * POST /api/webhooks/spaceremit
 *
 * Handles payment events from Spaceremit gateway.
 * Supports: Vodafone Cash Egypt · Zain Cash Iraq · Global Credit Cards
 *
 * Security:
 *  - HMAC-SHA256 signature verification (timing-safe)
 *  - Idempotency: checks order status before processing to prevent double-spend
 *  - Atomic DB transactions for financial operations
 *
 * Events handled:
 *  - payment.success → Fulfill order, release pending balance
 *  - payment.failed  → Mark order failed
 *  - payment.expired → Mark order expired
 *  - payment.refunded → Reverse commissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fulfillPurchase } from '@/lib/checkout';
import { processPaymentCommission, reversePaymentCommission } from '@/lib/commission';
import {
    verifySpaceremitWebhook,
    type SpaceremitWebhookPayload
} from '@/lib/spaceremit';

// Disable body parsing — we need the raw body for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
    // ── 1. Read raw body (required for HMAC verification) ──────────
    const rawBody = await req.text();

    // ── 2. Verify webhook signature ────────────────────────────────
    const signatureHeader = req.headers.get('x-spaceremit-signature') || '';

    if (!signatureHeader) {
        console.warn('[SPACEREMIT_WEBHOOK] Missing signature header — rejecting');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const isValid = verifySpaceremitWebhook(rawBody, signatureHeader);

    if (!isValid) {
        console.error('[SPACEREMIT_WEBHOOK] Invalid signature — possible forgery attempt');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // ── 3. Parse payload ────────────────────────────────────────────
    let payload: SpaceremitWebhookPayload;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { event, paymentId, metadata, transactionRef, paidAt } = payload;
    const orderId = metadata?.orderId;

    if (!orderId) {
        console.error('[SPACEREMIT_WEBHOOK] No orderId in metadata', payload);
        return NextResponse.json({ error: 'Missing orderId in metadata' }, { status: 400 });
    }

    console.log(`[SPACEREMIT_WEBHOOK] Event: ${event} | Order: ${orderId} | Payment: ${paymentId}`);

    // ── 4. Handle events ────────────────────────────────────────────
    try {
        switch (event) {
            case 'payment.success':
                await handlePaymentSuccess(orderId, paymentId, transactionRef, paidAt);
                break;

            case 'payment.failed':
                await handlePaymentFailed(orderId);
                break;

            case 'payment.expired':
                await handlePaymentExpired(orderId);
                break;

            case 'payment.refunded':
                await handlePaymentRefunded(orderId);
                break;

            default:
                console.warn(`[SPACEREMIT_WEBHOOK] Unknown event: ${event}`);
        }

        return NextResponse.json({ status: 'received', event }, { status: 200 });

    } catch (error) {
        console.error(`[SPACEREMIT_WEBHOOK_ERROR] Event: ${event} | Order: ${orderId}`, error);
        // Always return 200 to prevent Spaceremit from retrying endlessly on our logic errors
        return NextResponse.json({ status: 'error', message: 'Internal processing error' }, { status: 200 });
    }
}

// ══════════════════════════════════════════════════════════════
// Event Handlers
// ══════════════════════════════════════════════════════════════

/**
 * Handle successful payment:
 * 1. Idempotency guard (skip if already processed)
 * 2. Mark order as PAID
 * 3. Calculate & distribute commissions (atomic transaction)
 * 4. Fulfill purchase (unlock courses, send emails)
 */
async function handlePaymentSuccess(
    orderId: string,
    paymentId: string,
    transactionRef?: string,
    paidAt?: string
) {
    // Idempotency: only process PENDING orders
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, isPaid: true, sellerId: true },
    });

    if (!order) {
        console.error(`[SPACEREMIT] Order not found: ${orderId}`);
        return;
    }

    if (order.isPaid || order.status === 'PAID' || order.status === 'COMPLETED') {
        console.log(`[SPACEREMIT] Order ${orderId} already processed — skipping (idempotency)`);
        return;
    }

    // Step 1: Mark order as PAID (atomic)
    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'PAID',
            isPaid: true,
            paymentId,
            paidAt: paidAt ? new Date(paidAt) : new Date(),
            transactionRef: transactionRef || paymentId,
        } as any,
    });

    console.log(`[SPACEREMIT] Order ${orderId} marked PAID`);

    // Step 2: Process commission split (updates seller pending balance + referral tree)
    // This is already atomic within processPaymentCommission
    await processPaymentCommission(orderId);
    console.log(`[SPACEREMIT] Commissions processed for order ${orderId}`);

    // Step 3: Fulfill purchase (unlock products/courses, send confirmation emails)
    const result = await fulfillPurchase(orderId);
    if (!result.success) {
        console.error(`[SPACEREMIT] Fulfillment error for order ${orderId}:`, result.error);
    } else {
        console.log(`[SPACEREMIT] Order ${orderId} fulfilled successfully ✓`);
    }
}

/**
 * Handle failed payment — mark order as CANCELLED
 */
async function handlePaymentFailed(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true }
    });

    if (!order || order.status !== 'PENDING') return;

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' } as any,
    });

    console.log(`[SPACEREMIT] Order ${orderId} marked CANCELLED (payment failed)`);
}

/**
 * Handle expired payment — mark order as CANCELLED
 */
async function handlePaymentExpired(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true }
    });

    if (!order || order.status !== 'PENDING') return;

    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' } as any,
    });

    console.log(`[SPACEREMIT] Order ${orderId} expired`);
}

/**
 * Handle refund — reverse commissions and update balances
 */
async function handlePaymentRefunded(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, isPaid: true }
    });

    if (!order || !order.isPaid) return;

    await reversePaymentCommission(orderId);
    console.log(`[SPACEREMIT] Commissions reversed for refunded order ${orderId}`);
}
