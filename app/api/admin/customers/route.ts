import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/customers — Global CRM for the Website Owner
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const sellerId = searchParams.get('sellerId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {
            status: { in: ['PAID', 'COMPLETED'] },
        };

        if (sellerId) {
            where.sellerId = sellerId;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Fetch orders with buyer and seller info
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
                seller: {
                    select: {
                        name: true,
                        username: true,
                    }
                },
                items: {
                    select: {
                        product: { select: { title: true } },
                        course: { select: { title: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Group by buyer
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
                    associatedSellers: new Set<string>(),
                });
            }

            const customer = customerMap.get(email);
            customer.ordersCount += 1;
            customer.totalSpent += order.totalAmount;
            customer.lastPurchase = order.createdAt;
            
            if (order.seller?.name) {
                customer.associatedSellers.add(order.seller.name);
            }
        });

        const customers = Array.from(customerMap.values()).map(c => ({
            ...c,
            associatedSellers: Array.from(c.associatedSellers),
        }));

        customers.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching admin customers:', error);
        return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
    }
}
