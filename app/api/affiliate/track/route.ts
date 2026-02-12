import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Affiliate code required' }, { status: 400 });
        }

        // Find affiliate link
        const affiliateLink = await prisma.affiliateLink.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!affiliateLink || !affiliateLink.isActive) {
            return NextResponse.json({ error: 'Invalid affiliate link' }, { status: 404 });
        }

        // Track click
        await prisma.affiliateClick.create({
            data: {
                linkId: affiliateLink.id,
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
                userAgent: req.headers.get('user-agent') || undefined,
                referer: req.headers.get('referer') || undefined,
            },
        });

        // Update clicks count
        await prisma.affiliateLink.update({
            where: { id: affiliateLink.id },
            data: {
                clicks: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking affiliate click:', error);
        return NextResponse.json({ error: 'Error tracking' }, { status: 500 });
    }
}
