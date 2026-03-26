/**
 * POST /api/checkout/spaceremit
 *
 * Initiates a Spaceremit payment for a cart of items.
 * Supports: Vodafone Cash Egypt, Zain Cash Iraq, Global Credit Cards
 *
 * Flow:
 * 1. Validate items + resolve seller
 * 2. Apply coupon discounts
 * 3. Calculate tiered commission + affiliate split (decimal-safe)
 * 4. Create Order record (PENDING) with full financial breakdown
 * 5. Create Spaceremit payment session → return checkout URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';
import {
    createSpaceremitPayment,
    calculateTieredCommission,
    round2,
    type SpaceremitPaymentMethod,
} from '@/lib/spaceremit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // ── 0. Diagnostics Check (Debug Footprint) ────────────────────
        const mId = process.env.SPACEREMIT_PUBLIC_KEY || process.env.SPACEREMIT_MERCHANT_ID;
        const sKey = process.env.SPACEREMIT_SECRET_KEY || process.env.SPACEREMIT_API_KEY;

        console.log('[SPACEREMIT_INIT_DEBUG]', {
            hasPublicKey: !!mId,
            publicPrefix: mId ? mId.substring(0, 4) + '...' : 'MISSING',
            hasSecretKey: !!sKey,
            secretPrefix: sKey ? sKey.substring(0, 4) + '...' : 'MISSING'
        });

        if (!mId || !sKey) {
            console.warn('⚠️ تنبيه: مفاتيح Spaceremit غير معرفة بالكامل في السيرفر (SPACEREMIT_PUBLIC_KEY / SPACEREMIT_SECRET_KEY)');
            return NextResponse.json({ 
                error: 'بوابة الدفع غير مهيأة بشكل صحيح على السيرفر',
                code: 'SPACEREMIT_ENV_MISSING' 
            }, { status: 500 });
        }

        const {
            items,
            customerInfo,     // { name, email, phone }
            paymentMethod,    // 'vodafone_cash' | 'zaincash' | 'credit_card'
            couponCode,
            affiliateRef,
        } = body;

        // ── 1. Validate request ──────────────────────────────────────
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
        }

        if (!customerInfo?.email || !customerInfo?.name) {
            return NextResponse.json({ error: 'بيانات العميل ناقصة' }, { status: 400 });
        }

        const validMethods: SpaceremitPaymentMethod[] = [
            'vodafone_cash', 'zaincash', 'credit_card', 'usdt_trc20'
        ];
        if (!validMethods.includes(paymentMethod)) {
            return NextResponse.json({ error: 'طريقة الدفع غير مدعومة' }, { status: 400 });
        }

        // ── 2. Server-side verification of all items ────────────────
        const resolvedItems = await Promise.all(
            items.map(async (item: any) => {
                let dbItem: any = null;
                if (item.type === 'product') {
                    dbItem = await prisma.product.findUnique({
                        where: { id: item.id },
                        select: { id: true, userId: true, price: true, title: true }
                    });
                } else if (item.type === 'course') {
                    dbItem = await prisma.course.findUnique({
                        where: { id: item.id },
                        select: { id: true, userId: true, price: true, title: true }
                    });
                } else if (item.type === 'bundle') {
                    dbItem = await prisma.bundle.findUnique({
                        where: { id: item.id },
                        select: { id: true, userId: true, price: true, title: true }
                    });
                }

                if (!dbItem) {
                    throw new Error(`ITEM_NOT_FOUND: ${item.type} with ID ${item.id}`);
                }

                return {
                    id: dbItem.id,
                    type: item.type,
                    price: Number(dbItem.price),
                    userId: dbItem.userId,
                    name: dbItem.title || 'Product'
                };
            })
        );

        const session = await getServerSession(authOptions);
        const buyerUserId = (session?.user as any)?.id || null;

        // Determine seller (prioritize first item owner, fallback to ADMIN)
        let sellerId = resolvedItems[0].userId;

        if (!sellerId) {
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true }
            });
            sellerId = admin?.id || '';
        }

        if (!sellerId) {
            return NextResponse.json({ error: 'لا يمكن تحديد البائع أو النظام غير مهيأ' }, { status: 400 });
        }

        // Ensure seller plan is current
        let currentPlanType: 'FREE' | 'PRO' | 'GROWTH' | 'AGENCY' = 'FREE';
        try {
            const plan = await ensurePlanCurrent(sellerId);
            currentPlanType = (plan as any) || 'FREE';
        } catch (e) {
            currentPlanType = 'FREE';
        }

        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { custom_commission_rate: true },
        });

        // ── 3. Platform settings + currency rates ────────────────────
        const settings = await getPlatformSettings();

        // ── 4. Price calculation (BASED ON DB PRICES, NOT CART) ──────
        const subtotal = round2(
            resolvedItems.reduce((sum: number, item: any) => sum + item.price, 0)
        );

        // Apply coupon
        let discount = 0;
        let couponId: string | null = null;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });
            if (coupon && coupon.isActive) {
                if (coupon.type === 'percentage') {
                    discount = round2((subtotal * coupon.value) / 100);
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
                } else if (coupon.type === 'fixed') {
                    discount = Math.min(coupon.value, subtotal);
                }
                couponId = coupon.id;
            }
        }

        const totalAmount = round2(subtotal - discount);
        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'المبلغ الإجمالي يجب أن يكون أكبر من صفر' }, { status: 400 });
        }

        // ── 5. Resolve affiliate link ─────────────────────────────────
        const refCode = affiliateRef || req.cookies.get('ref_code')?.value;
        let affiliateLinkId: string | null = null;
        let affiliateRate = 0;

        if (refCode) {
            const link = await prisma.affiliateLink.findUnique({
                where: { code: refCode },
                select: { id: true, isActive: true, commissionValue: true, commissionType: true }
            });
            if (link?.isActive) {
                affiliateLinkId = link.id;
                affiliateRate = link.commissionType === 'percentage'
                    ? link.commissionValue
                    : round2((link.commissionValue / totalAmount) * 100);
            }
        }

        // ── 6. Tiered commission split ───────────────────────────────
        const commission = calculateTieredCommission(
            totalAmount,
            currentPlanType,
            affiliateRate,
            seller?.custom_commission_rate ?? null,
            settings.gatewayFee ?? 2.5
        );

        // ── 7. Escrow and Exchange ──────────────────────────────────
        const escrowDays = (() => {
            switch (currentPlanType) {
                case 'PRO':             return settings.proEscrowDays;
                case 'GROWTH':
                case 'AGENCY':          return settings.growthEscrowDays;
                default:                return settings.freeEscrowDays;
            }
        })();

        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + escrowDays);

        const lockedExchangeRate = (() => {
            switch (paymentMethod as SpaceremitPaymentMethod) {
                case 'vodafone_cash': return settings.usdToEgp;
                case 'zaincash':      return settings.usdToIqd;
                default:              return 1;
            }
        })();

        const localAmount = round2(totalAmount * lockedExchangeRate);
        const localCurrency = (() => {
            switch (paymentMethod as SpaceremitPaymentMethod) {
                case 'vodafone_cash': return 'EGP';
                case 'zaincash':      return 'IQD';
                default:              return 'USD';
            }
        })();

        // ── 8. Create Order in DB (ATOMIC TRANSACTION) ──────────────
        const orderNumber = `SPR-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

        const order = await prisma.$transaction(async (tx) => {
            return await tx.order.create({
                data: {
                    orderNumber,
                    userId: buyerUserId || sellerId,
                    sellerId,
                    customerName: customerInfo.name,
                    customerEmail: customerInfo.email.toLowerCase().trim(),
                    customerPhone: customerInfo.phone || '',
                    totalAmount,
                    discount,
                    status: 'PENDING',
                    paymentProvider: 'spaceremit',
                    paymentMethod: paymentMethod,
                    platformFee: commission.platformFee,
                    sellerAmount: commission.sellerAmount,
                    lockedExchangeRate,
                    availableAt,
                    affiliateLinkId,
                    referralCommission: commission.affiliateAmount,
                    couponId,
                    items: {
                        create: resolvedItems.map((ri: any) => ({
                            itemType: ri.type,
                            productId: ri.type === 'product' ? ri.id : null,
                            courseId:  ri.type === 'course'  ? ri.id : null,
                            bundleId:  ri.type === 'bundle'  ? ri.id : null,
                            price: ri.price,
                            quantity: 1,
                        }))
                    }
                } as any
            });
        });

        // ── 9. Create Spaceremit payment session ──────────────────────
        const appUrl = process.env.NEXTAUTH_URL || 'https://tmleen.com';

        const paymentParams = {
            amount: totalAmount,
            currency: 'USD' as const,
            localAmount,
            localCurrency,
            method: paymentMethod as SpaceremitPaymentMethod,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            orderId: order.id,
            description: `Tmleen Order #${orderNumber}`,
            successUrl: `${appUrl}/success?orderId=${order.id}`,
            failureUrl: `${appUrl}/cancel?orderId=${order.id}`,
        };

        console.log('[SPACEREMIT_PAYMENT_PAYLOAD_DEBUG]', paymentParams);

        const paymentSession = await createSpaceremitPayment(paymentParams);

        // Store Spaceremit payment ID in order
        await prisma.order.update({
            where: { id: order.id },
            data: { paymentId: paymentSession.paymentId } as any,
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber,
            paymentUrl: paymentSession.paymentUrl,
            paymentId: paymentSession.paymentId,
            expiresAt: paymentSession.expiresAt,
            qrCode: paymentSession.qrCode,
            reference: paymentSession.reference,
            // Financial summary for UI display
            breakdown: {
                subtotal,
                discount,
                total: totalAmount,
                localAmount,
                localCurrency,
                platformFee: commission.platformFee,
                sellerAmount: commission.sellerAmount,
                affiliateAmount: commission.affiliateAmount,
                commissionRate: commission.commissionRate,
            },
        });

    } catch (error: any) {
        console.error('[SPACEREMIT_CHECKOUT_CRITICAL_ERROR]', {
            message: error?.message,
            stack: error?.stack,
            error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });

        // Specific Error Mapping for UI
        let userMessage = 'حدث خطأ أثناء معالجة الدفع';
        let statusCode = 500;

        if (error.message?.includes('502')) {
            userMessage = 'فشل الاتصال بسيرفر Spaceremit - يرجى المحاولة لاحقاً';
            statusCode = 502;
        } else if (error.message?.includes('401') || error.message?.includes('invalid key')) {
            userMessage = 'مفتاح API الخاص ببوابة الدفع غير صالح';
            statusCode = 401;
        } else if (error.message?.includes('400')) {
            userMessage = 'بيانات الطلب غير مقبولة من قبل بوابة الدفع';
            statusCode = 400;
        }

        return NextResponse.json(
            { 
                error: userMessage, 
                details: error.message,
                timestamp: new Date().toISOString()
            },
            { status: statusCode }
        );
    }
}
