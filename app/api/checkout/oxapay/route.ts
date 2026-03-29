import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensurePlanCurrent, getPlatformSettings } from '@/lib/commission';
import { round2, calculateTieredCommission } from '@/lib/spaceremit';

const OXAPAY_API_URL = 'https://api.oxapay.com/api/v2';
const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!OXAPAY_MERCHANT_KEY) {
            console.error('[OXAPAY_ERROR] Missing OXAPAY_MERCHANT_KEY in Env');
            return NextResponse.json({ error: 'بوابة الدفع غير مهيأة (Env Missing)' }, { status: 500 });
        }

        const body = await req.json();
        const { items, customerInfo, couponCode, affiliateRef } = body;

        // 1. Validation
        if (!items || items.length === 0) return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 });
        if (!customerInfo?.email) return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });

        // 2. Resolve Seller
        const session = await getServerSession(authOptions);
        const buyerId = (session?.user as any)?.id || null;
        
        const firstItem = items[0];
        let sellerId = '';
        if (firstItem.type === 'product') {
            const p = await prisma.product.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = p?.userId || '';
        } else if (firstItem.type === 'course') {
            const c = await prisma.course.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = c?.userId || '';
        }
        if (!sellerId) return NextResponse.json({ error: 'لم يتم العثور على البائع' }, { status: 400 });

        // 3. Pricing & Commission
        const settings = await getPlatformSettings();
        const subtotal = round2(items.reduce((sum: number, i: any) => sum + i.price, 0));
        let discount = 0;
        let couponId = null;
        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
            if (coupon?.isActive) {
                discount = coupon.type === 'percentage' ? round2((subtotal * coupon.value) / 100) : coupon.value;
                if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
                couponId = coupon.id;
            }
        }
        const totalAmount = round2(subtotal - discount);

        // Affiliate logic
        let affiliateLinkId = null;
        let affiliateRate = 0;
        if (affiliateRef) {
            const link = await prisma.affiliateLink.findUnique({ where: { code: affiliateRef } });
            if (link?.isActive) {
                affiliateLinkId = link.id;
                affiliateRate = link.commissionType === 'percentage' ? link.commissionValue : round2((link.commissionValue / totalAmount) * 100);
            }
        }

        const currentPlan = await ensurePlanCurrent(sellerId) as any;
        const commission = calculateTieredCommission(totalAmount, currentPlan, affiliateRate);
        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + 7); // Default 7 days escrow

        // Ensure we use the Seller ID for the Order record if the user is a guest
        const orderUserId = buyerId || sellerId;

        // 4. Create Order (PENDING)
        const order = await prisma.order.create({
            data: {
                orderNumber: `OXA-${Date.now()}`,
                userId: orderUserId,
                sellerId,
                customerName: customerInfo.name,
                customerEmail: customerInfo.email.toLowerCase(),
                customerPhone: customerInfo.phone || '',
                totalAmount,
                discount,
                status: 'PENDING',
                paymentProvider: 'oxapay',
                paymentMethod: 'crypto',
                platformFee: commission.platformFee,
                sellerAmount: commission.sellerAmount,
                referralCommission: commission.affiliateAmount,
                availableAt,
                couponId,
                affiliateLinkId,
                items: {
                    create: items.map((i: any) => ({
                        itemType: i.type,
                        productId: i.type === 'product' ? i.id : null,
                        courseId: i.type === 'course' ? i.id : null,
                        price: i.price,
                        quantity: 1,
                    }))
                }
            }
        });

        // 5. Call Oxapay API
        const appUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL || 'https://tmleen.com';
        const oxaRes = await fetch(`${OXAPAY_API_URL}/merchants/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchant: OXAPAY_MERCHANT_KEY,
                amount: totalAmount,
                currency: 'USD',
                order_id: order.id,
                email: customerInfo.email,
                name: customerInfo.name,
                description: `Tmleen Order #${order.orderNumber}`,
                callback_url: `${appUrl}/api/webhooks/oxapay`,
                return_url: `${appUrl}/success?orderId=${order.id}`,
            }),
        });

        const oxaData = await oxaRes.json();
        if (oxaData.status !== 1) {
            console.error('[OXAPAY_API_ERROR]', oxaData);
            return NextResponse.json({ error: 'فشل الاتصال ببوابة Oxapay: ' + (oxaData.message || 'Unknown') }, { status: 502 });
        }

        // 6. Update Order with Oxapay Info
        try {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentId: oxaData.trackId.toString(),
                    cryptoInvoiceId: oxaData.trackId.toString()
                }
            });
        } catch (updateErr) {
            console.error('[OXAPAY_UPDATE_ERROR] Failed to update order with trackId:', updateErr);
            // Even if update fails, we have the order created and the payment URL, 
            // but the webhook might struggle to find it if we don't have trackId.
            // However, the webhook uses orderId from Oxapay callback, so we are safe.
        }

        return NextResponse.json({ paymentUrl: oxaData.payment_url });

    } catch (err: any) {
        console.error('[OXAPAY_CRITICAL]', err);
        return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
    }
}
