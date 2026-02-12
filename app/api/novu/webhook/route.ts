import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint لاستقبال أحداث من Novu
 * يمكن استخدامه لتتبع حالة الإشعارات
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // يمكنك حفظ الأحداث في قاعدة البيانات للتتبع
        console.log('📨 Novu Webhook:', body);

        // مثال: تحديث حالة الإشعار في قاعدة البيانات
        if (body.type === 'notification.delivered') {
            // await prisma.notification.update(...)
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Novu webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
