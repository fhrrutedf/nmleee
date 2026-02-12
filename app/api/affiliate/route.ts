import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, affiliateCode: true },
        });

        // Generate affiliate code if not exists
        let affiliateCode = user?.affiliateCode;
        if (!affiliateCode) {
            affiliateCode = generateAffiliateCode();
            await prisma.user.update({
                where: { id: userId },
                data: { affiliateCode },
            });
        }

        // Generate affiliate link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const affiliateLink = `${baseUrl}?ref=${affiliateCode}`;

        // Get affiliate stats
        const referrals = await prisma.affiliateReferral.findMany({
            where: { affiliateUserId: userId },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalEarnings = referrals.reduce((sum, ref) => sum + ref.commission, 0);
        const totalReferrals = referrals.length;

        // Simulate conversion rate (in production, track clicks)
        const conversionRate = totalReferrals > 0 ? ((totalReferrals / 100) * 100).toFixed(1) : '0.0';

        const affiliatesData = referrals.map(ref => ({
            id: ref.id,
            createdAt: ref.createdAt,
            productTitle: ref.order.items[0]?.product?.title || 'Unknown',
            amount: ref.order.totalAmount,
            commission: ref.commission,
            status: ref.status,
        }));

        return NextResponse.json({
            stats: {
                totalEarnings,
                totalReferrals,
                conversionRate: parseFloat(conversionRate),
                commissionRate: 10, // 10% commission
            },
            affiliates: affiliatesData,
            affiliateLink,
        });
    } catch (error) {
        console.error('Error fetching affiliate data:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب بيانات الأفلييت' },
            { status: 500 }
        );
    }
}

function generateAffiliateCode(): string {
    return 'AFF' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
