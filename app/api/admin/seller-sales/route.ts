import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '7'; // 7, 15, 30, 60
        const days = parseInt(period);
        
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);

        // Fetch completed orders within the period that have a seller
        const orders = await prisma.order.findMany({
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                sellerId: { not: null },
                createdAt: { gte: dateFilter }
            },
            include: {
                seller: { select: { id: true, name: true, email: true } },
                items: { include: { product: { select: { title: true } }, course: { select: { title: true } } } }
            }
        });

        // Group by seller
        const sellerSales: Record<string, any> = {};
        let totalPlatformRevenue = 0;
        let totalSellerEarnings = 0;

        orders.forEach(order => {
            const sId = order.sellerId as string;
            if (!sellerSales[sId]) {
                sellerSales[sId] = {
                    seller: order.seller,
                    totalOrders: 0,
                    totalSalesAmount: 0,
                    totalSellerEarnings: 0,
                    totalPlatformFee: 0,
                    productsSold: {}
                };
            }
            
            sellerSales[sId].totalOrders += 1;
            sellerSales[sId].totalSalesAmount += order.totalAmount;
            sellerSales[sId].totalSellerEarnings += (order.sellerAmount || 0);
            sellerSales[sId].totalPlatformFee += (order.platformFee || 0);
            
            totalPlatformRevenue += (order.platformFee || 0);
            totalSellerEarnings += (order.sellerAmount || 0);

            // Tally products
            order.items.forEach(item => {
                const title = item.product?.title || item.course?.title || 'منتج آخر';
                if (!sellerSales[sId].productsSold[title]) {
                    sellerSales[sId].productsSold[title] = 0;
                }
                sellerSales[sId].productsSold[title] += item.quantity || 1;
            });
        });

        const sellers = Object.values(sellerSales).sort((a: any, b: any) => b.totalSellerEarnings - a.totalSellerEarnings);

        return NextResponse.json({
            sellers,
            stats: {
                periodCount: days,
                totalPlatformRevenue,
                totalSellerEarnings,
                totalSellersActive: Object.keys(sellerSales).length,
                totalOrders: orders.length
            }
        });
    } catch (error) {
        console.error('Seller Sales API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
