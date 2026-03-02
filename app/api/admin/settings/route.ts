import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const {
        commissionRate,
        escrowDays,
        minPayoutAmount,
        syriatelCash,
        mtnCash,
        zainCash,
        shamCash,
        omtNumber,
        whishNumber,
        usdToSyp,
        usdToIqd,
        usdToEgp,
        usdToAed,
        supportEmail,
        supportWhatsapp,
        platformName,
    } = body;

    const settings = await prisma.platformSettings.upsert({
        where: { id: 'singleton' },
        create: {
            id: 'singleton',
            commissionRate: commissionRate ?? 10,
            escrowDays: escrowDays ?? 7,
            minPayoutAmount: minPayoutAmount ?? 50,
            syriatelCash, mtnCash, zainCash, shamCash, omtNumber, whishNumber,
            usdToSyp: usdToSyp ?? 13000,
            usdToIqd: usdToIqd ?? 1300,
            usdToEgp: usdToEgp ?? 50,
            usdToAed: usdToAed ?? 3.67,
            supportEmail, supportWhatsapp, platformName,
            updatedBy: user.id,
        },
        update: {
            ...(commissionRate !== undefined && { commissionRate }),
            ...(escrowDays !== undefined && { escrowDays }),
            ...(minPayoutAmount !== undefined && { minPayoutAmount }),
            ...(syriatelCash !== undefined && { syriatelCash }),
            ...(mtnCash !== undefined && { mtnCash }),
            ...(zainCash !== undefined && { zainCash }),
            ...(shamCash !== undefined && { shamCash }),
            ...(omtNumber !== undefined && { omtNumber }),
            ...(whishNumber !== undefined && { whishNumber }),
            ...(usdToSyp !== undefined && { usdToSyp }),
            ...(usdToIqd !== undefined && { usdToIqd }),
            ...(usdToEgp !== undefined && { usdToEgp }),
            ...(usdToAed !== undefined && { usdToAed }),
            ...(supportEmail !== undefined && { supportEmail }),
            ...(supportWhatsapp !== undefined && { supportWhatsapp }),
            ...(platformName !== undefined && { platformName }),
            updatedBy: user.id,
        },
    });

    return NextResponse.json({ success: true, settings });
}
