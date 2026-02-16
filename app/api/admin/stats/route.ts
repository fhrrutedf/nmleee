import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') { // Enum comparison works with strings in Prisma
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Get statistics
        const [
            totalOrders,
            paidOrders,
            pendingOrders,
            totalRevenue,
            platformFees,
            pendingPayouts,
            pendingManualOrders,
            totalUsers,
            totalSellers,
            totalProducts,
            totalCourses,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PAID' } }),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { totalAmount: true },
            }),
            prisma.order.aggregate({
                where: { status: 'PAID' },
                _sum: { platformFee: true },
            }),
            prisma.payout.count({ where: { status: 'PENDING' } }),
            prisma.order.count({
                where: {
                    paymentMethod: 'manual',
                    status: 'PENDING',
                    verifiedAt: null,
                },
            }),
            prisma.user.count(),
            prisma.user.count({ where: { role: 'SELLER' } }), // Prisma handles enum conversion
            prisma.product.count(),
            prisma.course.count(),
        ]);

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                seller: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { title: true } },
                        course: { select: { title: true } },
                    },
                },
            },
        });

        // Top sellers
        const topSellers = await prisma.user.findMany({
            where: { role: 'SELLER' }, // Enum filter
            orderBy: { totalEarnings: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                totalEarnings: true,
                pendingBalance: true,
                availableBalance: true,
                _count: { select: { sellerOrders: true } },
            },
        });

        return NextResponse.json({
            stats: {
                totalOrders,
                paidOrders,
                pendingOrders,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                platformFees: platformFees._sum.platformFee || 0,
                pendingPayouts,
                pendingManualOrders,
                totalUsers,
                totalSellers,
                totalProducts,
                totalCourses,
            },
            recentOrders,
            topSellers,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
