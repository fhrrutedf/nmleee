import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const user = await prisma.user.findUnique({
            where: { username: params.username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                avatar: true,
                coverImage: true,
                brandColor: true,
                website: true,
                facebook: true,
                instagram: true,
                twitter: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const [products, courses] = await Promise.all([
            prisma.product.findMany({
                where: { userId: user.id, isActive: true },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.course.findMany({
                where: { userId: user.id, isActive: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return NextResponse.json({
            user,
            products,
            courses,
        });
    } catch (error) {
        console.error('Error fetching user platform:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب المنصة' },
            { status: 500 }
        );
    }
}
