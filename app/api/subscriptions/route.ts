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

        const plans = await prisma.subscriptionPlan.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { subscriptions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب خطط الاشتراك' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { name, description, price, interval, features } = await req.json();

        if (!name || !price || !interval) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                interval,
                features: features || [],
                userId: session.user.id,
            }
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الخطة' }, { status: 500 });
    }
}
