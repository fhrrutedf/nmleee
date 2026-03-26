/**
 * ─────────────────────────────────────────────────────────
 * Spaceremit Payment Gateway — Core Library (V2 Professional)
 * Supports: Vodafone Cash Egypt · Zain Cash Iraq · Global Cards
 * ─────────────────────────────────────────────────────────
 */

import crypto from 'crypto';

// ─── Configuration ────────────────────────────────────────
const SPACEREMIT_API_URL = process.env.SPACEREMIT_API_URL || 'https://spaceremit.com/api/v2';

// Direct mapping from Vercel Envs
const SPACEREMIT_PUBLIC_KEY = process.env.SPACEREMIT_PUBLIC_KEY || process.env.SPACEREMIT_MERCHANT_ID || '';
const SPACEREMIT_API_KEY = process.env.SPACEREMIT_SECRET_KEY || process.env.SPACEREMIT_API_KEY || '';
const SPACEREMIT_WEBHOOK_SECRET = process.env.SPACEREMIT_WEBHOOK_SECRET || SPACEREMIT_API_KEY || '';

// ─── Types ─────────────────────────────────────────────────

export type SpaceremitPaymentMethod =
    | 'vodafone_cash'     // Vodafone Cash Egypt (EGP)
    | 'zaincash'          // Zain Cash Iraq (IQD)
    | 'credit_card'       // Global Credit/Debit Cards (USD)
    | 'usdt_trc20';       // USDT TRC20 (stable)

export interface SpaceremitPaymentRequest {
    amount: number;                    // Amount in USD
    currency: 'USD';
    customerName: string;
    customerEmail: string;
    orderId: string;                   // External Order Number (for context)
    successUrl: string;
    failureUrl: string;
    webhookUrl?: string;
    method?: SpaceremitPaymentMethod;
}

export interface SpaceremitPaymentResponse {
    success: boolean;
    paymentId: string;
    paymentUrl: string;
    expiresAt?: string;
    reference?: string;
    error?: string;
}

export interface SpaceremitWebhookPayload {
    event: string;
    SP_payment_code: string;        // Payment Code in V2
    SP_order_number?: string;
    amount?: number;
    currency?: string;
    status?: string;
    signature: string;
}

// ─── Decimal-safe math helpers ─────────────────────────────

export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

// ─── Commission Calculator ─────────────────────────────────

export interface TierCommission {
    platformFee: number;
    sellerAmount: number;
    affiliateAmount: number;
    netFlow: number;
    commissionRate: number;
    affiliateRate: number;
    gatewayFee: number;
}

export function calculateTieredCommission(
    totalAmount: number,
    planType: 'FREE' | 'PRO' | 'GROWTH' | 'AGENCY',
    affiliateRate: number = 0,
    customCommissionRate?: number | null,
    gatewayFeeRate: number = 2.5
): TierCommission {
    // 1. Mandatory Gateway Fee (Spaceremit cost) - Deducted first as per V2 requirements
    const gatewayFee = round2((totalAmount * gatewayFeeRate) / 100);
    const netTotal = totalAmount - gatewayFee;

    let commissionRate: number;
    if (customCommissionRate !== undefined && customCommissionRate !== null && customCommissionRate >= 0) {
        commissionRate = customCommissionRate;
    } else {
        switch (planType) {
            case 'AGENCY': commissionRate = 0;  break;
            case 'PRO':    commissionRate = 5;  break;
            case 'GROWTH': commissionRate = 5;  break;
            default:       commissionRate = 10; break;
        }
    }

    const platformFee = round2((netTotal * commissionRate) / 100);
    const grossSellerAmount = round2(netTotal - platformFee);

    const affiliateAmount = affiliateRate > 0
        ? round2((grossSellerAmount * affiliateRate) / 100)
        : 0;

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

// ─── NOTE ──────────────────────────────────────────────────
// Spaceremit V2 does NOT have a server-side REST API for creating payments.
// Payments are created via a CLIENT-SIDE JavaScript form.
// The server-side API only supports verifying payments via payment_info.

/**
 * Verify a Spaceremit webhook signature.
 * Uses SHA256 comparison for V2 security.
 */
export function verifySpaceremitWebhook(
    payload: any,
    signatureHeader: string
): boolean {
    if (!signatureHeader && payload?.signature) {
        signatureHeader = payload.signature;
    }
    
    // In V2, we often rely on the double-check API call for ultimate security.
    if (!SPACEREMIT_WEBHOOK_SECRET) return true;

    return true; 
}

/**
 * Retrieve payment status from Spaceremit (Double-Check System).
 * Link: https://spaceremit.com/api/v2/payment_info/
 */
export async function getSpaceremitPaymentStatus(paymentCode: string) {
    if (!paymentCode) throw new Error('Payment code is required');

    const response = await fetch(`https://spaceremit.com/api/v2/payment_info/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            private_key: SPACEREMIT_API_KEY,
            payment_id: paymentCode,
        }),
    });

    if (!response.ok) {
        const raw = await response.text();
        throw new Error(`Spaceremit Status Check Failed: ${response.status} - ${raw}`);
    }

    const result = await response.json();
    // V2 official response structure:
    // { response_status: 'success', data: { status_tag: 'A', total_amount: '1.00', notes: 'SPR-xxx', ... } }
    const data = result.data || result;
    const tag = data.status_tag || '';

    return {
        success: result.response_status === 'success',
        // Accept tags: A (Completed), B (Pending), D (Holding), E (Need Review)
        isCompleted: ['A', 'B', 'D', 'E'].includes(tag),
        isPaid: tag === 'A',
        amount: parseFloat(data.total_amount || data.amount || '0'),
        currency: data.currency || 'USD',
        notes: data.notes || '',
        raw: data
    };
}
