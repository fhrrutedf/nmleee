import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // إحصائيات عامة للمسوق
        const stats = await prisma.affiliateLink.aggregate({
            where: { userId: user.id },
            _sum: {
                clicks: true,
                salesCount: true,
                revenue: true,
                commission: true
            }
        });

        // الروابط الخاصة بالمسوق
        const links = await prisma.affiliateLink.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                product: { select: { title: true, price: true, slug: true } },
                course: { select: { title: true, price: true, id: true } } // Assuming Course uses ID in UI or slug
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'https://tmleen.com';
        const formattedLinks = links.map(link => {
            let itemUrl = baseUrl;
            if (link.productId && link.product) {
                itemUrl = `${baseUrl}/product/${link.product.slug || link.productId}?ref=${link.code}`;
            } else if (link.courseId && link.course) {
                // Adjust course routing if it's different in app structure
                itemUrl = `${baseUrl}/courses/${link.courseId}?ref=${link.code}`;
            } else {
                itemUrl = `${baseUrl}?ref=${link.code}`;
            }

            return {
                ...link,
                url: itemUrl
            };
        });

        // الإحالات الحديثة (مبيعات المسوق)
        const recentReferrals = await prisma.affiliateSale.findMany({
            where: { link: { userId: user.id } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                order: { select: { orderNumber: true, totalAmount: true, status: true } }
            }
        });

        return NextResponse.json({
            stats: {
                totalClicks: stats._sum.clicks || 0,
                totalSales: stats._sum.salesCount || 0,
                totalRevenue: stats._sum.revenue || 0,
                totalCommission: stats._sum.commission || 0
            },
            links: formattedLinks,
            recentReferrals
        });

    } catch (error) {
        console.error('Error fetching affiliate data:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب بيانات التسويق' },
            { status: 500 }
        );
    }
}
