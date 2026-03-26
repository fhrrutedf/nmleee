/**
 * ─────────────────────────────────────────────────────────
 * Spaceremit Payment Gateway — Core Library
 * Supports: Vodafone Cash Egypt · Zain Cash Iraq · Global Cards
 * ─────────────────────────────────────────────────────────
 */

import crypto from 'crypto';

// ─── Configuration ────────────────────────────────────────
const SPACEREMIT_API_URL = process.env.SPACEREMIT_API_URL || 'https://api.spaceremit.com/v1';
const SPACEREMIT_MERCHANT_ID = process.env.SPACEREMIT_MERCHANT_ID || '';
const SPACEREMIT_API_KEY = process.env.SPACEREMIT_API_KEY || '';
const SPACEREMIT_WEBHOOK_SECRET = process.env.SPACEREMIT_WEBHOOK_SECRET || '';

// ─── Types ─────────────────────────────────────────────────

export type SpaceremitPaymentMethod =
    | 'vodafone_cash'     // Vodafone Cash Egypt (EGP)
    | 'zaincash'          // Zain Cash Iraq (IQD)
    | 'credit_card'       // Global Credit/Debit Cards (USD)
    | 'usdt_trc20';       // USDT TRC20 (stable)

export interface SpaceremitPaymentRequest {
    amount: number;                    // Amount in USD (platform base currency)
    currency: 'USD';                   // Always USD — gateway converts internally
    localAmount?: number;              // Pre-calculated local amount for display
    localCurrency?: string;            // 'EGP' | 'IQD' etc.

    method: SpaceremitPaymentMethod;

    customerName: string;
    customerEmail: string;
    customerPhone?: string;

    orderId: string;                   // Our internal order ID (metadata)
    description: string;

    successUrl: string;
    failureUrl: string;
    webhookUrl?: string;
}

export interface SpaceremitPaymentResponse {
    success: boolean;
    paymentId: string;
    paymentUrl: string;               // Redirect URL for customer
    expiresAt: string;                // ISO datetime
    qrCode?: string;                  // For mobile wallets (QR scan)
    reference?: string;               // Reference number to show customer
    error?: string;
}

export interface SpaceremitWebhookPayload {
    event: 'payment.success' | 'payment.failed' | 'payment.expired' | 'payment.refunded';
    paymentId: string;
    merchantId: string;
    amount: number;
    currency: string;
    method: SpaceremitPaymentMethod;
    status: 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
    metadata: {
        orderId: string;
        [key: string]: string;
    };
    customerName?: string;
    customerEmail?: string;
    transactionRef?: string;
    paidAt?: string;
    signature: string;
}

// ─── Decimal-safe math helpers ─────────────────────────────

/** Round to 2 decimal places using integer arithmetic to avoid float drift */
export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Integer-safe percentage calculation.
 * Uses BigInt-style fixed-point to avoid 0.1 + 0.2 problems.
 */
export function safePercent(amount: number, percent: number): number {
    // Multiply to cents, calculate, then back
    const amountCents = Math.round(amount * 100);
    const feeCents = Math.round((amountCents * percent) / 100);
    return feeCents / 100;
}

// ─── Commission Calculator ─────────────────────────────────

export interface TierCommission {
    platformFee: number;       // What platform keeps
    sellerAmount: number;      // What seller gets
    affiliateAmount: number;   // What affiliate gets (if any)
    netFlow: number;           // sanity check = platform + seller + affiliate ≈ totalAmount
    commissionRate: number;
    affiliateRate: number;
    gatewayFee: number; // Added: Cost of the checkout provider
}

/**
 * Multi-tier commission splitter with affiliate support.
 *
 * Tier mapping:
 *  - FREE  → 10% flat fee, no subscription cost
 *  - PRO   → $19/mo + 5% commission
 *  - GROWTH/AGENCY → $49/mo + 0% platform commission (gateway fees only ~ 2.5%)
 *
 * Affiliate commission is set by the seller (e.g. 20%) and is a % of the SELLER'S portion.
 */
export function calculateTieredCommission(
    totalAmount: number,
    planType: 'FREE' | 'PRO' | 'GROWTH' | 'AGENCY',
    affiliateRate: number = 0,         // % the affiliate earns from SELLER's portion
    customCommissionRate?: number | null,
    gatewayFeeRate: number = 2.5       // New: Dynamic rate from settings
): TierCommission {
    // 1. Mandatory Gateway Fee (Spaceremit cost dynamic)
    const gatewayFee = round2((totalAmount * gatewayFeeRate) / 100);
    const netTotal = totalAmount - gatewayFee;

    // 2. Determine platform commission rate
    let commissionRate: number;

    if (customCommissionRate !== undefined && customCommissionRate !== null && customCommissionRate >= 0) {
        commissionRate = customCommissionRate; // Admin overrides everything
    } else {
        switch (planType) {
            case 'AGENCY': commissionRate = 0;  break;  // $49/mo + 0% platform fee
            case 'PRO':    commissionRate = 5;  break;
            case 'GROWTH': commissionRate = 5;  break;
            default:       commissionRate = 10; break;  // FREE tier
        }
    }

    // 3. Platform fee (of the net total after gateway fee)
    const platformFee = round2((netTotal * commissionRate) / 100);
    const grossSellerAmount = round2(netTotal - platformFee);

    // 4. Affiliate share (% of seller's gross)
    const affiliateAmount = affiliateRate > 0
        ? round2((grossSellerAmount * affiliateRate) / 100)
        : 0;

    // 5. Final seller net
    const sellerAmount = round2(grossSellerAmount - affiliateAmount);

    return {
        platformFee,
        sellerAmount,
        affiliateAmount,
        netFlow: round2(platformFee + sellerAmount + affiliateAmount + gatewayFee),
        commissionRate,
        affiliateRate,
        gatewayFee,
    };
}

// ─── API Client ────────────────────────────────────────────

/**
 * Create a new Spaceremit payment session.
 */
export async function createSpaceremitPayment(
    params: SpaceremitPaymentRequest
): Promise<SpaceremitPaymentResponse> {
    const body = {
        merchant_id: SPACEREMIT_MERCHANT_ID,
        amount: params.amount,
        currency: params.currency,
        local_amount: params.localAmount,
        local_currency: params.localCurrency,
        payment_method: params.method,
        customer: {
            name: params.customerName,
            email: params.customerEmail,
            phone: params.customerPhone,
        },
        metadata: {
            orderId: params.orderId,
        },
        description: params.description,
        redirect_urls: {
            success: params.successUrl,
            failure: params.failureUrl,
        },
        webhook_url: params.webhookUrl || `${process.env.NEXTAUTH_URL}/api/webhooks/spaceremit`,
    };

    const signature = generateRequestSignature(body);

    const response = await fetch(`${SPACEREMIT_API_URL}/payments/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': SPACEREMIT_API_KEY,
            'X-Signature': signature,
            'X-Merchant-Id': SPACEREMIT_MERCHANT_ID,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch {
            const raw = await response.text().catch(() => 'No response body');
            errorData = { raw };
        }
        
        const errorMessage = `Spaceremit API error: ${response.status} — ${JSON.stringify(errorData)}`;
        console.error('[SPACEREMIT_API_CRITICAL_FAILURE]', {
            status: response.status,
            errorData,
            bodySent: { ...body, merchant_id: '***', customer: { ...body.customer, email: '***@***.***' } } // Mask sensitive data
        });
        
        throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
        success: true,
        paymentId: data.payment_id || data.id,
        paymentUrl: data.payment_url || data.checkout_url,
        expiresAt: data.expires_at,
        qrCode: data.qr_code,
        reference: data.reference,
    };
}

/**
 * Verify a Spaceremit webhook signature to prevent forgery.
 * Uses HMAC-SHA256 on the raw request body.
 */
export function verifySpaceremitWebhook(
    rawBody: string,
    signatureHeader: string
): boolean {
    if (!SPACEREMIT_WEBHOOK_SECRET) {
        console.error('[SPACEREMIT] SPACEREMIT_WEBHOOK_SECRET is not set!');
        return false;
    }

    const expected = crypto
        .createHmac('sha256', SPACEREMIT_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHeader.replace('sha256=', ''), 'hex'),
            Buffer.from(expected, 'hex')
        );
    } catch {
        return false;
    }
}

/** Generate HMAC signature for outgoing API requests */
function generateRequestSignature(body: object): string {
    const payload = JSON.stringify(body);
    return crypto
        .createHmac('sha256', SPACEREMIT_API_KEY)
        .update(payload)
        .digest('hex');
}

/**
 * Retrieve payment status from Spaceremit (for polling fallback).
 */
export async function getSpaceremitPaymentStatus(paymentId: string) {
    const response = await fetch(`${SPACEREMIT_API_URL}/payments/${paymentId}`, {
        headers: {
            'X-API-Key': SPACEREMIT_API_KEY,
            'X-Merchant-Id': SPACEREMIT_MERCHANT_ID,
        },
    });

    if (!response.ok) {
        throw new Error(`Spaceremit status check failed: ${response.status}`);
    }

    return response.json();
}
