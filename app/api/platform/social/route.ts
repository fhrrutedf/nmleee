import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/platform/social — جلب وسائل التواصل الاجتماعي للمنصة (عامة)
 */
export async function GET() {
    try {
        const settings = await prisma.platformSettings.findUnique({
            where: { id: 'singleton' },
            select: {
                supportEmail: true,
                supportWhatsapp: true,
                socialTelegram: true,
                socialInstagram: true,
                socialFacebook: true,
                socialTwitter: true,
                socialYoutube: true,
                platformName: true,
            },
        });

        if (!settings) {
            return NextResponse.json({
                platformName: 'منصتي الرقمية',
                supportEmail: null,
                supportWhatsapp: null,
                socialTelegram: null,
                socialInstagram: null,
                socialFacebook: null,
                socialTwitter: null,
                socialYoutube: null,
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching platform social:', error);
        return NextResponse.json({ error: 'خطأ' }, { status: 500 });
    }
}
