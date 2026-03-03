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

        const config = await prisma.platformConfig.findUnique({ where: { id: 'singleton' } });

        // Return available payment methods for seller and fallback platform accounts
        const methods = {
            name: user.name,
            shamCash: user.shamCashNumber || config?.shamCashPhone,
            omt: user.omtNumber || config?.omtPhone,
            zainCash: user.zainCashNumber || config?.zainCashPhone,
            vodafoneCash: user.vodafoneCash || config?.vodafoneCash,
            mtncash: user.mtncashNumber || config?.mtnCashPhone,
            bank: user.bankName && user.accountNumber ? {
                name: user.bankName,
                account: user.accountNumber,
            } : null,
            platformWallets: config ? {
                shamCash: config.shamCashPhone,
                omt: config.omtPhone,
                zainCash: config.zainCashPhone,
                vodafoneCash: config.vodafoneCash,
                mtnCash: config.mtnCashPhone,
                usdToSyp: config.usdToSyp,
                usdToIqd: config.usdToIqd,
                usdToEgp: config.usdToEgp
            } : null
        };

        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
