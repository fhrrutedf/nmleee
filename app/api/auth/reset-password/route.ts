import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, email, password } = await request.json();

        if (!token || !email || !password) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        // 1. Verify token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token, email }
        });

        if (!resetToken) {
            return NextResponse.json({ error: 'الرمز غير صالح أو لم يُطلب' }, { status: 400 });
        }

        // 2. Check expiration
        if (new Date() > resetToken.expires) {
            return NextResponse.json({ error: 'انتهت صلاحية الرمز، الرجاء طلب رابط جديد' }, { status: 400 });
        }

        // 3. Update user password
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // 4. Delete the token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id }
        });

        return NextResponse.json({
            message: 'تم إعادة تعيين كلمة المرور بنجاح!',
            success: true
        });

    } catch (error) {
        console.error('Reset password API error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء الاتصال بالسيرفر' },
            { status: 500 }
        );
    }
}
