import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { generateSlug, generateUniqueSlug } from '@/lib/multi-tenant-utils';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        
        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        // Build where clause
        const where: any = { userId };
        
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ];
        }
        
        if (category) {
            where.category = category;
        }
        
        if (tag) {
            where.tags = { has: tag };
        }
        
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب المنتجات' },
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

        // Generate slug from title if not provided
        let slug = body.slug || generateSlug(body.title);

        // Ensure slug is unique for this creator
        slug = await generateUniqueSlug(slug, userId, prisma);

        const product = await prisma.product.create({
            data: {
                ...body,
                originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
                upsellPrice: body.upsellPrice ? parseFloat(body.upsellPrice) : null,
                offerExpiresAt: body.offerExpiresAt ? new Date(body.offerExpiresAt) : null,
                slug,
                userId,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء المنتج' },
            { status: 500 }
        );
    }
}

