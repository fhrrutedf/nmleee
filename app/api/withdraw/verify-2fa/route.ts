/**
 * POST /api/withdraw/verify-2fa
 * يُرسل رمز OTP للبريد الإلكتروني للتحقق قبل السحب
 *
 * GET /api/withdraw/verify-2fa
 * يُتيح التحقق من الرمز المدخل
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

// مدة صلاحية الرمز: 10 دقائق
const OTP_TTL_MS = 10 * 60 * 1000;

// توليد رمز رقمي 6 أرقام
function generateOTP(): string {
    return String(crypto.randomInt(100000, 999999));
}

// ─── POST: إرسال رمز OTP ──────────────────────────────────
export async function POST(req: NextRequest) {
    // Rate limiting: 3 طلبات / 10 دقائق (صارم جداً لمنع Spam)
    const rl = await withRateLimit(req, {
        identifier: 'api:withdraw:2fa:send',
        limit: 3,
        windowSeconds: 600,
    });
    if (rl) return rl;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userEmail = (session?.user as any)?.email;

    if (!userId || !userEmail) {
        return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // تخزين الـ OTP في قاعدة البيانات (مشفّر)
    await prisma.passwordResetToken.upsert({
        where: { token: `2fa:${userId}` },
        create: {
            token: `2fa:${userId}`,
            identifier: userId,
            expires: expiresAt,
        },
        update: {
            expires: expiresAt,
        },
    });

    // تخزين الـ hash في RateLimit كـ cache مؤقت
    await prisma.rateLimit.upsert({
        where: { key: `otp:${userId}` },
        create: { key: `otp:${userId}`, points: parseInt(hashedOtp.substring(0, 6), 16), expire: expiresAt },
        update: { points: parseInt(hashedOtp.substring(0, 6), 16), expire: expiresAt },
    });

    // إرسال البريد الإلكتروني
    try {
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
            to: userEmail,
            subject: `رمز التحقق لطلب السحب — ${otp}`,
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 32px;">
                    <h2 style="color: #10B981; margin-bottom: 8px;">🔐 رمز التحقق للسحب</h2>
                    <p style="color: #9CA3AF; margin-bottom: 24px;">استخدم الرمز التالي لتأكيد طلب سحب الأموال:</p>
                    <div style="background: #1F2937; border: 2px solid #10B981; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #10B981;">${otp}</span>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">صلاحية الرمز: <strong style="color: #fff;">10 دقائق</strong></p>
                    <p style="color: #6B7280; font-size: 14px;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة وتواصل معنا فوراً.</p>
                    <hr style="border-color: #374151; margin: 24px 0;" />
                    <p style="color: #4B5563; font-size: 12px;">منصة مناسة الرقمية — manasadigital.com</p>
                </div>
            `,
        });
    } catch (emailErr) {
        console.error('[2FA_EMAIL_ERROR]', emailErr);
        return NextResponse.json({ error: 'فشل إرسال رمز التحقق. يرجى المحاولة مجدداً.' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `تم إرسال رمز التحقق إلى ${userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
        expiresIn: 600, // ثواني
    });
}

// ─── GET: التحقق من الرمز ─────────────────────────────────
export async function GET(req: NextRequest) {
    const rl = await withRateLimit(req, {
        identifier: 'api:withdraw:2fa:verify',
        limit: 5,
        windowSeconds: 600,
    });
    if (rl) return rl;

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const inputOtp = searchParams.get('otp');

    if (!inputOtp || !/^\d{6}$/.test(inputOtp)) {
        return NextResponse.json({ error: 'رمز التحقق يجب أن يكون 6 أرقام' }, { status: 400 });
    }

    // التحقق من صلاحية الجلسة
    const tokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token: `2fa:${userId}` },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
        return NextResponse.json({ error: 'رمز التحقق منتهي الصلاحية. أعد إرسال رمز جديد.' }, { status: 400 });
    }

    // التحقق من الرمز
    const inputHash = crypto.createHash('sha256').update(inputOtp).digest('hex');
    const storedHash = await prisma.rateLimit.findUnique({ where: { key: `otp:${userId}` } });

    if (!storedHash || storedHash.points !== parseInt(inputHash.substring(0, 6), 16)) {
        return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 });
    }

    // تنظيف الرمز بعد التحقق الناجح
    await Promise.all([
        prisma.passwordResetToken.delete({ where: { token: `2fa:${userId}` } }).catch(() => {}),
        prisma.rateLimit.delete({ where: { key: `otp:${userId}` } }).catch(() => {}),
    ]);

    return NextResponse.json({
        success: true,
        verified: true,
        message: 'تم التحقق بنجاح. يمكنك المتابعة بطلب السحب.',
    });
}
