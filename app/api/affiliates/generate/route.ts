import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
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
        const { targetUrl, productId, courseId } = body; // تجاهل الـ commissionRate القادم من المتصفح

        if (!targetUrl || (!productId && !courseId)) {
            return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
        }

        // جلب نسبة العمولة الافتراضية من إعدادات المنصة أو البائع (Security Fix)
        const settings = await prisma.platformSettings.findFirst();
        const finalCommissionRate = settings?.referralCommissionRate ?? 10; // الافتراضي 10% إذا لم يوجد إعداد في لوحة التحكم (Dynamic)

        // إنشاء كود تسويقي موحد الحالة (Case Normalization)
        // نستخدم حروفاً وأرقاماً ونحولها لـ lowercase لضمان التطابق دائماً
        const uniqueCode = nanoid(8).toLowerCase();
        const refUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}ref=${uniqueCode}`;

        const newLink = await prisma.affiliateLink.create({
            data: {
                userId: user.id,
                productId: productId && productId !== 'generic-store-link' ? productId : undefined,
                courseId: courseId || undefined,
                code: uniqueCode,
                commissionType: 'percentage',
                commissionValue: finalCommissionRate, // نسبة آمنة محددة من السيرفر
            }
        });

        return NextResponse.json({ 
            success: true, 
            link: {
                ...newLink,
                url: refUrl
            } 
        });

    } catch (error) {
        console.error('Affiliate Generation Security Error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أمني أثناء توليد الرابط' },
            { status: 500 }
        );
    }
}
