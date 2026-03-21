import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * التحقق من صلاحية كوبون الخصم (منطق الباك آند الآمن)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, sellerId, items = [] } = body;

        if (!code || !sellerId) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        // 1. القيد الأول: التحقق من وجود الكوبون وربطه بالبائع الصحيح (Seller Scope)
        const coupon = await prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                userId: sellerId, // منع استخدام كوبونات بائعين آخرين
                isActive: true,
            },
        });

        if (!coupon) {
            return NextResponse.json(
                { error: 'كود الكوبون غير موجود لدى هذا البائع' },
                { status: 404 }
            );
        }

        // 2. التحقق من الصلاحية الزمنية
        if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
            return NextResponse.json(
                { error: 'هذا الكوبون لم يبدأ بعد' },
                { status: 400 }
            );
        }
        if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
            return NextResponse.json(
                { error: 'كود الكوبون منتهي الصلاحية' },
                { status: 400 }
            );
        }

        // 3. التحقق من الحد الأقصى للاستخدام
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json(
                { error: 'تم استنفاذ عدد مرات الاستخدام المسموح بها لهذا الكوبون' },
                { status: 400 }
            );
        }

        // 4. الحساب الآمن للسعر (Server-side Totaling)
        // لا نثق بالسعر القادم من الواجهة، نجلب الأسعار الحقيقية من الداتابيز
        const productIds = items.filter((i: any) => i.itemType === 'product').map((i: any) => i.id);
        const courseIds = items.filter((i: any) => i.itemType === 'course').map((i: any) => i.id);

        const [dbProducts, dbCourses] = await Promise.all([
            prisma.product.findMany({ where: { id: { in: productIds }, userId: sellerId } }),
            prisma.course.findMany({ where: { id: { in: courseIds }, userId: sellerId } })
        ]);

        let totalEligibleAmount = 0;
        let totalGeneralAmount = 0;

        // التحقق من تقييد الكوبون بمنتجات معينة (Product Scope)
        const restrictionExists = (coupon.productIds && coupon.productIds.length > 0) || (coupon.courseIds && coupon.courseIds.length > 0);

        for (const item of items) {
            let itemPrice = 0;
            if (item.itemType === 'product') {
                const p = dbProducts.find(db => db.id === item.id);
                if (p) itemPrice = p.price;
            } else if (item.itemType === 'course') {
                const c = dbCourses.find(db => db.id === item.id);
                if (c) itemPrice = c.price;
            }

            totalGeneralAmount += itemPrice;

            // إذا كان الكوبون مقيداً، نحسب فقط المنتجات المشمولة
            if (restrictionExists) {
                const isProductIncluded = item.itemType === 'product' && coupon.productIds.includes(item.id);
                const isCourseIncluded = item.itemType === 'course' && coupon.courseIds.includes(item.id);
                
                if (isProductIncluded || isCourseIncluded) {
                    totalEligibleAmount += itemPrice;
                }
            } else {
                // إذا لم يكن مقيداً، كل ما في السلة مؤهل
                totalEligibleAmount += itemPrice;
            }
        }

        if (totalEligibleAmount <= 0) {
            return NextResponse.json(
                { error: 'هذا الكوبون لا يشمل المنتجات الموجودة في سلة التسوق' },
                { status: 400 }
            );
        }

        // 5. التحقق من الحد الأدنى للشراء بناءً على المبالغ المحسوبة في السيرفر
        if (coupon.minPurchase && totalGeneralAmount < coupon.minPurchase) {
            return NextResponse.json(
                { error: `الحد الأدنى للشراء للاستفادة من الكوبون هو ${coupon.minPurchase}` },
                { status: 400 }
            );
        }

        // 6. الحساب الدقيق للخصم وتفعيل الحد الأقصى (Max Discount Cap)
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (totalEligibleAmount * coupon.value) / 100;
            
            // تطبيق الحد الأقصى للخصم (Max Discount)
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            // خصم ثابت، لا يمكن أن يتجاوز قيمة السلة المؤهلة
            discount = Math.min(coupon.value, totalEligibleAmount);
        }

        const finalAmount = Math.max(0, totalGeneralAmount - discount);

        return NextResponse.json({
            valid: true,
            discount,
            finalAmount,
            originalTotal: totalGeneralAmount,
            couponId: coupon.id,
            message: restrictionExists ? 'تم تطبيق الخصم على المنتجات المشمولة فقط' : 'تم تطبيق الخصم بنجاح'
        });

    } catch (error) {
        console.error('Coupon Security API Error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أمني أثناء معالجة الكوبون، يرجى المحاولة لاحقاً' },
            { status: 500 }
        );
    }
}
