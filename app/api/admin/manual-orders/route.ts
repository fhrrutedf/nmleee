import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const statusFilter = req.nextUrl.searchParams.get('status'); // 'PENDING' | 'PAID' | 'REJECTED' | null (all)

        const where: any = {
            paymentMethod: 'manual',
        };

        if (statusFilter) {
            where.status = statusFilter;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    select: {
                        id: true,
                        price: true,
                        itemType: true,
                        licenseKeyId: true,
                        product: { select: { title: true } },
                        course: { select: { title: true } },
                    },
                },
                seller: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching manual orders:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
