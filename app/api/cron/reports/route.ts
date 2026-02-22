import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { weeklyReportTemplate } from '@/lib/email-templates';

// CRON: يعمل كل اثنين الساعة 8 صباحاً
export async function GET(req: NextRequest) {
    const cronSecret = req.headers.get('authorization');
    if (process.env.CRON_SECRET && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let sent = 0;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    try {
        // جلب البائعين الذين فعّلوا التقارير
        const settings = await db.automationSettings.findMany({
            where: { reportEnabled: true },
            include: { user: true },
        });

        for (const setting of settings) {
            const seller = setting.user;

            // إحصائيات الأسبوع الحالي
            const currentWeekOrders = await db.order.findMany({
                where: {
                    sellerId: seller.id,
                    isPaid: true,
                    createdAt: { gte: oneWeekAgo },
                },
                include: { items: { include: { product: true, course: true } } },
            });

            // إحصائيات الأسبوع الماضي
            const prevWeekOrders = await db.order.findMany({
                where: {
                    sellerId: seller.id,
                    isPaid: true,
                    createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
                },
            });

            const revenue = currentWeekOrders.reduce((sum, o) => sum + o.sellerAmount, 0);
            const prevRevenue = prevWeekOrders.reduce((sum, o) => sum + o.sellerAmount, 0);

            // التقييمات الجديدة
            const newReviews = await db.review.count({
                where: {
                    product: { userId: seller.id },
                    createdAt: { gte: oneWeekAgo },
                },
            });

            // المنتج الأكثر مبيعاً
            const productSales: Record<string, { name: string; count: number }> = {};
            for (const order of currentWeekOrders) {
                for (const item of order.items) {
                    const name = item.product?.title || item.course?.title || 'منتج';
                    const key = item.productId || item.courseId || 'unknown';
                    if (!productSales[key]) productSales[key] = { name, count: 0 };
                    productSales[key].count += 1;
                }
            }
            const topProduct = Object.values(productSales).sort((a, b) => b.count - a.count)[0]?.name || 'لا توجد مبيعات بعد';

            const currentWeekCustomers = new Set(currentWeekOrders.map(o => o.customerEmail)).size;

            const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

            const html = weeklyReportTemplate({
                sellerName: seller.name,
                brandColor: seller.brandColor || '#0ea5e9',
                reportData: {
                    sales: currentWeekOrders.length,
                    revenue,
                    newCustomers: currentWeekCustomers,
                    topProduct,
                    newReviews,
                    prevRevenue,
                },
                weekNumber,
            });

            const result = await sendEmail({
                to: seller.email,
                toName: seller.name,
                subject: `📊 تقريرك الأسبوعي - الأسبوع ${weekNumber}`,
                html,
                fromName: 'تقاريرك',
            });

            await db.emailLog.create({
                data: {
                    type: 'report',
                    toEmail: seller.email,
                    toName: seller.name,
                    subject: `تقريرك الأسبوعي`,
                    status: result.success ? 'sent' : 'failed',
                    errorMessage: result.error,
                    sellerId: seller.id,
                },
            });

            if (result.success) sent++;
        }

        return NextResponse.json({ success: true, sent });
    } catch (error) {
        console.error('Reports cron error:', error);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
