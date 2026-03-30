import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';
import { ensureUserAccount } from '@/lib/auth-utils';
import { calculateTieredCommission, round2 } from '@/lib/spaceremit';

/**
 * Spaceremit V2 Checkout — Server Side Order Preparation
 * ──────────────────────────────────────────────────────────
 * Spaceremit V2 works via a CLIENT-SIDE JS form (not a REST API).
 * This route only:
 *  1. Validates items & creates the DB Order
 *  2. Returns the order info so the FRONTEND can submit the Spaceremit form
 */
export async function POST(req: NextRequest) {
    console.log('[SPACEREMIT_V2] Preparing order for client-side payment...');

    try {
        const body = await req.json().catch(() => ({}));
        const { items, customerInfo, paymentMethod, couponCode, affiliateRef } = body;

        // 1. Validation
        if (!items?.length) return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
        if (!customerInfo?.email) return NextResponse.json({ error: 'بيانات العميل ناقصة' }, { status: 400 });

        // 2. Resilient Product Resolution
        const resolvedItems = [];
        for (const item of items) {
            const rawId = String(item.id || '').trim();

            let dbEntry = await prisma.product.findUnique({ where: { id: rawId }, select: { id: true, userId: true, price: true, title: true } });
            let type = 'product';

            if (!dbEntry) {
                dbEntry = await prisma.course.findUnique({ where: { id: rawId }, select: { id: true, userId: true, price: true, title: true } }) as any;
                type = 'course';
            }
            if (!dbEntry) {
                dbEntry = await prisma.bundle.findUnique({ where: { id: rawId }, select: { id: true, userId: true, price: true, title: true } }) as any;
                type = 'bundle';
            }

            if (dbEntry) {
                resolvedItems.push({ id: dbEntry.id, type, price: Number(dbEntry.price), userId: dbEntry.userId, name: dbEntry.title });
            } else {
                console.warn(`[SPACEREMIT_V2] DB miss, using frontend data for: ${rawId}`);
                resolvedItems.push({
                    id: rawId,
                    type: item.type || 'product',
                    price: Number(item.price || 0),
                    userId: null,
                    name: item.title || item.name || 'Digital Item'
                });
            }
        }

        // 3. User Setup
        const session = await getServerSession(authOptions).catch(() => null);
        let buyerId = (session?.user as any)?.id || null;
        if (!buyerId) {
            buyerId = await ensureUserAccount(customerInfo.email, customerInfo.name || 'عميل تمالين');
        }

        let sellerId = resolvedItems[0]?.userId;
        if (!sellerId) {
            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
            sellerId = admin?.id || '';
        }

        // 4. Commission
        const [settings, seller] = await Promise.all([
            getPlatformSettings(),
            prisma.user.findUnique({ where: { id: sellerId }, select: { planType: true, custom_commission_rate: true } })
        ]);
        const planType = (await ensurePlanCurrent(sellerId).catch(() => 'FREE')) as any;

        const subtotal = round2(resolvedItems.reduce((acc, i) => acc + i.price, 0));

        let discount = 0;
        let couponId = null;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
            if (coupon?.isActive) {
                discount = coupon.type === 'percentage' ? round2((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
                couponId = coupon.id;
            }
        }

        const totalAmount = round2(subtotal - discount);
        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'المبلغ يجب أن يكون أكبر من صفر' }, { status: 400 });
        }
        const commission = calculateTieredCommission(totalAmount, planType, 0, seller?.custom_commission_rate, settings.gatewayFee || 2.5);

        // 5. Create Order in DB (status PENDING, no paymentId yet)
        const orderNumber = `SPR-${Date.now()}`;
        const escrowDays = settings.freeEscrowDays || 10;
        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + escrowDays);

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: buyerId,
                sellerId,
                customerName: customerInfo.name || 'Customer',
                customerEmail: customerInfo.email.toLowerCase().trim(),
                customerPhone: customerInfo.phone || '',
                totalAmount,
                discount,
                status: 'PENDING',
                paymentProvider: 'spaceremit',
                paymentMethod: paymentMethod || 'global_card',
                platformFee: commission.platformFee,
                sellerAmount: commission.sellerAmount,
                gatewayFee: commission.gatewayFee,
                couponId,
                affiliateLinkId: null,
                items: {
                    create: resolvedItems.map(ri => ({
                        itemType: ri.type,
                        productId: (ri.userId && ri.type === 'product') ? ri.id : null,
                        courseId:  (ri.userId && ri.type === 'course')  ? ri.id : null,
                        bundleId:  (ri.userId && ri.type === 'bundle')  ? ri.id : null,
                        licenseKeyId: ri.type === 'subscription' ? String(ri.id) : null,
                        price: ri.price,
                        quantity: 1,
                    }))
                }
            } as any
        });

        console.log(`[SPACEREMIT_V2] Order created: ${orderNumber}, Total: $${totalAmount}`);

        // 6. Return data for CLIENT-SIDE Spaceremit form submission
        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber,
            total: totalAmount,
            currency: 'USD',
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            notes: orderNumber, // This goes into Spaceremit's "notes" field
        });

    } catch (error: any) {
        console.error('[SPACEREMIT_FATAL]', error);
        return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تجهيز الطلب' }, { status: 500 });
    }
}
