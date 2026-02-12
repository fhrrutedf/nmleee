import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaymentMethodsForCountry, convertCurrency } from '@/config/paymentMethods';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            items,
            customerName,
            customerEmail,
            customerPhone,
            country,
            paymentProvider,
            senderPhone,
            transactionRef,
            paymentProof,
            paymentNotes,
            userId,
        } = body;

        // Calculate total
        let totalUSD = 0;
        for (const item of items) {
            if (item.type === 'product') {
                const product = await prisma.product.findUnique({
                    where: { id: item.id },
                });
                totalUSD += product?.price || 0;
            } else if (item.type === 'course') {
                const course = await prisma.course.findUnique({
                    where: { id: item.id },
                });
                totalUSD += course?.price || 0;
            }
        }

        // Get seller ID from first item
        let sellerId = null;
        if (items.length > 0) {
            const firstItem = items[0];
            if (firstItem.type === 'product') {
                const product = await prisma.product.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                sellerId = product?.userId;
            } else if (firstItem.type === 'course') {
                const course = await prisma.course.findUnique({
                    where: { id: firstItem.id },
                    select: { userId: true },
                });
                sellerId = course?.userId;
            }
        }

        // Calculate commission
        const platformFee = (totalUSD * 10) / 100;
        const sellerAmount = totalUSD - platformFee;

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerName,
                customerEmail,
                customerPhone: customerPhone || '',
                totalAmount: totalUSD,
                platformFee,
                sellerAmount,
                status: 'PENDING', // Will be PAID after verification
                paymentMethod: 'manual',
                paymentProvider,
                paymentCountry: country,
                senderPhone,
                transactionRef,
                paymentProof,
                paymentNotes,
                userId: userId || undefined,
                sellerId: sellerId || undefined,
                payoutStatus: 'pending',
                availableAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                items: {
                    create: items.map((item: any) => ({
                        itemType: item.type,
                        productId: item.type === 'product' ? item.id : undefined,
                        courseId: item.type === 'course' ? item.id : undefined,
                        quantity: 1,
                        price: item.price || 0,
                    })),
                },
            },
        });

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
            orderId: order.id,
        });
    } catch (error) {
        console.error('Error creating manual order:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
