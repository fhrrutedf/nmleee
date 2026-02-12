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

        // Get total revenue
        const orders = await prisma.order.findMany({
            where: {
                userId,
                status: 'PAID',
            },
            select: {
                totalAmount: true,
                discount: true,
                createdAt: true,
            },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);
        const totalOrders = orders.length;

        // Get unique customers
        const uniqueCustomers = await prisma.order.groupBy({
            by: ['customerEmail'],
            where: {
                userId,
                status: 'PAID',
            },
        });

        // Calculate avg order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get previous period for comparison (last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const currentPeriodOrders = orders.filter(
            (o) => new Date(o.createdAt) >= thirtyDaysAgo
        );

        const previousPeriodOrders = orders.filter(
            (o) => {
                const date = new Date(o.createdAt);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            }
        );

        const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        const revenueChange = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        const ordersChange = previousPeriodOrders.length > 0
            ? ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
            : 0;

        // Get top products
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    userId,
                    status: 'PAID',
                },
                productId: {
                    not: null,
                },
            },
            _count: {
                id: true,
            },
            _sum: {
                price: true,
            },
            orderBy: {
                _sum: {
                    price: 'desc',
                },
            },
            take: 5,
        });

        // Get product details
        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                if (!item.productId) return null;

                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        price: true,
                    },
                });

                return {
                    ...product,
                    salesCount: item._count.id,
                    revenue: item._sum.price || 0,
                };
            })
        );

        return NextResponse.json({
            totalRevenue,
            totalDiscount,
            totalOrders,
            totalCustomers: uniqueCustomers.length,
            avgOrderValue,
            revenueChange,
            ordersChange,
            topProducts: topProductsWithDetails.filter(Boolean),
        });
    } catch (error) {
        console.error('Error fetching seller analytics:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
