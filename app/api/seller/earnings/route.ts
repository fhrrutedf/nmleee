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

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Get seller orders
        const orders = await prisma.order.findMany({
            where: {
                sellerId: user.id,
                status: 'PAID',
            },
            select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                platformFee: true,
                sellerAmount: true,
                payoutStatus: true,
                availableAt: true,
                paidOutAt: true,
                createdAt: true,
                items: {
                    select: {
                        itemType: true,
                        product: {
                            select: {
                                title: true,
                            },
                        },
                        course: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Format response
        const earnings = orders.map((order) => ({
            orderNumber: order.orderNumber,
            total: order.totalAmount,
            platformFee: order.platformFee,
            yourEarning: order.sellerAmount,
            status: order.payoutStatus,
            availableAt: order.availableAt,
            paidOutAt: order.paidOutAt,
            date: order.createdAt,
            item: order.items[0]?.product?.title || order.items[0]?.course?.title || 'Unknown',
        }));

        return NextResponse.json(earnings);
    } catch (error) {
        console.error('Error fetching earnings:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
