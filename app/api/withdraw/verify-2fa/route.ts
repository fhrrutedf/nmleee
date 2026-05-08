/**
 * POST /api/withdraw/verify-2fa — يُرسل رمز OTP للبريد
 * GET  /api/withdraw/verify-2fa?otp=XXXXXX — يتحقق من الرمز
 *
 * يستخدم جدول WithdrawOTP المخصص في قاعدة البيانات
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 دقائق

function generateOTP(): string {
    return String(crypto.randomInt(100000, 999999));
}

// ─── POST: إرسال رمز OTP ──────────────────────────────────────────
export async function POST(req: NextRequest) {
    // Rate limiting: 3 طلبات / 10 دقائق
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
    const otpHash = crypto.createHash('sha256').update(otp + userId).digest('hex');

    // تخزين في WithdrawOTP (upsert: رمز واحد فقط لكل مستخدم)
    await prisma.$executeRaw`
        INSERT INTO "WithdrawOTP" ("id", "userId", "otpHash", "expiresAt", "used")
        VALUES (gen_random_uuid()::text, ${userId}, ${otpHash}, ${expiresAt}, false)
        ON CONFLICT ("userId") DO UPDATE 
        SET "otpHash" = ${otpHash}, "expiresAt" = ${expiresAt}, "used" = false, "createdAt" = NOW()
    `;

    // إرسال البريد الإلكتروني
    try {
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
            to: userEmail,
            subject: `رمز التحقق لطلب السحب — ${otp}`,
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; padding: 32px;">
                    <div style="text-align:center; margin-bottom:24px;">
                        <div style="font-size:48px;">🔐</div>
                        <h2 style="color: #10B981; margin: 8px 0;">رمز التحقق للسحب</h2>
                    </div>
                    <p style="color: #9CA3AF; margin-bottom: 24px; text-align:center;">استخدم الرمز التالي لتأكيد طلب سحب الأموال من منصة مناسة الرقمية:</p>
                    <div style="background: #1F2937; border: 2px solid #10B981; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 48px; font-weight: bold; letter-spacing: 16px; color: #10B981; font-family: monospace;">${otp}</span>
                    </div>
                    <div style="background:#111827; border-radius:8px; padding:16px; margin-bottom:16px;">
                        <p style="color: #6B7280; font-size: 14px; margin:0;">⏱️ صلاحية الرمز: <strong style="color: #fff;">10 دقائق</strong></p>
                        <p style="color: #6B7280; font-size: 14px; margin:8px 0 0;">🔒 إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة وأمّن حسابك فوراً.</p>
                    </div>
                    <hr style="border-color: #374151; margin: 24px 0;" />
                    <p style="color: #4B5563; font-size: 12px; text-align:center;">منصة مناسة الرقمية — manasadigital.com</p>
                </div>
            `,
        });
    } catch (emailErr) {
        console.error('[2FA_EMAIL_ERROR]', emailErr);
        return NextResponse.json(
            { error: 'فشل إرسال رمز التحقق. يرجى المحاولة مجدداً.' },
            { status: 500 }
        );
    }

    const maskedEmail = userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    return NextResponse.json({
        success: true,
        message: `تم إرسال رمز التحقق إلى ${maskedEmail}`,
        expiresIn: 600,
    });
}

// ─── GET: التحقق من الرمز ─────────────────────────────────────────
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
    const inputOtp = searchParams.get('otp')?.trim();

    if (!inputOtp || !/^\d{6}$/.test(inputOtp)) {
        return NextResponse.json({ error: 'رمز التحقق يجب أن يكون 6 أرقام' }, { status: 400 });
    }

    // جلب الرمز من القاعدة
    const otpRecords = await prisma.$queryRaw<Array<{
        otpHash: string;
        expiresAt: Date;
        used: boolean;
    }>>`
        SELECT "otpHash", "expiresAt", "used"
        FROM "WithdrawOTP"
        WHERE "userId" = ${userId}
        LIMIT 1
    `;

    const record = otpRecords[0];

    if (!record) {
        return NextResponse.json({ error: 'لم يتم إرسال رمز تحقق. أرسل رمزاً جديداً أولاً.' }, { status: 400 });
    }

    if (record.used) {
        return NextResponse.json({ error: 'هذا الرمز تم استخدامه مسبقاً.' }, { status: 400 });
    }

    if (new Date(record.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'رمز التحقق منتهي الصلاحية. أعد إرسال رمز جديد.' }, { status: 400 });
    }

    const inputHash = crypto.createHash('sha256').update(inputOtp + userId).digest('hex');

    if (inputHash !== record.otpHash) {
        return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 });
    }

    // وضع علامة "مستخدم" على الرمز
    await prisma.$executeRaw`
        UPDATE "WithdrawOTP" SET "used" = true WHERE "userId" = ${userId}
    `;

    return NextResponse.json({
        success: true,
        verified: true,
        message: 'تم التحقق بنجاح. يمكنك المتابعة بطلب السحب.',
    });
}
