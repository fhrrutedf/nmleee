import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const normalizedCode = code.toUpperCase();
        const affiliateLink = await prisma.affiliateLink.findUnique({
            where: { code: normalizedCode, isActive: true },
            include: {
                user: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        if (!affiliateLink) {
            return NextResponse.json({ error: 'الرابط غير صالح أو منتهي الصلاحية' }, { status: 404 });
        }

        // Increment click count (simple analytics)
        await prisma.affiliateLink.update({
            where: { id: affiliateLink.id },
            data: { clicks: { increment: 1 } }
        });

        return NextResponse.json({
            affiliateName: affiliateLink.user.name,
            code: affiliateLink.code,
            type: affiliateLink.productId ? 'product' : 'course',
            targetId: affiliateLink.productId || affiliateLink.courseId
        });

    } catch (error) {
        console.error('Affiliate Validation Error:', error);
        return NextResponse.json({ error: 'فشل التحقق من الرابط' }, { status: 500 });
    }
}
