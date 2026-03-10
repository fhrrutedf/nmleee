import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/invoices — جلب كل الفواتير مع فلاتر
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const sellerId = searchParams.get('sellerId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search');

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { transactionRef: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    order: {
                        select: {
                            orderNumber: true,
                            status: true,
                            paymentMethod: true,
                            items: {
                                select: {
                                    product: { select: { title: true } },
                                    course: { select: { title: true } },
                                    bundle: { select: { title: true } },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.invoice.count({ where }),
        ]);

        return NextResponse.json({
            invoices,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'خطأ في جلب الفواتير' }, { status: 500 });
    }
}
