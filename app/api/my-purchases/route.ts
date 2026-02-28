import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Get all paid orders for this user
        const orders = await prisma.order.findMany({
            where: {
                customerEmail: session.user.email,
                status: 'PAID',
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                image: true,
                            },
                        },
                        course: {
                            select: {
                                id: true,
                                title: true,
                                image: true,
                            },
                        },
                        bundle: {
                            include: {
                                products: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Flatten items from all orders
        const purchases: any[] = [];

        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.itemType === 'bundle' && item.bundle) {
                    // Expand bundle into individual products
                    item.bundle.products.forEach(bp => {
                        const isCourse = bp.product.category === 'courses' || bp.product.category === 'course';
                        purchases.push({
                            id: bp.product.id,
                            type: isCourse ? 'course' : 'product',
                            title: bp.product.title,
                            image: bp.product.image,
                            slug: !isCourse ? bp.product.slug : undefined,
                            progress: 0,
                            purchasedAt: order.createdAt,
                            fromBundle: item.bundle?.title
                        });
                    });
                } else {
                    // Regular product or course
                    const isCourse = item.itemType === 'course';
                    const data = isCourse ? item.course : item.product;

                    if (data) {
                        purchases.push({
                            id: data.id || item.id,
                            type: isCourse ? 'course' : 'product',
                            title: data.title || 'Unknown',
                            image: data.image,
                            slug: !isCourse ? (data as any).slug : undefined,
                            progress: 0,
                            purchasedAt: order.createdAt,
                        });
                    }
                }
            });
        });

        // Remove duplicates
        const uniquePurchases = Array.from(
            new Map(purchases.map((p) => [p.id, p])).values()
        );

        return NextResponse.json(uniquePurchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
