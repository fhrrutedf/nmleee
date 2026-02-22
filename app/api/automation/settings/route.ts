import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - جلب إعدادات الأتمتة
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        let settings = await db.automationSettings.findUnique({
            where: { userId: session.user.id },
        });

        // إنشاء إعدادات افتراضية إذا لم توجد
        if (!settings) {
            settings = await db.automationSettings.create({
                data: { userId: session.user.id },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Automation settings GET error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}

// PUT - تحديث إعدادات الأتمتة
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();

        // إزالة الحقول المحمية
        const { id, userId, user, createdAt, updatedAt, ...updateData } = body;

        const settings = await db.automationSettings.upsert({
            where: { userId: session.user.id },
            update: updateData,
            create: {
                userId: session.user.id,
                ...updateData,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Automation settings PUT error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
