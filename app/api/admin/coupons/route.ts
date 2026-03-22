import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                user: { select: { name: true, email: true } },
                orders: { 
                    where: { isPaid: true },
                    select: { totalAmount: true } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add calculated stats
        const formatted = coupons.map(c => {
            const { user, ...rest } = c;
            return {
                ...rest,
                seller: user,
                totalSales: c.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                orderCount: c.orders.length
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching admin coupons:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, isActive } = body;

        const updated = await prisma.coupon.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
