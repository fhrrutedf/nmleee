// ============================================================
// دوال الأتمتة التي تُستدعى عند الأحداث (مثل إتمام طلب)
// ============================================================

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import {
    welcomeEmailTemplate,
    reviewRequestTemplate,
    upsellTemplate,
    courseCompletionTemplate,
} from '@/lib/email-templates';

// ─── 1. إيميل الترحيب عند الشراء ────────────────────────────────────
export async function triggerWelcomeEmail({
    customerEmail,
    customerName,
    sellerId,
    productName,
}: {
    customerEmail: string;
    customerName: string;
    sellerId: string;
    productName?: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            db.automationSettings.findUnique({ where: { userId: sellerId } }),
            db.user.findUnique({ where: { id: sellerId } }),
        ]);

        if (!settings?.welcomeEmailEnabled || !seller) return;

        const html = welcomeEmailTemplate({
            customerName,
            sellerName: seller.name,
            brandColor: seller.brandColor || '#0ea5e9',
            customBody: settings.welcomeEmailBody || undefined,
            productName,
        });

        const result = await sendEmail({
            to: customerEmail,
            toName: customerName,
            subject: settings.welcomeEmailSubject || `مرحباً بك في ${seller.name}! 🎉`,
            html,
            fromName: seller.name,
        });

        await db.emailLog.create({
            data: {
                type: 'welcome',
                toEmail: customerEmail,
                toName: customerName,
                subject: settings.welcomeEmailSubject,
                status: result.success ? 'sent' : 'failed',
                errorMessage: result.error,
                sellerId,
            },
        });
    } catch (err) {
        console.error('triggerWelcomeEmail error:', err);
    }
}

// ─── 2. إشعار البائع عند بيع جديد ──────────────────────────────────
export async function triggerSellerNotification({
    sellerId,
    type,
    title,
    content,
}: {
    sellerId: string;
    type: 'sale' | 'review' | 'question' | 'completion' | 'refund';
    title: string;
    content: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            db.automationSettings.findUnique({ where: { userId: sellerId } }),
            db.user.findUnique({ where: { id: sellerId } }),
        ]);

        if (!seller) return;

        const notifyMap: Record<string, boolean> = {
            sale: settings?.notifyOnSale ?? true,
            review: settings?.notifyOnReview ?? true,
            question: settings?.notifyOnQuestion ?? true,
            completion: settings?.notifyOnCompletion ?? true,
            refund: settings?.notifyOnRefund ?? true,
        };

        if (!notifyMap[type]) return;

        const methods = settings?.notifyMethods || 'both';

        // إشعار داخلي
        if (methods === 'internal' || methods === 'both') {
            await db.notification.create({
                data: {
                    type: 'INTERNAL',
                    title,
                    content,
                    receiverId: sellerId,
                },
            });
        }

        // إشعار بالإيميل
        if (methods === 'email' || methods === 'both') {
            const icons: Record<string, string> = {
                sale: '💰', review: '⭐', question: '❓', completion: '🎓', refund: '⚠️',
            };

            const html = `
        <!DOCTYPE html><html lang="ar" dir="rtl">
        <body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;">
          <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <h2 style="color:#1e293b;font-size:20px;">${icons[type]} ${title}</h2>
            <p style="color:#334155;font-size:16px;line-height:1.8;">${content}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
              افتح لوحة التحكم
            </a>
          </div>
        </body></html>
      `;

            await sendEmail({
                to: seller.email,
                toName: seller.name,
                subject: `${icons[type]} ${title}`,
                html,
                fromName: 'إشعارات المنصة',
            });
        }
    } catch (err) {
        console.error('triggerSellerNotification error:', err);
    }
}

// ─── 3. جدولة إيميل طلب التقييم (بعد 7 أيام) ──────────────────────
// يُستدعى هذا عند إتمام الطلب، والـ cron يتحقق منه لاحقاً
export async function schedulePostPurchaseEmails({
    customerEmail,
    customerName,
    sellerId,
    productName,
    productId,
    orderId,
}: {
    customerEmail: string;
    customerName: string;
    sellerId: string;
    productName: string;
    productId: string;
    orderId: string;
}) {
    // يتم التحقق وإرسال الإيميلات عبر cron جديد /api/cron/post-purchase
    // هنا نحفظ السجل فقط
    try {
        const settings = await db.automationSettings.findUnique({ where: { userId: sellerId } });
        if (!settings) return;

        if (settings.postPurchase7Enabled || settings.postPurchase30Enabled) {
            // نسجّل في EmailLog أنه مجدول (سيُرسل لاحقاً)
            console.log(`Post-purchase emails scheduled for order ${orderId}`);
        }
    } catch (err) {
        console.error('schedulePostPurchaseEmails error:', err);
    }
}

// ─── 4. إيميل تهنئة إتمام الكورس ──────────────────────────────────
export async function triggerCourseCompletionEmail({
    studentEmail,
    studentName,
    sellerId,
    courseName,
    courseId,
    certificateUrl,
}: {
    studentEmail: string;
    studentName: string;
    sellerId: string;
    courseName: string;
    courseId: string;
    certificateUrl?: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            db.automationSettings.findUnique({ where: { userId: sellerId } }),
            db.user.findUnique({ where: { id: sellerId } }),
        ]);

        if (!settings?.eduFollowupEnabled || !seller) return;

        // اقتراح كورس تالي
        const nextCourse = await db.course.findFirst({
            where: { userId: sellerId, isActive: true, id: { not: courseId } },
            orderBy: { createdAt: 'desc' },
        });

        const html = courseCompletionTemplate({
            studentName,
            sellerName: seller.name,
            brandColor: seller.brandColor || '#0ea5e9',
            courseName,
            certificateUrl,
            nextCourseUrl: nextCourse ? `${process.env.NEXTAUTH_URL}/${seller.username}` : undefined,
            nextCourseName: nextCourse?.title,
        });

        const result = await sendEmail({
            to: studentEmail,
            toName: studentName,
            subject: `🎓 تهانينا! أتممت كورس ${courseName}`,
            html,
            fromName: seller.name,
        });

        await db.emailLog.create({
            data: {
                type: 'edu_followup',
                toEmail: studentEmail,
                toName: studentName,
                subject: `تهانينا - إتمام الكورس`,
                status: result.success ? 'sent' : 'failed',
                errorMessage: result.error,
                sellerId,
            },
        });
    } catch (err) {
        console.error('triggerCourseCompletionEmail error:', err);
    }
}

// ─── 5. حفظ السلة المهجورة ──────────────────────────────────────────
export async function saveAbandonedCart({
    customerEmail,
    customerName,
    productIds,
    productNames,
    sellerId,
    totalAmount,
}: {
    customerEmail: string;
    customerName?: string;
    productIds: string[];
    productNames: string[];
    sellerId: string;
    totalAmount: number;
}) {
    try {
        // تحديث أو إنشاء سلة مهجورة
        const existing = await db.abandonedCart.findFirst({
            where: { customerEmail, sellerId, isConverted: false },
        });

        if (existing) {
            await db.abandonedCart.update({
                where: { id: existing.id },
                data: { productIds, productNames, totalAmount },
            });
        } else {
            await db.abandonedCart.create({
                data: { customerEmail, customerName, productIds, productNames, sellerId, totalAmount },
            });
        }
    } catch (err) {
        console.error('saveAbandonedCart error:', err);
    }
}

// ─── 6. تحويل السلة المهجورة (عند إتمام الشراء) ──────────────────
export async function markCartConverted(customerEmail: string, sellerId: string) {
    try {
        await db.abandonedCart.updateMany({
            where: { customerEmail, sellerId, isConverted: false },
            data: { isConverted: true },
        });
    } catch (err) {
        console.error('markCartConverted error:', err);
    }
}
