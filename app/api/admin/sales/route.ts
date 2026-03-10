import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/sales — جلب بيانات المبيعات الشاملة
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const paymentMethod = searchParams.get('paymentMethod');
        const sellerId = searchParams.get('sellerId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }
        if (paymentMethod && paymentMethod !== 'all') {
            where.paymentMethod = paymentMethod;
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { transactionRef: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59');
        }

        const [orders, total, stats] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    orderNumber: true,
                    customerName: true,
                    customerEmail: true,
                    customerPhone: true,
                    totalAmount: true,
                    platformFee: true,
                    sellerAmount: true,
                    status: true,
                    paymentMethod: true,
                    paymentProvider: true,
                    paymentCountry: true,
                    paymentProof: true,
                    transactionRef: true,
                    senderPhone: true,
                    paymentNotes: true,
                    isPaid: true,
                    paidAt: true,
                    verifiedAt: true,
                    createdAt: true,
                    discount: true,
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    items: {
                        select: {
                            id: true,
                            price: true,
                            itemType: true,
                            product: { select: { title: true, image: true } },
                            course: { select: { title: true, image: true } },
                            bundle: { select: { title: true, image: true } },
                        },
                    },
                    invoices: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            status: true,
                        },
                    },
                },
            }),
            prisma.order.count({ where }),
            // Stats
            prisma.order.aggregate({
                where,
                _sum: {
                    totalAmount: true,
                    platformFee: true,
                    sellerAmount: true,
                },
                _count: true,
            }),
        ]);

        // Additional counts by status
        const [pendingCount, paidCount, completedCount] = await Promise.all([
            prisma.order.count({ where: { ...where, status: 'PENDING' } }),
            prisma.order.count({ where: { ...where, status: 'PAID' } }),
            prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
        ]);

        return NextResponse.json({
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            stats: {
                totalRevenue: stats._sum.totalAmount || 0,
                totalPlatformFee: stats._sum.platformFee || 0,
                totalSellerAmount: stats._sum.sellerAmount || 0,
                totalOrders: stats._count,
                pendingCount,
                paidCount,
                completedCount,
            },
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json({ error: 'خطأ في جلب المبيعات' }, { status: 500 });
    }
}
