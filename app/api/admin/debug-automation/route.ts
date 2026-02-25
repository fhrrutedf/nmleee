import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
    triggerWelcomeEmail,
    triggerSellerNotification,
    saveAbandonedCart,
    triggerCourseCompletionEmail
} from '@/lib/automation-helpers';
import { sendTelegramMessage } from '@/lib/telegram';

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

            case '3': // Sale & Telegram
                // 1. إشعار الداشبورد والإيميل للبائع
                await triggerSellerNotification({
                    sellerId: seller.id,
                    type: 'sale',
                    title: 'مبيعة جديدة! 💰',
                    content: `تم بيع منتج تجريبي بمبلغ $50.00 للعميل ${testEmail}`
                });
                // 2. إرسال للتلجرام
                await sendTelegramMessage(`🚀 <b>تجربة مبيعة جديدة</b>\nالعميل: ${testEmail}\nالمبلغ: $50.00\nالبائع: ${seller.name}`);

                return NextResponse.json({ success: true, message: 'تم إرسال إشعارات المبيعة والتلجرام' });

            case '4': // Subscription Reminder
                // هنا سنقوم بتشغيل الـ Cron الخاص بالاشتراكات يدوياً (سيفحص قاعدة البيانات)
                // للتسهيل، سنرسل رسالة تلجرام محاكية
                await sendTelegramMessage(`⏰ <b>تذكير اشتراك تجريبي</b>\nالعميل: ${testEmail}\nالخطة: الباقة الذهبية\nالأيام المتبقية: 7 أيام`);
                return NextResponse.json({ success: true, message: 'تمت محاكاة تذكير الاشتراك' });

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
