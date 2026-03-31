import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit') || '10');

        const where = type === 'all' ? {} : { type };

        const reports = await prisma.automatedReport.findMany({
            where,
            orderBy: { generatedAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await req.json();
        const { type = 'daily', period = '24h', title } = body;

        // Calculate date range
        const now = new Date();
        const periodMap: Record<string, number> = {
            '24h': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90,
        };
        const days = periodMap[period] || 1;
        const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Generate report data
        const [
            totalUsers,
            newUsers,
            totalOrders,
            periodOrders,
            totalRevenue,
            periodRevenue,
            pendingOrders,
            pendingVerifications,
            pendingPayouts,
            activeSellers,
            subscriptionStats,
            topSellers,
            topProducts,
            recentEvents,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: since } } }),
            prisma.order.count(),
            prisma.order.count({ where: { createdAt: { gte: since } } }),
            prisma.order.aggregate({ where: { isPaid: true }, _sum: { totalAmount: true } }),
            prisma.order.aggregate({ where: { isPaid: true, paidAt: { gte: since } }, _sum: { totalAmount: true } }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
            prisma.payout.count({ where: { status: 'PENDING' } }),
            prisma.user.count({ where: { role: 'SELLER', isActive: true } }),
            prisma.user.groupBy({
                by: ['planType'],
                _count: { planType: true },
                where: { planType: { not: 'FREE' } },
            }),
            prisma.order.groupBy({
                by: ['sellerId'],
                where: { createdAt: { gte: since }, isPaid: true },
                _sum: { totalAmount: true, platformFee: true },
                _count: { id: true },
                orderBy: { _sum: { totalAmount: 'desc' } },
                take: 5,
            }),
            prisma.orderItem.findMany({
                where: {
                    order: { createdAt: { gte: since }, isPaid: true },
                    itemType: 'product',
                },
                include: { product: { select: { name: true, price: true } } },
                take: 100,
            }),
            prisma.platformEvent.findMany({
                where: { createdAt: { gte: since } },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
        ]);

        // Process top products
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        topProducts.forEach(item => {
            if (item.product) {
                const id = item.productId || 'unknown';
                if (!productSales[id]) {
                    productSales[id] = { name: item.product.name, quantity: 0, revenue: 0 };
                }
                productSales[id].quantity += item.quantity;
                productSales[id].revenue += item.price * item.quantity;
            }
        });
        const processedTopProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Generate alerts
        const alerts = [];
        if (pendingOrders > 10) {
            alerts.push({
                type: 'warning',
                title: 'طلبات معلقة كثيرة',
                message: `يوجد ${pendingOrders} طلب معلق يحتاج مراجعة`,
            });
        }
        if (pendingPayouts > 5) {
            alerts.push({
                type: 'info',
                title: 'سحوبات بانتظار الموافقة',
                message: `يوجد ${pendingPayouts} طلب سحب قيد الانتظار`,
            });
        }
        if (newUsers === 0 && days >= 7) {
            alerts.push({
                type: 'warning',
                title: 'لا يوجد مستخدمين جدد',
                message: 'لم يتم تسجيل أي مستخدم جديد خلال الفترة المحددة',
            });
        }

        // Calculate daily revenue for chart
        const dailyRevenue: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyRevenue[dateStr] = 0;
        }

        // Create report
        const report = await prisma.automatedReport.create({
            data: {
                type,
                period,
                title: title || `تقرير ${type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : type === 'monthly' ? 'شهري' : 'مخصص'} - ${new Date().toLocaleDateString('ar-SA')}`,
                summary: {
                    totalUsers,
                    newUsers,
                    totalOrders,
                    periodOrders,
                    totalRevenue: totalRevenue._sum.totalAmount || 0,
                    periodRevenue: periodRevenue._sum.totalAmount || 0,
                    pendingOrders,
                    pendingVerifications,
                    pendingPayouts,
                    activeSellers,
                    subscriptionStats: subscriptionStats.reduce((acc: any, curr: any) => {
                        acc[curr.planType] = curr._count.planType;
                        return acc;
                    }, {}),
                },
                topSellers: topSellers.map(s => ({
                    sellerId: s.sellerId,
                    revenue: s._sum.totalAmount || 0,
                    platformFee: s._sum.platformFee || 0,
                    orders: s._count.id,
                })),
                topProducts: processedTopProducts,
                alerts,
                charts: {
                    dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
                        date,
                        revenue,
                    })),
                },
                status: 'generated',
            },
        });

        return NextResponse.json({ report, success: true });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
