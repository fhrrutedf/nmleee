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
        // Use raw SQL upsert since PlatformSettings isn't in Prisma schema yet
        await prisma.$executeRaw`
            INSERT INTO platform_settings (
                id, commission_rate, escrow_days, min_payout_amount,
                syriatel_cash, mtn_cash, zain_cash, sham_cash, omt_number, whish_number,
                usd_to_syp, usd_to_iqd, usd_to_egp, usd_to_aed,
                platform_name, support_email, support_whatsapp, updated_at, updated_by
            ) VALUES (
                'singleton',
                ${body.commissionRate ?? 10},
                ${body.escrowDays ?? 7},
                ${body.minPayoutAmount ?? 50},
                ${body.syriatelCash ?? null},
                ${body.mtnCash ?? null},
                ${body.zainCash ?? null},
                ${body.shamCash ?? null},
                ${body.omtNumber ?? null},
                ${body.whishNumber ?? null},
                ${body.usdToSyp ?? 13000},
                ${body.usdToIqd ?? 1300},
                ${body.usdToEgp ?? 50},
                ${body.usdToAed ?? 3.67},
                ${body.platformName ?? 'منصتي الرقمية'},
                ${body.supportEmail ?? null},
                ${body.supportWhatsapp ?? null},
                NOW(),
                ${user.id ?? null}
            )
            ON CONFLICT (id) DO UPDATE SET
                commission_rate = EXCLUDED.commission_rate,
                escrow_days = EXCLUDED.escrow_days,
                min_payout_amount = EXCLUDED.min_payout_amount,
                syriatel_cash = EXCLUDED.syriatel_cash,
                mtn_cash = EXCLUDED.mtn_cash,
                zain_cash = EXCLUDED.zain_cash,
                sham_cash = EXCLUDED.sham_cash,
                omt_number = EXCLUDED.omt_number,
                whish_number = EXCLUDED.whish_number,
                usd_to_syp = EXCLUDED.usd_to_syp,
                usd_to_iqd = EXCLUDED.usd_to_iqd,
                usd_to_egp = EXCLUDED.usd_to_egp,
                usd_to_aed = EXCLUDED.usd_to_aed,
                platform_name = EXCLUDED.platform_name,
                support_email = EXCLUDED.support_email,
                support_whatsapp = EXCLUDED.support_whatsapp,
                updated_at = NOW(),
                updated_by = EXCLUDED.updated_by
        `;

        const updated = await getPlatformSettings();
        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error('Error saving platform settings:', error);
        return NextResponse.json({ error: 'فشل الحفظ' }, { status: 500 });
    }
}
