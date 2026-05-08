import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const sellerId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        
        // Filters
        const productId = searchParams.get('productId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {
            sellerId,
            status: { in: ['PAID', 'COMPLETED'] },
        };

        if (productId) {
            where.items = {
                some: {
                    OR: [
                        { productId },
                        { courseId: productId }
                    ]
                }
            };
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Fetch orders with buyer info
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: { // The buyer
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        createdAt: true,
                    }
                },
                items: {
                    select: {
                        id: true,
                        productId: true,
                        courseId: true,
                        product: { select: { title: true } },
                        course: { select: { title: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by buyer (using email or id)
        const customerMap = new Map();

        orders.forEach((order) => {
            const email = order.user?.email || (order as any).customerEmail || 'Guest';
            const name = order.user?.name || (order as any).customerName || 'مشتري غير مسجل';

            if (!customerMap.has(email)) {
                customerMap.set(email, {
                    email,
                    name,
                    phone: order.user?.phone || (order as any).customerPhone || '-',
                    ordersCount: 0,
                    totalSpent: 0,
                    firstPurchase: order.createdAt,
                    lastPurchase: order.createdAt,
                    products: new Set<string>(),
                });
            }

            const customer = customerMap.get(email);
            customer.ordersCount += 1;
            customer.totalSpent += order.totalAmount;
            customer.lastPurchase = order.createdAt;
            
            order.items.forEach(item => {
                if (item.product?.title) customer.products.add(item.product.title);
                if (item.course?.title) customer.products.add(item.course.title);
            });
        });

        const customers = Array.from(customerMap.values()).map(c => ({
            ...c,
            products: Array.from(c.products),
        }));

        // Sort by total spent by default
        customers.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
    }
}
