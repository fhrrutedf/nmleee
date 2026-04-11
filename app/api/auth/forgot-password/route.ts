import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendResetPasswordEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/host-utils';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'الرجاء إدخال بريد إلكتروني صالح' }, { status: 400 });
        }

        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // 2. Security: Always return success message even if email doesn't exist
        // to prevent email enumeration attacks.
        if (!user) {
            console.log(`[Security] Reset requested for non-existent email: ${email}`);
            return NextResponse.json({
                message: 'إذا كان البريد موجوداً في نظامنا، فقد تم إرسال رابط إعادة التعيين.',
                success: true
            });
        }

        // 3. Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour expiration

        // 4. Save to DB
        await prisma.passwordResetToken.upsert({
            where: { email: user.email },
            update: { token, expires },
            create: { email: user.email, token, expires }
        });

        // 5. Build reset URL
        const baseUrl = await getBaseUrl();
        const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        // 6. Send Email
        const { success, error } = await sendResetPasswordEmail({
            to: user.email,
            customerName: user.name || 'عميلنا العزيز',
            resetLink
        });

        if (!success) {
            console.error('Failed to send reset email:', error);
            // Even if email fails, return generic success to avoid leaking existence
            // but we might want to tell the user something went wrong with the provider?
            // Usually, generic success is and-cart.
        }

        return NextResponse.json({
            message: 'إذا كان البريد موجوداً في نظامنا، فقد تم إرسال رابط إعادة التعيين.',
            success: true
        });

    } catch (error) {
        console.error('Password reset API error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء معالجة طلبك، يرجى المحاولة لاحقاً' },
            { status: 500 }
        );
    }
}
