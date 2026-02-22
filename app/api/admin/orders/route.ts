import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const statusStr = searchParams.get('status') || 'ALL'; // ALL, PENDING, PAID, REFUNDED, COMPLETED
        const paymentType = searchParams.get('type') || 'ALL'; // ALL, manual, online
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Construct where clause
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { seller: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (statusStr !== 'ALL') {
            whereClause.status = statusStr as OrderStatus;
        }

        if (paymentType !== 'ALL') {
            if (paymentType === 'manual') {
                whereClause.paymentMethod = 'manual';
            } else {
                whereClause.paymentMethod = { not: 'manual' };
            }
        }

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    user: { select: { name: true, email: true } },
                    seller: { select: { name: true, email: true } },
                    items: {
                        include: {
                            product: { select: { title: true } },
                            course: { select: { title: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where: whereClause })
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            },
            stats: {
                totalOrders: await prisma.order.count(),
                paidOrders: await prisma.order.count({ where: { status: 'PAID' } }),
                pendingManual: await prisma.order.count({ where: { paymentMethod: 'manual', status: 'PENDING' } }),
                totalRevenue: await prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
            }
        });

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
