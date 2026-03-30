import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });

        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
