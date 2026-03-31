import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const plans = await prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' },
            include: {
                _count: {
                    select: { subscriptions: { where: { status: 'active' } } }
                }
            }
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, price, interval, features, isActive, planType } = body;

        if (!name || isNaN(price) || !interval) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }

        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description: description || '',
                price: parseFloat(price),
                interval, // "month", "year", "lifetime"
                features: Array.isArray(features) ? features : [],
                isActive: isActive ?? true,
                planType: planType || 'GROWTH', // FREE, GROWTH, PRO, AGENCY
                userId: adminUser.id // Required by schema
            }
        });

        return NextResponse.json(newPlan, { status: 201 });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء الإنشاء' }, { status: 500 });
    }
}
