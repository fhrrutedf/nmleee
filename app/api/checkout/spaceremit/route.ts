import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';
import { ensureUserAccount } from '@/lib/auth-utils';
import { createSpaceremitPayment, calculateTieredCommission, round2 } from '@/lib/spaceremit';

export async function POST(req: NextRequest) {
    console.log('[SPACEREMIT_V2] Initiating global checkout transaction...');
    
    try {
        const body = await req.json().catch(() => ({}));
        const { items, customerInfo, paymentMethod, couponCode, affiliateRef } = body;

        // 1. Basic Validation
        if (!items?.length) return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
        if (!customerInfo?.email) return NextResponse.json({ error: 'بيانات العميل ناقصة' }, { status: 400 });

        // 2. Fetch Keys (Environment Guard)
        const mKey = process.env.SPACEREMIT_PUBLIC_KEY || process.env.SPACEREMIT_MERCHANT_ID;
        const sKey = process.env.SPACEREMIT_SECRET_KEY || process.env.SPACEREMIT_API_KEY;
        if (!mKey || !sKey) {
            console.error('[SPACEREMIT_V2] API keys are missing in Vercel environment.');
            return NextResponse.json({ error: 'بوابة الدفع غير مهيأة (Env Missing)' }, { status: 500 });
        }

        // 3. Resilient Product Resolution
        const resolvedItems = [];
        for (const item of items) {
            const rawId = String(item.id || '').trim();
            
            // Try Product -> Course -> Bundle sequentially for maximum stability
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
                // Fallback to Frontend Data as requested by user
                console.warn(`[SPACEREMIT_V2] Using frontend fallback for item: ${rawId}`);
                resolvedItems.push({ 
                    id: rawId, 
                    type: item.type || 'product', 
                    price: Number(item.price || 0), 
                    userId: null, 
                    name: item.title || 'Digital Item' 
                });
            }
        }

        // 4. User and Seller Setup
        const session = await getServerSession(authOptions).catch(() => null);
        let buyerId = (session?.user as any)?.id || null;
        if (!buyerId) {
            buyerId = await ensureUserAccount(customerInfo.email, customerInfo.name || 'عميل تمالين');
        }

        const firstItem = resolvedItems[0];
        let sellerId = firstItem.userId;
        if (!sellerId) {
            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
            sellerId = admin?.id || '';
        }

        // 5. Commission & Platform Logic
        const [settings, seller] = await Promise.all([
            getPlatformSettings(),
            prisma.user.findUnique({ where: { id: sellerId }, select: { planType: true, custom_commission_rate: true } })
        ]);

        const planType = (await ensurePlanCurrent(sellerId).catch(() => 'FREE')) as any;
        const subtotal = round2(resolvedItems.reduce((acc, i) => acc + i.price, 0));
        
        // Coupon logic (simplified)
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
        const commission = calculateTieredCommission(totalAmount, planType, 0, seller?.custom_commission_rate, settings.gatewayFee || 2.5);

        // 6. DB Transaction (Order Creation)
        const orderNumber = `SPR-${Date.now()}`;
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
                affiliateLinkId: null, // Basic for now
                couponId,
                paymentNotes: firstItem.userId ? '' : '⚠️ وضع التوافق: بيانات من الواجهة الأمامية',
                items: {
                    create: resolvedItems.map(ri => ({
                        itemType: ri.type,
                        productId: (ri.userId && ri.type === 'product') ? ri.id : null,
                        courseId:  (ri.userId && ri.type === 'course')  ? ri.id : null,
                        bundleId:  (ri.userId && ri.type === 'bundle')  ? ri.id : null,
                        price: ri.price,
                        quantity: 1,
                    }))
                }
            } as any
        });

        // 7. Gateway Handshake
        const appUrl = process.env.NEXTAUTH_URL || 'https://tmleen.com';
        const paymentData = await createSpaceremitPayment({
            amount: totalAmount,
            currency: 'USD',
            customerName: customerInfo.name || 'Customer',
            customerEmail: customerInfo.email,
            orderId: orderNumber,
            successUrl: `${appUrl}/success?orderId=${order.id}`,
            failureUrl: `${appUrl}/cancel?orderId=${order.id}`,
            method: (paymentMethod as any) || 'global_card',
        });

        // Update with Remote ID
        await prisma.order.update({ where: { id: order.id }, data: { paymentId: paymentData.paymentId } as any });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            paymentUrl: paymentData.paymentUrl,
            paymentId: paymentData.paymentId,
            total: totalAmount
        });

    } catch (error: any) {
        console.error('[SPACEREMIT_FATAL]', error);
        return NextResponse.json({ error: error.message || 'Error occurred during checkout handshake' }, { status: 500 });
    }
}
