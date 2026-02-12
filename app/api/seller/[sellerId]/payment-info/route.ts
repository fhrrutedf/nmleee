import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sellerId: string }> }
) {
    try {
        const { sellerId } = await params;


        const user = await prisma.user.findUnique({
            where: { id: sellerId },
            select: {
                name: true,
                shamCashNumber: true,
                omtNumber: true,
                zainCashNumber: true,
                vodafoneCash: true,
                mtncashNumber: true,
                bankName: true,
                accountNumber: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 });
        }

        // Return only available payment methods
        const methods = {
            name: user.name,
            shamCash: user.shamCashNumber,
            omt: user.omtNumber,
            zainCash: user.zainCashNumber,
            vodafoneCash: user.vodafoneCash,
            mtncash: user.mtncashNumber,
            bank: user.bankName && user.accountNumber ? {
                name: user.bankName,
                account: user.accountNumber,
            } : null,
        };

        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
