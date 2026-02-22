import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب الكوبونات' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { code, type, value, usageLimit, startDate, endDate, minPurchase, maxDiscount, productIds, courseIds, isActive } = body;

        // Basic validation
        if (!code || !type || value === undefined) {
            return NextResponse.json({ error: 'البيانات الأساسية مطلوبة' }, { status: 400 });
        }

        // Check if code already exists globally (it's unique in schema)
        const existing = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return NextResponse.json({ error: 'كود الخصم مستخدم بالفعل' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                type,
                value: parseFloat(value),
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                productIds: productIds || [],
                courseIds: courseIds || [],
                isActive: isActive ?? true,
                userId: session.user.id
            }
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الكوبون' }, { status: 500 });
    }
}
