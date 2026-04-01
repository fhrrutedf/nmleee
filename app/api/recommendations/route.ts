import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const currentProductId = searchParams.get('currentProductId');
        const sellerId = searchParams.get('sellerId');
        const category = searchParams.get('category');
        const type = searchParams.get('type') || 'related';
        const max = parseInt(searchParams.get('max') || '4');

        if (!sellerId) {
            return NextResponse.json({ products: [] });
        }

        let products: any[] = [];

        switch (type) {
            case 'related':
                // Get products from same category or same seller
                products = await prisma.product.findMany({
                    where: {
                        userId: sellerId,
                        id: { not: currentProductId || undefined },
                        isActive: true,
                        OR: [
                            { category: category || undefined },
                            { category: null }
                        ]
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    },
                    orderBy: [
                        { averageRating: 'desc' },
                        { soldCount: 'desc' }
                    ],
                    take: max
                });
                break;

            case 'bestsellers':
                // Get top selling products
                products = await prisma.product.findMany({
                    where: {
                        userId: sellerId,
                        id: { not: currentProductId || undefined },
                        isActive: true,
                        soldCount: { gt: 0 }
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { soldCount: 'desc' },
                    take: max
                });
                break;

            case 'frequently_bought':
                // Get products frequently bought together (same orders)
                const ordersWithCurrent = await prisma.orderItem.findMany({
                    where: {
                        OR: [
                            { productId: currentProductId },
                            { courseId: currentProductId }
                        ]
                    },
                    select: { orderId: true }
                });

                const orderIds = ordersWithCurrent.map(o => o.orderId);

                if (orderIds.length > 0) {
                    const frequentlyBought = await prisma.orderItem.groupBy({
                        by: ['productId'],
                        where: {
                            orderId: { in: orderIds },
                            productId: { not: currentProductId }
                        },
                        _count: { productId: true },
                        orderBy: { _count: { productId: 'desc' } },
                        take: max
                    });

                    const productIds = frequentlyBought.map(f => f.productId).filter((id): id is string => Boolean(id));

                    if (productIds.length > 0) {
                        products = await prisma.product.findMany({
                            where: {
                                id: { in: productIds },
                                isActive: true
                            },
                            include: {
                                user: {
                                    select: {
                                        username: true,
                                        name: true
                                    }
                                }
                            }
                        });
                    }
                }
                break;

            default:
                products = await prisma.product.findMany({
                    where: {
                        userId: sellerId,
                        id: { not: currentProductId || undefined },
                        isActive: true
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: max
                });
        }

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ products: [] }, { status: 500 });
    }
}
