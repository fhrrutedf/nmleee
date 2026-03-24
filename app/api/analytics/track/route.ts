import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { productId, courseId, referrer } = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'unknown';

        // تسجيل المشاهدة في قاعدة البيانات
        await prisma.productView.create({
            data: {
                productId: productId || null,
                courseId: courseId || null,
                referrer: referrer || 'direct',
                userAgent,
                ipAddress,
                isUnique: true // يمكن تطوير منطق الـ Session لاحقاً
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics Tracking Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
