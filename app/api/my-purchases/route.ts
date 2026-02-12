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
                                slug: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Flatten items from all orders
        const purchases = orders.flatMap((order) =>
            order.items.map((item) => {
                const isCourse = item.itemType === 'course';
                const data = isCourse ? item.course : item.product;

                return {
                    id: data?.id || item.id,
                    type: isCourse ? 'course' : 'product',
                    title: data?.title || 'Unknown',
                    image: data?.image,
                    slug: data?.slug,
                    progress: 0, // TODO: Get actual progress from database
                    purchasedAt: order.createdAt,
                };
            })
        );

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
