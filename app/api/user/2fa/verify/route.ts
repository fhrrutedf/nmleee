import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyTwoFactorToken } from '@/lib/two-factor';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { token, secret } = await req.json();
        
        // Final verification using logic in lib/two-factor.ts
        const isValid = await verifyTwoFactorToken(token, secret);

        if (isValid) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { 
                    twoFactorEnabled: true,
                    twoFactorSecret: secret // Ensure it's the verified one
                }
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
        }
    } catch (error) {
        console.error('2FA Verify error:', error);
        return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                twoFactorEnabled: false,
                twoFactorSecret: null
            }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('2FA Disable error:', error);
        return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }
}
