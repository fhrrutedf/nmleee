import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { generateSlug, generateUniqueSlug } from '@/lib/multi-tenant-utils';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const bundles = await prisma.bundle.findMany({
            where: { userId: session.user.id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                },
                _count: {
                    select: { orderItems: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(bundles);
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب الباقات' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = session.user.id;
        const { title, description, price, image, productIds } = await req.json();

        if (!title || !price || !productIds || productIds.length === 0) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }

        let slug = generateSlug(title);
        // We'll use a unique identifier for slug to be safe alongside other bundles/products
        const randomString = Math.random().toString(36).substring(7);
        slug = `${slug}-${randomString}`;

        const bundle = await prisma.bundle.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                image,
                slug,
                userId,
                products: {
                    create: productIds.map((productId: string) => ({
                        product: {
                            connect: { id: productId }
                        }
                    }))
                }
            },
            include: {
                products: true
            }
        });

        return NextResponse.json(bundle, { status: 201 });
    } catch (error) {
        console.error('Error creating bundle:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الباقة' }, { status: 500 });
    }
}
