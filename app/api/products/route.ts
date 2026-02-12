import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { generateSlug, generateUniqueSlug } from '@/lib/multi-tenant-utils';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const products = await prisma.product.findMany({
            where: { userId },
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

