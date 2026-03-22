import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
        return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const FROM = process.env.RESEND_FROM_EMAIL || 'no-reply@tmleen.com';
        const platformSettings = await prisma.platformSettings.findFirst() || { platformName: 'تمالين' };
        
        const adminEmail = session?.user?.email;
        if (!adminEmail) throw new Error('Admin email not found');

        // Send a single test email 
        await resend.emails.send({
            from: FROM,
            to: adminEmail,
            subject: `[TEST] ${subject}`,
            html: `
                <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                    <div style="background: #0ea5e9; padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">${platformSettings.platformName}</h1>
                    </div>
                    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0; border-top: none;">
                        <p style="background: #fef9c3; padding: 10px; border-radius: 10px; font-size: 11px; text-align: center; margin-bottom: 20px;">
                            ⚠️ هذه نسخة تجريبية (PREVIEW) مرسلة للاختبار فقط.
                        </p>
                        <p style="font-size: 18px;">مرحباً <strong>${session?.user?.name || 'أدمن'}</strong>،</p>
                        <div style="line-height: 1.8; font-size: 16px; margin: 25px 0; color: #475569; white-space: pre-wrap;">${message}</div>
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                        <p style="text-align: center; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} ${platformSettings.platformName} - نسخة تجريبية</p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ 
            success: true, 
            message: 'تم إرسال النسخة التجريبية إلى بريدك الخاص بنجاح' 
        });
    } catch (error) {
        return NextResponse.json({ error: 'فشل إرسال النسخة التجريبية' }, { status: 500 });
    }
}
