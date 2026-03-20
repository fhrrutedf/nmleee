import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { ensurePlanCurrent } from '@/lib/commission';

// تأكد من وضع رابط سيرفر بوابة الشام كاش هنا (نفس البورت الذي اخترته في الـ Setup)
const SHAM_CASH_URL = process.env.SHAM_CASH_URL || 'http://localhost:3030';

export async function POST(req: NextRequest) {
    try {
        const { items, customerInfo, couponCode, affiliateRef } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'لا توجد منتجات في السلة' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        let userId = (session?.user as any)?.id || '';
        let sellerId = '';

        const firstItem = items[0];
        if (firstItem.type === 'product') {
            const product = await prisma.product.findUnique({ where: { id: firstItem.id } });
            sellerId = product?.userId || '';
        } else if (firstItem.type === 'course') {
            const course = await prisma.course.findUnique({ where: { id: firstItem.id } });
            sellerId = course?.userId || '';
        }

        if (!userId) userId = sellerId;
        if (sellerId) await ensurePlanCurrent(sellerId);

        let subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
        let discount = 0;
        let couponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
            if (coupon && coupon.isActive) {
                if (coupon.type === 'percentage') {
                    discount = (subtotal * coupon.value) / 100;
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
                } else if (coupon.type === 'fixed') {
                    discount = coupon.value;
                }
                couponId = coupon.id;
            }
        }

        const total = subtotal - discount;

        // 1. إنشاء الطلب مؤقتاً في منصتنا (موقعك تمكين) بحالة PENDING
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const tmleenOrder = await prisma.order.create({
            data: {
                orderNumber,
                userId: userId,
                sellerId: sellerId,
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone || '',
                totalAmount: total,
                status: 'PENDING',
                paymentProvider: 'shamcash',
                paymentMethod: 'manual',
                couponId,
                discount,
                items: {
                    create: items.map((item: any) => ({
                        itemType: item.type,
                        productId: item.type === 'product' ? item.id : null,
                        courseId: item.type === 'course' ? item.id : null,
                        price: item.price,
                        quantity: 1
                    }))
                }
            }
        });

        // 2. إرسال الطلب إلى بوابة شام كاش لإنشاء الكود المرجعي
        const gatewayRes = await fetch(`${SHAM_CASH_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total, // يمكن إضافة تحويل عملة هنا من الدولار للسوري
                currency: 'SYP',
                user_email: customerInfo.email,
                user_name: customerInfo.name,
                metadata: {
                    tmleen_order_id: tmleenOrder.id
                }
            })
        });

        if (!gatewayRes.ok) {
            throw new Error('فشل الاتصال ببوابة شام كاش');
        }

        const gatewayData = await gatewayRes.json();

        // 3. نُرجع الكود المرجعي لواجهة المستخدم (React/Next) ليعرضه
        return NextResponse.json({
            success: true,
            orderId: tmleenOrder.id,
            total,
            shamCashRefCode: gatewayData.ref_code,
            expiresIn: gatewayData.expires_in_minutes,
            instructions: `يرجى تحويل ${total} ل.س وإضافة الملاحظة: ${gatewayData.ref_code}`
        });

    } catch (error) {
        console.error('Error in ShamCash checkout:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
