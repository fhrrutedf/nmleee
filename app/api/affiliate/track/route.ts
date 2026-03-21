import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Affiliate code required' }, { status: 400 });
        }

        // 1. توحيد حالة الأحرف للبحث (Case Normalization)
        const normalizedCode = code.toLowerCase();

        // Find affiliate link
        const affiliateLink = await prisma.affiliateLink.findUnique({
            where: { code: normalizedCode },
        });

        if (!affiliateLink || !affiliateLink.isActive) {
            return NextResponse.json({ error: 'Invalid affiliate link' }, { status: 404 });
        }

        // 2. حماية البيانات من الإغراق (Click Throttling)
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        
        // التحقق مما إذا كان هذا الـ IP قد نقر على نفس الرابط خلال الساعة الماضية
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        const recentClick = await prisma.affiliateClick.findFirst({
            where: {
                linkId: affiliateLink.id,
                ipAddress: ip,
                createdAt: { gte: lastHour }
            }
        });

        if (!recentClick) {
            // سجل النقرة فقط إذا كانت جديدة أو بعد ساعة من النقرة السابقة
            await prisma.affiliateClick.create({
                data: {
                    linkId: affiliateLink.id,
                    ipAddress: ip,
                    userAgent: req.headers.get('user-agent') || undefined,
                    referer: req.headers.get('referer') || undefined,
                },
            });

            // تحديث عداد النقرات الحقيقي
            await prisma.affiliateLink.update({
                where: { id: affiliateLink.id },
                data: { clicks: { increment: 1 } },
            });
        }

        // 3. تفعيل الكوكيز لضمان حقوق المسوق لمدة 30 يوم (Persistence)
        const response = NextResponse.json({ success: true, code: normalizedCode });
        
        response.cookies.set('ref_code', normalizedCode, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error('Affiliate Tracking Engine Error:', error);
        return NextResponse.json({ error: 'Internal tracking error' }, { status: 500 });
    }
}
