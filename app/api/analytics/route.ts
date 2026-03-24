import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const period = parseInt(searchParams.get('period') || '30');

        // 1. حساب الفترات الزمنية
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - period);

        // 2. جلب معرفات الكورسات والمنتجات التابعة للبائع
        const sellerProducts = await prisma.product.findMany({
            where: { userId },
            select: { id: true, title: true }
        });
        const sellerCourses = await prisma.course.findMany({
            where: { userId },
            select: { id: true, title: true }
        });

        const productIds = sellerProducts.map(p => p.id);
        const courseIds = sellerCourses.map(c => c.id);

        // 3. جلب المبيعات الحقيقية (Real Sales)
        const currentOrders = await prisma.order.findMany({
            where: {
                sellerId: userId,
                createdAt: { gte: startDate },
                status: 'COMPLETED',
            },
            include: { items: true }
        });

        const previousOrders = await prisma.order.findMany({
            where: {
                sellerId: userId,
                createdAt: { gte: previousStartDate, lt: startDate },
                status: 'COMPLETED',
            }
        });

        // 4. جلب المشاهدات الحقيقية (Real Views)
        const currentViews = await prisma.productView.findMany({
            where: {
                OR: [
                    { productId: { in: productIds } },
                    { courseId: { in: courseIds } }
                ],
                createdAt: { gte: startDate }
            }
        });

        const previousViewsCount = await prisma.productView.count({
            where: {
                OR: [
                    { productId: { in: productIds } },
                    { courseId: { in: courseIds } }
                ],
                createdAt: { gte: previousStartDate, lt: startDate }
            }
        });

        // --- حساب الأرقام المحورية ---
        const totalRevenue = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalSales = currentOrders.length;
        const totalViews = currentViews.length;

        const previousRevenue = previousOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const previousSales = previousOrders.length;

        const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;
        const viewsGrowth = previousViewsCount > 0 ? ((totalViews - previousViewsCount) / previousViewsCount) * 100 : 0;
        
        // معدل التحويل الحقيقي
        const conversionRate = totalViews > 0 ? ((totalSales / totalViews) * 100) : 0;

        // --- تحليل مصادر الزيارات (Traffic Sources) ---
        const sourcesMap: Record<string, number> = {
            'Facebook': 0,
            'WhatsApp': 0,
            'Google/Search': 0,
            'Instagram/Tiktok': 0,
            'Direct/Other': 0
        };

        currentViews.forEach(v => {
            const ref = v.referrer?.toLowerCase() || '';
            if (ref.includes('facebook') || ref.includes('fb.me')) sourcesMap['Facebook']++;
            else if (ref.includes('wa.me') || ref.includes('whatsapp')) sourcesMap['WhatsApp']++;
            else if (ref.includes('google') || ref.includes('bing')) sourcesMap['Google/Search']++;
            else if (ref.includes('instagram') || ref.includes('t.co') || ref.includes('tiktok')) sourcesMap['Instagram/Tiktok']++;
            else sourcesMap['Direct/Other']++;
        });

        // --- جلب أداء كل منتج بدقة ---
        const productPerformance = await Promise.all([
            ...sellerProducts.map(async (p) => {
                const pViews = currentViews.filter(v => v.productId === p.id).length;
                const pSales = currentOrders.filter(o => o.items.some(i => i.productId === p.id)).length;
                const pRevenue = currentOrders.filter(o => o.items.some(i => i.productId === p.id))
                    .reduce((sum, o) => sum + (o.items.find(i => i.productId === p.id)?.price || 0), 0);
                
                return {
                    title: p.title,
                    type: 'product',
                    views: pViews,
                    sales: pSales,
                    revenue: pRevenue,
                    conversionRate: pViews > 0 ? (pSales / pViews) * 100 : 0
                };
            }),
            ...sellerCourses.map(async (c) => {
                const cViews = currentViews.filter(v => v.courseId === c.id).length;
                const cSales = currentOrders.filter(o => o.items.some(i => i.courseId === c.id)).length;
                const cRevenue = currentOrders.filter(o => o.items.some(i => i.courseId === c.id))
                    .reduce((sum, o) => sum + (o.items.find(i => i.courseId === c.id)?.price || 0), 0);

                return {
                    title: c.title,
                    type: 'course',
                    views: cViews,
                    sales: cSales,
                    revenue: cRevenue,
                    conversionRate: cViews > 0 ? (cSales / cViews) * 100 : 0
                };
            })
        ]);

        // --- بيانات الرسم البياني ---
        const revenueByDay = new Map<string, number>();
        currentOrders.forEach(o => {
            const day = o.createdAt.toISOString().split('T')[0];
            revenueByDay.set(day, (revenueByDay.get(day) || 0) + o.totalAmount);
        });

        const labels: string[] = [];
        const chartData: number[] = [];
        for (let i = period - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.toISOString().split('T')[0];
            labels.push(new Date(day).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }));
            chartData.push(revenueByDay.get(day) || 0);
        }

        return NextResponse.json({
            totalRevenue,
            totalOrders: totalSales,
            totalViews,
            conversionRate: conversionRate.toFixed(1),
            revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
            ordersGrowth: parseFloat(salesGrowth.toFixed(1)),
            viewsGrowth: parseFloat(viewsGrowth.toFixed(1)),
            revenueChart: {
                labels,
                data: chartData,
            },
            topProducts: productPerformance.sort((a, b) => b.revenue - a.revenue).slice(0, 5),
            productPerformance: productPerformance.sort((a, b) => b.views - a.views).slice(0, 10),
            trafficSources: Object.values(sourcesMap),
            recentActivity: currentOrders.slice(0, 5).map(o => ({
                id: o.id,
                type: 'sale',
                title: 'مبيعة جديدة',
                description: `تم بيع منتج بقيمة ${o.totalAmount} $`,
                time: o.createdAt
            }))
        });

    } catch (error) {
        console.error('Real Analytics Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب البيانات الحقيقية' }, { status: 500 });
    }
}
