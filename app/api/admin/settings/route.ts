import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { getPlatformSettings } from '@/lib/commission';

// GET /api/admin/settings
export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const settings = await getPlatformSettings();
    return NextResponse.json(settings);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    try {
        const data: any = {
            commissionRate: Number(body.commissionRate ?? 10),
            growthCommissionRate: Number(body.growthCommissionRate ?? 5),
            proCommissionRate: Number(body.proCommissionRate ?? 2),
            escrowDays: Number(body.escrowDays ?? 7),
            freeEscrowDays: Number(body.freeEscrowDays ?? 14),
            growthEscrowDays: Number(body.growthEscrowDays ?? 7),
            proEscrowDays: Number(body.proEscrowDays ?? 1),
            referralCommissionRate: Number(body.referralCommissionRate ?? 1),
            minPayoutAmount: Number(body.minPayoutAmount ?? 50),
            syriatelCash: body.syriatelCash || null,
            mtnCash: body.mtnCash || null,
            zainCash: body.zainCash || null,
            shamCash: body.shamCash || null,
            omtNumber: body.omtNumber || null,
            whishNumber: body.whishNumber || null,
            usdToSyp: Number(body.usdToSyp ?? 13000),
            usdToIqd: Number(body.usdToIqd ?? 1300),
            usdToEgp: Number(body.usdToEgp ?? 50),
            usdToAed: Number(body.usdToAed ?? 3.67),
            platformName: body.platformName || 'منصتي الرقمية',
            supportEmail: body.supportEmail || null,
            supportWhatsapp: body.supportWhatsapp || null,
            socialTelegram: body.socialTelegram || null,
            socialInstagram: body.socialInstagram || null,
            socialFacebook: body.socialFacebook || null,
            socialTwitter: body.socialTwitter || null,
            socialYoutube: body.socialYoutube || null,
            updatedBy: user.id || null,
        };

        await prisma.platformSettings.upsert({
            where: { id: 'singleton' },
            create: { id: 'singleton', ...data },
            update: data,
        });

        // Also update PlatformConfig in Prisma
        await prisma.platformConfig.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                usdToSyp: data.usdToSyp,
                usdToIqd: data.usdToIqd,
                usdToEgp: data.usdToEgp,
                shamCashPhone: data.shamCash,
                omtPhone: data.omtNumber,
                zainCashPhone: data.zainCash,
                vodafoneCash: data.whishNumber,
                mtnCashPhone: data.mtnCash,
            },
            update: {
                usdToSyp: data.usdToSyp,
                usdToIqd: data.usdToIqd,
                usdToEgp: data.usdToEgp,
                shamCashPhone: data.shamCash,
                omtPhone: data.omtNumber,
                zainCashPhone: data.zainCash,
                vodafoneCash: data.whishNumber,
                mtnCashPhone: data.mtnCash,
            }
        });

        const updated = await getPlatformSettings();
        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error('Error saving platform settings:', error);
        return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 });
    }
}
