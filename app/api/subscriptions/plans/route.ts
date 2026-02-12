import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';

// GET - جلب جميع خطط الاشتراك للمدرب
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: { userId: user.id },
            orderBy: { price: 'asc' },
            include: {
                _count: {
                    select: { subscriptions: true }
                }
            }
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الخطط' }, { status: 500 });
    }
}

// POST - إنشاء خطة اشتراك جديدة
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const body = await req.json();
        const { name, description, price, interval, features } = body;

        // Validation
        if (!name || !description || !price || !interval) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        if (price < 0) {
            return NextResponse.json({ error: 'السعر يجب أن يكون موجباً' }, { status: 400 });
        }

        if (!['month', 'year'].includes(interval)) {
            return NextResponse.json({ error: 'الفترة يجب أن تكون شهرية أو سنوية' }, { status: 400 });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                interval,
                features: features || [],
                userId: user.id,
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الخطة' }, { status: 500 });
    }
}
