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
                customerPhone: body.customerPhone || undefined,
                sellerId: userId,
                userId: userId,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.type === 'product' ? item.id : undefined,
                        courseId: item.type === 'course' ? item.id : undefined,
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
                await prisma.courseEnrollment.upsert({
                    where: {
                        courseId_studentEmail: {
                            courseId: item.id,
                            studentEmail: customerEmail
                        }
                    },
                    update: {
                        orderId: order.id
                    },
                    create: {
                        courseId: item.id,
                        studentName: customerName,
                        studentEmail: customerEmail,
                        orderId: order.id
                    }
                });
            } else if (item.type === 'product') {
                // Products access is granted via the OrderItem itself, no need to auto-generate a LicenseKey here
            }
        }

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
