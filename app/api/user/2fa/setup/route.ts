import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/two-factor';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await (prisma.user as any).findUnique({
            where: { id: session.user.id },
            select: { email: true, twoFactorSecret: true, twoFactorEnabled: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (!user.email) return NextResponse.json({ 
            error: 'يجب أن يكون لدى الحساب بريد إلكتروني لإعداد التحقق بخطوتين. يرجى تحديث ملفك الشخصي أولاً.' 
        }, { status: 400 });

        // Generate or re-generate secret
        const { secret, otpauth } = generateTwoFactorSecret(user.email!);
        const qrCode = await generateQRCode(otpauth);

        // We don't enable it yet, just store the secret temporarily if needed
        // but it's better to return it and have the user verify first.
        // We'll update the user with the secret but NOT enable yet.
        await (prisma.user as any).update({
            where: { id: session.user.id },
            data: { twoFactorSecret: secret }
        });

        return NextResponse.json({ qrCode, secret });
    } catch (error: any) {
        console.error('2FA Setup error:', error);
        return NextResponse.json({ 
            error: 'حدث خطأ تقني في إعداد التحقق بخطوتين: ' + (error.message || 'Error') 
        }, { status: 500 });
    }
}
