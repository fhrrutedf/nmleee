import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

// GET - اختبار الاتصال بـ Telegram
export async function GET() {
    const result = await sendTelegramMessage('✅ تم ربط البوت بنجاح! ستصلك إشعارات المنصة هنا.');
    if (result.success) {
        return NextResponse.json({ success: true, message: 'تم إرسال رسالة اختبارية بنجاح!' });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
}

// POST - إرسال رسالة مخصصة
export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message) return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });

        const result = await sendTelegramMessage(message);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
