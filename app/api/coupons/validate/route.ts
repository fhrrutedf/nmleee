import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * التحقق من صلاحية كوبون الخصم
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, totalAmount } = body;

        const coupon = await prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                isActive: true,
            },
        });

        if (!coupon) {
            return NextResponse.json(
                { error: 'كود الكوبون غير صحيح' },
                { status: 404 }
            );
        }

        // Check if expired
        if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
            return NextResponse.json(
                { error: 'كود الكوبون منتهي الصلاحية' },
                { status: 400 }
            );
        }

        // Check max uses
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json(
                { error: 'تم استنفاذ استخدامات الكوبون' },
                { status: 400 }
            );
        }

        // Check minimum purchase
        if (coupon.minPurchase && totalAmount < coupon.minPurchase) {
            return NextResponse.json(
                { error: `الحد الأدنى للشراء هو ${coupon.minPurchase} ج.م` },
                { status: 400 }
            );
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (totalAmount * coupon.value) / 100;
        } else {
            discount = coupon.value;
        }

        const finalAmount = Math.max(0, totalAmount - discount);

        return NextResponse.json({
            valid: true,
            discount,
            finalAmount,
            couponId: coupon.id,
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في التحقق من الكوبون' },
            { status: 500 }
        );
    }
}
