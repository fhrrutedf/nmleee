import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
    const logs: string[] = [];

    try {
        // Check env vars
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        logs.push(`GMAIL_USER: ${gmailUser ? '✅ موجود (' + gmailUser + ')' : '❌ مفقود'}`);
        logs.push(`GMAIL_APP_PASSWORD: ${gmailPass ? '✅ موجود (طوله: ' + gmailPass.length + ' حرف)' : '❌ مفقود'}`);

        if (!gmailUser || !gmailPass) {
            return NextResponse.json({
                success: false,
                error: 'المتغيرات غير موجودة على Vercel',
                logs,
            });
        }

        // Try to create transporter
        logs.push('محاولة إنشاء transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });

        // Verify connection
        logs.push('فحص الاتصال بـ Gmail...');
        await transporter.verify();
        logs.push('✅ الاتصال بـ Gmail ناجح!');

        // Send test email to self
        logs.push(`إرسال إيميل تجريبي إلى ${gmailUser}...`);
        const info = await transporter.sendMail({
            from: `"اختبار المنصة" <${gmailUser}>`,
            to: gmailUser,
            subject: '🧪 اختبار إرسال الإيميل',
            html: '<div dir="rtl"><h1>✅ الإيميل يعمل!</h1><p>هذا إيميل تجريبي من المنصة.</p></div>',
        });

        logs.push(`✅ تم الإرسال! ID: ${info.messageId}`);

        return NextResponse.json({
            success: true,
            message: 'تم إرسال إيميل تجريبي بنجاح!',
            logs,
        });

    } catch (error: any) {
        logs.push(`❌ خطأ: ${error.message}`);
        return NextResponse.json({
            success: false,
            error: error.message,
            logs,
        }, { status: 500 });
    }
}
