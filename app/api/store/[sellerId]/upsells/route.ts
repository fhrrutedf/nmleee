import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, context: { params: Promise<{ sellerId: string }> }) {
    try {
        const { sellerId } = await context.params;

        if (!sellerId) {
            return NextResponse.json({ error: 'معرف البائع مطلوب' }, { status: 400 });
        }

        // Fetch up to 4 random active products by this seller to be used as upsells
        const products = await prisma.product.findMany({
            where: {
                userId: sellerId,
                isActive: true
            },
            take: 4,
            orderBy: {
                soldCount: 'desc' // Recommend popular stuff
            },
            select: {
                id: true,
                title: true,
                price: true,
                image: true,
                slug: true
            }
        });

        // We could also mix courses with products, but here we just show products

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching upsells:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب توصيات المنتجات' }, { status: 500 });
    }
}
