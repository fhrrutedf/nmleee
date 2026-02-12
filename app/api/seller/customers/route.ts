import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Get all orders with customer info
        const orders = await prisma.order.findMany({
            where: {
                userId,
                status: 'PAID',
            },
            select: {
                customerEmail: true,
                customerName: true,
                totalAmount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Group by customer email
        const customerMap = new Map();

        orders.forEach((order) => {
            const email = order.customerEmail;

            if (!customerMap.has(email)) {
                customerMap.set(email, {
                    email,
                    name: order.customerName,
                    ordersCount: 0,
                    totalSpent: 0,
                    firstPurchase: order.createdAt,
                    lastPurchase: order.createdAt,
                });
            }

            const customer = customerMap.get(email);
            customer.ordersCount += 1;
            customer.totalSpent += order.totalAmount;
            customer.lastPurchase = order.createdAt;
        });

        // Convert map to array
        const customers = Array.from(customerMap.values());

        // Sort by total spent
        customers.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
