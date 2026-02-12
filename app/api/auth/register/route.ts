import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/novu';

export async function POST(request: NextRequest) {
    console.log('📝 New registration request received');

    try {
        const body = await request.json().catch(() => null);

        if (!body) {
            console.error('❌ Request body is missing or invalid JSON');
            return NextResponse.json(
                { error: 'بيانات غير صحيحة' },
                { status: 400 }
            );
        }

        let { name, email, username, password } = body;

        // Normalize inputs
        email = email?.trim().toLowerCase();
        username = username?.trim().toLowerCase();
        name = name?.trim();

        console.log(`👤 Registering user: ${username}, ${email}`);

        // Validation
        if (!name || !email || !username || !password) {
            console.error('❌ Missing required fields');
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

        // Check DB connection
        try {
            await prisma.$connect();
        } catch (dbError) {
            console.error('❌ Database connection failed:', dbError);
            return NextResponse.json(
                { error: 'فشل الاتصال بقاعدة البيانات. الرجاء المحاولة لاحقاً.' },
                { status: 503 }
            );
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            console.warn(`⚠️ Email already exists: ${email}`);
            return NextResponse.json(
                { error: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            console.warn(`⚠️ Username already exists: ${username}`);
            return NextResponse.json(
                { error: 'اسم المستخدم مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        console.log('🔐 Creating user in database...');
        const user = await prisma.user.create({
            data: {
                name,
                email,
                username,
                password: hashedPassword,
                // Add defaults explicitly if needed
                role: 'SELLER', // Default role
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
            },
        });

        console.log(`✅ User created successfully: ${user.id}`);

        // Send Welcome Email (Non-blocking)
        try {
            console.log('📧 Sending welcome email...');
            await sendWelcomeEmail(user.id, user.email, user.name, user.username);
        } catch (emailError) {
            console.error('⚠️ Failed to send welcome email (non-fatal):', emailError);
            // Continue execution
        }

        return NextResponse.json(
            { message: 'تم إنشاء الحساب بنجاح', user },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('❌ Registration fatal error:', error);

        let errorMessage = 'حدث خطأ غير متوقع أثناء إنشاء الحساب';
        let statusCode = 500;

        if (error.code === 'P2002') {
            // Prisma unique constraint violation - this is a client error, not server error
            errorMessage = 'هذا المستخدم موجود بالفعل';
            statusCode = 400;
        } else if (error instanceof SyntaxError) {
            errorMessage = 'بيانات غير صالحة';
            statusCode = 400;
        }

        return NextResponse.json(
            { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: statusCode }
        );
    } finally {
        // Disconnect Prisma if needed (usually handled by connection pool)
    }
}
