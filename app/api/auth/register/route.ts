import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    console.log('📝 New registration request received');

    try {
        console.time('⏱️ Registration Full Process');
        const body = await request.json().catch(() => null);

        if (!body) {
            return NextResponse.json(
                { error: 'بيانات غير صحيحة' },
                { status: 400 }
            );
        }

        let { name, email, username, password, phone, country, countryCode, ref } = body;

        // Normalize inputs
        email = email?.trim().toLowerCase();
        username = username?.trim().toLowerCase();
        name = name?.trim();

        // Validation
        if (!name || !email || !username || !password) {
            return NextResponse.json(
                { error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            );
        }

        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'صيغة البريد الإلكتروني غير صحيحة' },
                { status: 400 }
            );
        }

        // ⚡ Run email + username checks IN PARALLEL
        console.time('⏱️ DB Uniqueness Checks');
        const [existingEmail, existingUsername] = await Promise.all([
            prisma.user.findUnique({ where: { email }, select: { id: true } }),
            prisma.user.findUnique({ where: { username }, select: { id: true } }),
        ]);
        console.timeEnd('⏱️ DB Uniqueness Checks');

        if (existingEmail) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            );
        }

        if (existingUsername) {
            return NextResponse.json(
                { error: 'اسم المستخدم مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // ⚡ Hash password + referral lookup IN PARALLEL
        console.time('⏱️ Password Hash + Ref Lookup');
        const referralPromise = ref
            ? prisma.user.findUnique({
                  where: { username: ref.trim().toLowerCase() },
                  select: { id: true },
              })
            : Promise.resolve(null);

        const [hashedPassword, referrer] = await Promise.all([
            bcrypt.hash(password, 10),
            referralPromise,
        ]);
        console.timeEnd('⏱️ Password Hash + Ref Lookup');

        // Create user
        console.time('⏱️ User Creation (DB Write)');
        const createData: any = {
            name,
            email,
            username,
            password: hashedPassword,
            phone: phone || undefined,
            country: country || undefined,
            countryCode: countryCode || undefined,
        };

        if (referrer?.id) {
            createData.referredById = referrer.id;
        }

        const user = await prisma.user.create({
            data: createData,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
            },
        });
        console.timeEnd('⏱️ User Creation (DB Write)');

        console.log(`✅ User created: ${user.id}`);

        // 🔥 Send Welcome Email in background
        try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            sendWelcomeEmail(user.id, user.email, user.name, user.username).catch(
                (err: any) => console.error('⚠️ Welcome email failed:', err?.message)
            );
        } catch {
            // email module import failed — ignore
        }

        console.timeEnd('⏱️ Registration Full Process');
        return NextResponse.json(
            { message: 'تم إنشاء الحساب بنجاح', user },
            { status: 201 }
        );

    } catch (error: any) {
        console.timeEnd('⏱️ Registration Full Process');
        console.error('❌ Registration error:', error?.message);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'هذا المستخدم موجود بالفعل' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.' },
            { status: 500 }
        );
    }
}
