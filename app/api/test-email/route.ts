import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
    const logs: string[] = [];

    try {
        const brevoUser = process.env.BREVO_SMTP_USER;
        const brevoKey = process.env.BREVO_SMTP_KEY;
        const fromEmail = process.env.BREVO_FROM_EMAIL || brevoUser;

        logs.push(`BREVO_SMTP_USER: ${brevoUser ? '✅ موجود (' + brevoUser + ')' : '❌ مفقود'}`);
        logs.push(`BREVO_SMTP_KEY: ${brevoKey ? '✅ موجود (طوله: ' + brevoKey.length + ' حرف)' : '❌ مفقود'}`);
        logs.push(`BREVO_FROM_EMAIL: ${fromEmail || '❌ مفقود'}`);

        if (!brevoUser || !brevoKey) {
            return NextResponse.json({ success: false, error: 'مفاتيح Brevo غير موجودة على Vercel', logs });
        }

        logs.push('إنشاء الاتصال بـ Brevo SMTP...');
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user: brevoUser, pass: brevoKey },
        });

        logs.push('فحص الاتصال...');
        await transporter.verify();
        logs.push('✅ الاتصال بـ Brevo ناجح!');

        logs.push(`إرسال إيميل تجريبي إلى ${fromEmail}...`);
        const info = await transporter.sendMail({
            from: `"اختبار المنصة" <${fromEmail}>`,
            to: fromEmail,
            subject: '🧪 اختبار Brevo SMTP',
            html: '<div dir="rtl"><h1>✅ Brevo يعمل!</h1><p>الإيميلات ستصل الآن بشكل صحيح.</p></div>',
        });

        logs.push(`✅ تم الإرسال! ID: ${info.messageId}`);
        return NextResponse.json({ success: true, message: 'Brevo يعمل بنجاح! ✅', logs });

    } catch (error: any) {
        logs.push(`❌ خطأ: ${error.message}`);
        return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
    }
}
