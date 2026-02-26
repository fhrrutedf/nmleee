import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerEmail, customerName, affiliateRef } = body;

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

        // Determine seller/user ID from the first item
        let userId = '';
        if (allDbItems && allDbItems.length > 0) {
            const firstItem = allDbItems[0];
            userId = firstItem.userId || '';
        }

        if (!userId) {
            return NextResponse.json({ error: "لا يمكن تحديد البائع للطلب" }, { status: 400 });
        }

        // 1. Create a "Free" Order
        const order = await prisma.order.create({
            data: {
                orderNumber: `FR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
                totalAmount: 0,
                status: 'COMPLETED',
                customerEmail: customerEmail,
                customerName: customerName,
                customerPhone: body.customerPhone || null,
                sellerId: userId,
                userId: userId,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.type === 'product' ? item.id : null,
                        courseId: item.type === 'course' ? item.id : null,
                        price: 0,
                        itemType: item.type,
                    }))
                }
            },
            include: { items: true }
        });

        // 2. Grant access (Enroll in courses, generate licenses for products)
        for (const item of items) {
            if (item.type === 'course') {
                // Link enrollment
                await prisma.courseEnrollment.create({
                    data: {
                        courseId: item.id,
                        studentName: customerName,
                        studentEmail: customerEmail,
                        orderId: order.id
                    }
                });
            } else if (item.type === 'product') {
                await prisma.license.create({
                    data: {
                        key: `FREE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                        productId: item.id,
                        orderId: order.id,
                        userId: (await prisma.user.findUnique({ where: { email: customerEmail } }))?.id || 'guest',
                    }
                });
            }
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error) {
        console.error('Error processing free checkout:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب المجاني' }, { status: 500 });
    }
}
