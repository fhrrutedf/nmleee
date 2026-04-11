import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureUserAccount } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, customerName, affiliateRef } = body;
        const customerEmail = body.customerEmail?.toLowerCase().trim();

        if (!items || !items.length) {
            return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
        }

        // Verify that ALL items are actually free
        const itemIds = items.map((item: any) => item.id);
        const products = await prisma.product.findMany({ where: { id: { in: itemIds } } });
        const courses = await prisma.course.findMany({ where: { id: { in: itemIds } } });
        const appointments = await prisma.appointment.findMany({ where: { id: { in: itemIds } } });

        const allDbItems = [...products, ...courses, ...appointments];
        const isActuallyFree = allDbItems.every(dbItem => dbItem.price === 0 || (dbItem as any).isFree === true);

        if (!isActuallyFree) {
            return NextResponse.json({ error: 'عذراً، بعض المنتجات في السلة ليست مجانية. يرجى الدفع لإتمام الطلب.' }, { status: 400 });
        }

        // Determine seller ID from the first item
        let sellerId = '';
        if (allDbItems && allDbItems.length > 0) {
            const firstItem = allDbItems[0];
            sellerId = firstItem.userId || '';
        }

        if (!sellerId) {
            return NextResponse.json({ error: "لا يمكن تحديد البائع للطلب" }, { status: 400 });
        }

        // Look up or create buyer account
        let buyerUserId = sellerId; // fallback
        if (customerEmail) {
            buyerUserId = await ensureUserAccount(customerEmail, customerName);
        }

        // 1. البحث عن رابط المسوق إذا وجد كود في الكوكيز أو الطلب
        const refCode = affiliateRef || req.cookies.get('ref_code')?.value;
        let affiliateLinkId = undefined;

        if (refCode) {
            const link = await prisma.affiliateLink.findUnique({ where: { code: refCode } });
            if (link && link.isActive) {
                affiliateLinkId = link.id;
            }
        }

        // 2. Create a "Free" Order with correct userId = BUYER (not seller)
        const order = await prisma.order.create({
            data: {
                orderNumber: `FR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
                totalAmount: 0,
                status: 'COMPLETED',
                isPaid: true,
                paidAt: new Date(),
                customerEmail: customerEmail,
                customerName: customerName,
                customerPhone: body.customerPhone || undefined,
                sellerId: sellerId,
                userId: buyerUserId,
                affiliateLinkId, // ربط الطلب بالمسوق
                items: {
                    create: items.map((item: any) => ({
                        productId: item.type === 'product' ? item.id : undefined,
                        courseId: item.type === 'course' ? item.id : undefined,
                        bundleId: item.type === 'bundle' ? item.id : undefined,
                        price: 0,
                        itemType: item.type,
                    }))
                }
            },
            include: { items: true }
        });

        // 1.1 Lead Magnet: Add to EmailSubscriber list automatically for free products
        try {
            await prisma.emailSubscriber.upsert({
                where: { email: customerEmail },
                update: { isActive: true },
                create: { email: customerEmail, isActive: true }
            });
            console.log(`[Lead Magnet] Added ${customerEmail} to subscribers list.`);
        } catch (subError) {
            console.error('Failed to add to subscribers:', subError);
        }

        // 2. Grant access and send emails: Fulfill Purchase
        const { fulfillPurchase } = await import('@/lib/checkout');
        await fulfillPurchase(order.id, buyerUserId);

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error) {
        console.error('Error processing free checkout:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        } else {
            console.error('Unknown error object:', JSON.stringify(error, null, 2));
        }
        return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب المجاني', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
    }
}
