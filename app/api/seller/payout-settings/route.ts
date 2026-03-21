import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                payoutMethod: true,
                bankDetails: true,
                paypalEmail: true,
                cryptoWallet: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Decrypt sensitive data for the user
        const { decryptPaymentJson, decryptPaymentData } = await import('@/lib/encryption');
        
        return NextResponse.json({
            ...user,
            bankDetails: decryptPaymentJson(user.bankDetails as any),
            paypalEmail: user.paypalEmail ? decryptPaymentData(user.paypalEmail) : null,
            cryptoWallet: user.cryptoWallet ? decryptPaymentData(user.cryptoWallet) : null,
        });
    } catch (error) {
        console.error('Error fetching payout settings:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { method, bankDetails, paypalEmail, cryptoWallet } = body;

        // Validate method
        if (!['bank', 'paypal', 'crypto'].includes(method)) {
            return NextResponse.json({ error: 'طريقة دفع غير صالحة' }, { status: 400 });
        }

        // Encrypt sensitive data
        const { encryptPaymentJson, encryptPaymentData } = await import('@/lib/encryption');

        // Update user settings
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                payoutMethod: method,
                bankDetails: method === 'bank' ? (encryptPaymentJson(bankDetails) as any) : null,
                paypalEmail: method === 'paypal' ? encryptPaymentData(paypalEmail) : null,
                cryptoWallet: method === 'crypto' ? encryptPaymentData(cryptoWallet) : null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payout settings:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
