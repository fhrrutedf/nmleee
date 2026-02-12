import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

        return NextResponse.json(user);
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

        // Update user settings
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                payoutMethod: method,
                bankDetails: method === 'bank' ? bankDetails : null,
                paypalEmail: method === 'paypal' ? paypalEmail : null,
                cryptoWallet: method === 'crypto' ? cryptoWallet : null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payout settings:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
