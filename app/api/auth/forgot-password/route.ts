import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // في تطبيق حقيقي، هنا نقوم بـ:
        // 1. التحقق من وجود الإيميل في قاعدة البيانات
        // 2. إنشاء توكن إعادة تعيين
        // 3. إرسال إيميل برابط إعادة التعيين

        console.log(`[Mock] Password reset requested for: ${email}`);

        // محاكاة نجاح العملية دائماً لأسباب أمنية (لا نكشف وجود الإيميل)
        return NextResponse.json({
            message: 'If the email exists, a reset link has been sent.',
            success: true
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}
