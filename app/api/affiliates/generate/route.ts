import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const body = await request.json();
        const { targetUrl, productId, courseId, commissionRate } = body;

        // Basic validation
        if (!targetUrl || (!productId && !courseId)) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }

        // إنشاء كود تسويقي فريد
        const uniqueCode = nanoid(8);
        const refUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}ref=${uniqueCode}`;

        const newLink = await prisma.affiliateLink.create({
            data: {
                userId: user.id,
                productId: productId && productId !== 'generic-store-link' ? productId : undefined,
                courseId: courseId || undefined,
                code: uniqueCode,
                commissionType: 'percentage', // Default based on your schema logic
                commissionValue: commissionRate || 10, // Default 10%
            }
        });

        // We can optionally construct and return the URL here, but UI typically relies on the GET endpoint.
        const returnedLink = {
            ...newLink,
            url: refUrl
        };

        return NextResponse.json({ success: true, link: returnedLink });

    } catch (error) {
        console.error('Error generating affiliate link:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في توليد الرابط' },
            { status: 500 }
        );
    }
}
