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

        // --- DYNAMIC SETTINGS LOGIC ---
        const platformSettings = await prisma.platformSettings.findFirst() || { 
            commissionRate: 10, 
            freeEscrowDays: 14, 
            usdToSyp: 15000,
            growthCommissionRate: 5,
            growthEscrowDays: 7,
            proCommissionRate: 2,
            proEscrowDays: 3
        };

        const seller = await prisma.user.findUnique({ 
            where: { id: sellerId }
        });

        // Determine correct commission and escrow based on planType
        let commissionRate = platformSettings.commissionRate;
        let escrowDays = platformSettings.freeEscrowDays;

        if (seller) {
            if (seller.planType === 'GROWTH') {
                commissionRate = platformSettings.growthCommissionRate || 5;
                escrowDays = platformSettings.growthEscrowDays || 7;
            } else if (seller.planType === 'PRO') {
                commissionRate = platformSettings.proCommissionRate || 2;
                escrowDays = platformSettings.proEscrowDays || 3;
            }
        }

        const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
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

        const totalUSD = subtotal - discount;
        const totalSYP = Math.round(totalUSD * (platformSettings.usdToSyp || 15000));

        // Calculate Availability Date for the seller payout
        const availableAt = new Date();
        availableAt.setDate(availableAt.getDate() + (escrowDays || 7));

        // 1. Create TMLEEN Order with Dynamic Logistics
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const tmleenOrder = await prisma.order.create({
            data: {
                orderNumber,
                userId: userId,
                sellerId: sellerId,
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone || '',
                totalAmount: totalUSD,
                status: 'PENDING',
                paymentProvider: 'shamcash',
                paymentMethod: 'manual',
                couponId,
                discount,
                commissionRate, // Store for historical tracking
                availableAt,    // When funds become withdrawable
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

        // 2. Gateway Handshake
        const gatewayRes = await fetch(`${SHAM_CASH_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalSYP, // Sending local currency amount
                currency: 'SYP',
                user_email: customerInfo.email,
                user_name: customerInfo.name,
                metadata: {
                    tmleen_order_id: tmleenOrder.id
                }
            })
        });

        if (!gatewayRes.ok) throw new Error('فشل بوابة الدفع');

        const gatewayData = await gatewayRes.json();

        return NextResponse.json({
            success: true,
            orderId: tmleenOrder.id,
            total: totalUSD,
            totalLocal: totalSYP,
            shamCashRefCode: gatewayData.ref_code,
            expiresIn: gatewayData.expires_in_minutes,
            instructions: `يرجى تحويل ${totalSYP.toLocaleString()} ل.س وإضافة الملاحظة: ${gatewayData.ref_code}`
        });

    } catch (error) {
        console.error('Checkout Sync Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في مزامنة البيانات' }, { status: 500 });
    }
}
