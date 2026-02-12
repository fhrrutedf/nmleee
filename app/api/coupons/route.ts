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

        const coupons = await prisma.coupon.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الكوبونات' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();

        // Check if code already exists
        const existing = await prisma.coupon.findFirst({
            where: {
                code: body.code,
                userId,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'كود الكوبون موجود مسبقاً' },
                { status: 400 }
            );
        }

        const coupon = await prisma.coupon.create({
            data: {
                userId,
                code: body.code,
                type: body.type,
                value: body.value,
                usageLimit: body.maxUses,
                minPurchase: body.minPurchase,
                endDate: body.expiresAt ? new Date(body.expiresAt) : null,
                isActive: true,
                usedCount: 0,
            },
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء الكوبون' },
            { status: 500 }
        );
    }
}
