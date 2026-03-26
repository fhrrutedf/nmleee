import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';
import { ensureUserAccount } from '@/lib/auth-utils';
import {
    createSpaceremitPayment,
    calculateTieredCommission,
    round2,
    type SpaceremitPaymentMethod,
} from '@/lib/spaceremit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const mKey = process.env.SPACEREMIT_PUBLIC_KEY || process.env.SPACEREMIT_MERCHANT_ID;
        const sKey = process.env.SPACEREMIT_SECRET_KEY || process.env.SPACEREMIT_API_KEY;

        if (!mKey || !sKey) {
            return NextResponse.json({ 
                error: 'بوابة الدفع غير مهيأة بشكل صحيح على السيرفر (V2 Required)',
                code: 'SPACEREMIT_ENV_MISSING' 
            }, { status: 500 });
        }

        const {
            items,
            customerInfo,
            paymentMethod,
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

        // ── 2. Resilient Item Resolution (V2 Global Checkout) ────────
        const resolvedItems = await Promise.all(
            items.map(async (item: any) => {
                const rawId = String(item.id || '').trim();
                const requestedType = item.type || item.itemType;
                
                let dbItem: any = null;
                let finalType = 'product';

                // Helper to search all tables for a specific ID
                const findInAllTables = async (id: string) => {
                    const [p, c, b] = await Promise.all([
                        prisma.product.findUnique({ where: { id }, select: { id: true, userId: true, price: true, title: true } }),
                        prisma.course.findUnique({ where: { id: id }, select: { id: true, userId: true, price: true, title: true } }),
                        prisma.bundle.findUnique({ where: { id: id }, select: { id: true, userId: true, price: true, title: true } })
                    ]);
                    if (p) return { item: p, type: 'product' };
                    if (c) return { item: c, type: 'course' };
                    if (b) return { item: b, type: 'bundle' };
                    return null;
                };

                // A. Try direct lookup first
                const result = await findInAllTables(rawId);
                
                if (result) {
                    dbItem = result.item;
                    finalType = result.type;
                } else {
                    // B. DB MISS - Log error for diagnosis
                    console.error(`[SPACEREMIT_CHECKOUT] ITEM_NOT_FOUND in DB: "${rawId}"`);
                }

                // C. FINAL FALLBACK: Trust Frontend Data (MANDATORY per user prompt)
                // If the DB couldn't find it, we use the values passed by the frontend 
                // to ensure the user can complete the payment.
                if (!dbItem) {
                    console.warn(`[SPACEREMIT_CHECKOUT] Using Frontend Fallback for ID: ${rawId}`);
                    return {
                        id: rawId,
                        type: requestedType || 'product',
                        price: Number(item.price || 0),
                        userId: null, // Will use admin fallback below
                        name: item.title || item.name || 'Digital Item'
                    };
                }

                return {
                    id: dbItem.id,
                    type: finalType,
                    price: Number(dbItem.price),
                    userId: dbItem.userId,
                    name: dbItem.title || 'Item'
                };
            })
        );

        // ── 3. Automatic Account Creation (GUEST -> USER) ────────────
        const session = await getServerSession(authOptions);
        let buyerUserId = (session?.user as any)?.id || null;

        if (!buyerUserId && customerInfo.email) {
            // Auto-create or get existing user by email
            buyerUserId = await ensureUserAccount(customerInfo.email, customerInfo.name);
            console.log(`[SPACEREMIT_V2] Auto-created/Found user account: ${buyerUserId}`);
        }

        // Determine seller (prioritize first item owner)
        let sellerId = resolvedItems[0].userId;

        if (!sellerId) {
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true }
            });
            sellerId = admin?.id || '';
        }

        // Ensure seller plan is current
        let currentPlanType: 'FREE' | 'PRO' | 'GROWTH' | 'AGENCY' = 'FREE';
        try {
            const plan = await ensurePlanCurrent(sellerId);
            currentPlanType = (plan as any) || 'FREE';
        } catch {
            currentPlanType = 'FREE';
        }

        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: { custom_commission_rate: true },
        });

        const settings = await getPlatformSettings();

        // ── 4. Price calculation (DB BACKED) ─────────────────────────
        const subtotal = round2(
            resolvedItems.reduce((sum: number, item: any) => sum + item.price, 0)
        );

        let discount = 0;
        let couponId: string | null = null;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });
            if (coupon && coupon.isActive) {
                if (coupon.type === 'percentage') {
                    discount = round2((subtotal * coupon.value) / 100);
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

        // ── 5. Affiliate Support ─────────────────────────────────────
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

        // ── 6. Commission & Fees (Subtract Gateway Fee FIRST) ──────
        const commission = calculateTieredCommission(
            totalAmount,
            currentPlanType,
            affiliateRate,
            seller?.custom_commission_rate ?? null,
            settings.gatewayFee ?? 2.5
        );

        // Escrow Calculation
        const escrowDays = settings.freeEscrowDays || 10;
        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + escrowDays);

        // ── 7. Database Order Record ────────────────────────────────
        const orderNumber = `SPR-${Date.now()}`;

        const order = await prisma.$transaction(async (tx) => {
            return await tx.order.create({
                data: {
                    orderNumber,
                    userId: buyerUserId, // Assured by auto-creation above
                    sellerId,
                    customerName: customerInfo.name,
                    customerEmail: customerInfo.email.toLowerCase().trim(),
                    customerPhone: customerInfo.phone || '',
                    totalAmount,
                    discount,
                    status: 'PENDING',
                    paymentProvider: 'spaceremit',
                    paymentMethod: paymentMethod || 'global_card',
                    platformFee: commission.platformFee,
                    sellerAmount: commission.sellerAmount,
                    availableAt,
                    affiliateLinkId,
                    referralCommission: commission.affiliateAmount,
                    couponId,
                    paymentNotes: resolvedItems.some(ri => !ri.userId) ? '⚠️ تم استخدام بيانات الواجهة الأمامية لبعض العناصر بسبب تعذر العثور عليها في قاعدة البيانات' : '',
                    items: {
                        create: resolvedItems.map((ri: any) => {
                            // Foreign Key Protection: 
                            // Only link to DB records if they were successfully resolved from the DB.
                            // If ri.userId is null, it means we're in fallback mode.
                            const isDbBacked = !!ri.userId;
                            
                            return {
                                itemType: ri.type,
                                productId: (isDbBacked && ri.type === 'product') ? ri.id : null,
                                courseId:  (isDbBacked && ri.type === 'course')  ? ri.id : null,
                                bundleId:  (isDbBacked && ri.type === 'bundle')  ? ri.id : null,
                                price: ri.price,
                                quantity: 1,
                            };
                        })
                    }
                } as any
            });
        });

        // ── 8. Spaceremit V2 Integration ────────────────────────────
        const appUrl = process.env.NEXTAUTH_URL || 'https://tmleen.com';

        const paymentParams = {
            amount: totalAmount,
            currency: 'USD' as const,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            orderId: orderNumber, // Passing orderNumber to notes/order_number
            successUrl: `${appUrl}/success?orderId=${order.id}`,
            failureUrl: `${appUrl}/cancel?orderId=${order.id}`,
            method: paymentMethod as SpaceremitPaymentMethod,
        };

        const paymentSession = await createSpaceremitPayment(paymentParams);

        // Update Order with Gateway Reference
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
            breakdown: commission
        });

    } catch (error: any) {
        process.stdout.write(`[SPACEREMIT_CRITICAL] ${error.message}\n`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

