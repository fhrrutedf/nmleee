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

        // Get statistics
        const [totalProducts, totalOrders, totalRevenue, upcomingAppointments] =
            await Promise.all([
                // Total products
                prisma.product.count({
                    where: { userId, isActive: true },
                }),

                // Total orders
                prisma.order.count({
                    where: { userId, isPaid: true },
                }),

                // Total revenue
                prisma.order.aggregate({
                    where: { userId, isPaid: true },
                    _sum: { totalAmount: true },
                }),

                // Upcoming appointments
                prisma.appointment.count({
                    where: {
                        userId,
                        date: { gte: new Date() },
                        status: { in: ['PENDING', 'CONFIRMED'] },
                    },
                }),
            ]);

        return NextResponse.json({
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalAppointments: upcomingAppointments,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
