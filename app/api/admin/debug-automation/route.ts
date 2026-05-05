import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
    triggerWelcomeEmail,
    triggerSellerNotification,
    saveAbandonedCart,
    triggerCourseCompletionEmail
} from '@/lib/automation-helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const testEmail = searchParams.get('email') || 'test@example.com';

    // نحتاج مستخدم (بائع) حقيقي للاختبار، سنأخذ أول بائع في النظام
    const seller = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!seller) return NextResponse.json({ error: 'لا يوجد بائع في النظام للاختبار' });

    try {
        switch (stage) {
            case '1': // Welcome Email
                await triggerWelcomeEmail({
                    customerEmail: testEmail,
                    customerName: 'مختبر النظام',
                    sellerId: seller.id,
                    productName: 'منتج تجريبي'
                });
                return NextResponse.json({ success: true, message: 'تم إرسال إيميل الترحيب' });

            case '2': // Abandoned Cart
                await saveAbandonedCart({
                    customerEmail: testEmail,
                    customerName: 'عميل متردد',
                    productIds: ['test-id'],
                    productNames: ['منتج في السلة'],
                    sellerId: seller.id,
                    totalAmount: 99.99
                });
                return NextResponse.json({ success: true, message: 'تم تسجيل سلة مهجورة تجريبية' });

            case '3': // Sale Notification
                // إشعار الداشبورد والإيميل للبائع
                await triggerSellerNotification({
                    sellerId: seller.id,
                    type: 'sale',
                    title: 'مبيعة جديدة! 💰',
                    content: `تم بيع منتج تجريبي بمبلغ $50.00 للعميل ${testEmail}`
                });
                return NextResponse.json({ success: true, message: 'تم إرسال إشعار المبيعة' });

            case '4': // Follow-up
                return NextResponse.json({ success: true, message: 'تمت المحاكاة' });

            case '5': // Edu Follow-up
                await triggerCourseCompletionEmail({
                    studentEmail: testEmail,
                    studentName: 'طالب مجتهد',
                    sellerId: seller.id,
                    courseName: 'كورس احتراف المنصة',
                    courseId: 'test-course'
                });
                return NextResponse.json({ success: true, message: 'تم إرسال متابعة تعليمية' });

            case '6': // Periodic Report
                const reportUrl = `${new URL(req.url).origin}/api/cron/daily-report`;
                return NextResponse.json({
                    success: true,
                    message: 'لتجربة التقرير الحقيقي، يرجى فتح رابط الـ Cron الخاص بالتقارير اليومية',
                    url: reportUrl
                });

            default:
                return NextResponse.json({ message: 'يرجى تحديد المرحلة من 1 إلى 6' });
        }
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
