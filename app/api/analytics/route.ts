import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const period = parseInt(searchParams.get('period') || '30');

        // Calculate date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // Get user's products
        const products = await prisma.product.findMany({
            where: { userId },
            select: { id: true },
        });

        const productIds = products.map(p => p.id);

        // Total Revenue
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        productId: { in: productIds },
                    },
                },
                createdAt: { gte: startDate },
                status: 'COMPLETED',
            },
            include: {
                items: {
                    where: {
                        productId: { in: productIds },
                    },
                },
            },
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;

        // Revenue chart data
        const revenueByDay = new Map<string, number>();
        orders.forEach(order => {
            const day = order.createdAt.toISOString().split('T')[0];
            revenueByDay.set(day, (revenueByDay.get(day) || 0) + order.totalAmount);
        });

        const labels: string[] = [];
        const data: number[] = [];
        for (let i = period - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.toISOString().split('T')[0];
            labels.push(new Date(day).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }));
            data.push(revenueByDay.get(day) || 0);
        }

        // Top products
        const productSales = new Map<string, { title: string; sales: number; revenue: number }>();

        for (const order of orders) {
            for (const item of order.items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { title: true },
                });

                if (product) {
                    const current = productSales.get(item.productId) || {
                        title: product.title,
                        sales: 0,
                        revenue: 0
                    };
                    current.sales += item.quantity;
                    current.revenue += item.price * item.quantity;
                    productSales.set(item.productId, current);
                }
            }
        }

        const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Product performance
        const productPerformance = await Promise.all(
            products.slice(0, 10).map(async (product) => {
                const fullProduct = await prisma.product.findUnique({
                    where: { id: product.id },
                });

                const sales = orders.reduce((sum, order) => {
                    return sum + order.items
                        .filter(item => item.productId === product.id)
                        .reduce((itemSum, item) => itemSum + item.quantity, 0);
                }, 0);

                const revenue = orders.reduce((sum, order) => {
                    return sum + order.items
                        .filter(item => item.productId === product.id)
                        .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
                }, 0);

                // Simulate views (in production, you'd track this)
                const views = Math.floor(Math.random() * 500) + 100;
                const conversionRate = views > 0 ? ((sales / views) * 100).toFixed(2) : '0.00';

                return {
                    title: fullProduct?.title || 'Unknown',
                    sales,
                    views,
                    conversionRate: parseFloat(conversionRate),
                    revenue,
                };
            })
        );

        // Calculate previous period for growth
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - period);

        const previousOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        productId: { in: productIds },
                    },
                },
                createdAt: { gte: previousStartDate, lt: startDate },
                status: 'COMPLETED',
            },
        });

        const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const previousOrdersCount = previousOrders.length;

        const revenueGrowth = previousRevenue > 0
            ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
            : '0.0';

        const ordersGrowth = previousOrdersCount > 0
            ? (((totalOrders - previousOrdersCount) / previousOrdersCount) * 100).toFixed(1)
            : '0.0';

        // Recent activity (simulate for now)
        const recentActivity = orders.slice(0, 5).map(order => ({
            type: 'order',
            title: 'طلب جديد',
            description: `تم استلام طلب بقيمة ${order.totalAmount.toFixed(2)} ج.م`,
            time: new Date(order.createdAt).toLocaleDateString('ar-EG'),
        }));

        return NextResponse.json({
            totalRevenue,
            totalOrders,
            totalViews: Math.floor(Math.random() * 5000) + 1000, // Simulate
            conversionRate: totalOrders > 0 ? ((totalOrders / 1000) * 100).toFixed(1) : '0.0',
            revenueGrowth: parseFloat(revenueGrowth),
            ordersGrowth: parseFloat(ordersGrowth),
            viewsGrowth: Math.floor(Math.random() * 50) + 10, // Simulate
            revenueChart: {
                labels,
                data,
            },
            topProducts,
            productPerformance,
            trafficSources: [45, 25, 15, 10, 5], // Simulate
            recentActivity,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
