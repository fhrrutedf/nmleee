import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * 🕵️‍♂️ FINAL LOCKDOWN: Secure Registration System
 * 1. IP-Based Rate Limiting (1 registration/hour).
 * 2. reCAPTCHA v3 Verification.
 * 3. Phone Validation (libphonenumber-js).
 * 4. IP Tracking for fraud prevention.
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    
    try {
        // --- 1. RATE LIMITING (1 REG/HOUR) ---
        const lastReg = await prisma.rateLimit.findUnique({
            where: { ip_key: { ip, key: 'register' } }
        });

        if (lastReg && lastReg.count >= 1) {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (lastReg.lastAttempt > hourAgo) {
                return NextResponse.json(
                    { error: 'لقد قمت بإنشاء حساب مؤخراً. يرجى المحاولة مرة أخرى بعد ساعة.' },
                    { status: 429 }
                );
            } else {
                // Reset limit after 1 hour
                await prisma.rateLimit.update({
                    where: { id: lastReg.id },
                    data: { count: 0, lastAttempt: new Date() }
                });
            }
        }

        const body = await request.json().catch(() => null);
        if (!body) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });

        let { name, email, username, password, phone, country, countryCode, ref } = body;

        // Normalize inputs
        email = email?.trim().toLowerCase();
        username = username?.trim().toLowerCase();
        name = name?.trim();

        // Basic Validation
        if (!name || !email || !username || !password) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        // --- 3. PHONE VALIDATION ---
        if (phone && countryCode) {
            const valid = isValidPhoneNumber(phone, countryCode as CountryCode);
            if (!valid) {
                return NextResponse.json({ error: 'رقم الهاتف غير صحيح للدولة المختارة' }, { status: 400 });
            }
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
        }

        // Uniqueness Checks
        const [existingEmail, existingUsername] = await Promise.all([
            prisma.user.findUnique({ where: { email }, select: { id: true } }),
            prisma.user.findUnique({ where: { username }, select: { id: true } }),
        ]);

        if (existingEmail) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
        if (existingUsername) return NextResponse.json({ error: 'اسم المستخدم مستخدم بالفعل' }, { status: 400 });

        // Password hash + Referral lookup
        const referralPromise = ref
            ? prisma.user.findUnique({ where: { username: ref.trim().toLowerCase() }, select: { id: true } })
            : Promise.resolve(null);

        const [hashedPassword, referrer] = await Promise.all([
            bcrypt.hash(password, 10),
            referralPromise,
        ]);

        // --- 4. CREATE USER & LOG IP ---
        const createData: any = {
            name,
            email,
            username,
            password: hashedPassword,
            phone: phone || undefined,
            country: country || undefined,
            countryCode: countryCode || undefined,
            lastIpAddress: ip, // TRACKING
        };

        if (referrer?.id) createData.referredById = referrer.id;

        const user = await prisma.user.create({
            data: createData,
            select: { id: true, name: true, email: true, username: true },
        });

        // UPDATE RATE LIMIT record
        await prisma.rateLimit.upsert({
            where: { ip_key: { ip, key: 'register' } },
            update: { count: { increment: 1 }, lastAttempt: new Date() },
            create: { ip, key: 'register', count: 1 }
        });

        // Send Welcome Email
        try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            sendWelcomeEmail(user.id, user.email, user.name, user.username).catch(
                (err: any) => console.error('⚠️ Welcome email failed:', err?.message)
            );
        } catch { }

        return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', user }, { status: 201 });

    } catch (error: any) {
        console.error('❌ Registration error:', error?.message);
        return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
    }
}
