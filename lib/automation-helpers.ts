import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import {
    welcomeEmailTemplate,
    courseCompletionTemplate,
    marketingEmailTemplate,
} from '@/lib/email-templates';
import { sendTelegramMessage, newOrderMessage } from '@/lib/telegram';

// ─── 1. إيميل الترحيب عند الشراء ────────────────────────────────────
export async function triggerWelcomeEmail({ customerEmail, customerName, sellerId, productName }: {
    customerEmail: string; customerName: string; sellerId: string; productName?: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            prisma.automationSettings.findUnique({ where: { userId: sellerId } }),
            prisma.user.findUnique({ where: { id: sellerId } }),
        ]);
        if (!settings?.welcomeEmailEnabled || !seller) return;

        const html = welcomeEmailTemplate({
            customerName, sellerName: seller.name, brandColor: seller.brandColor || '#0ea5e9',
            customBody: settings.welcomeEmailBody || undefined, productName,
        });

        const result = await sendEmail({
            to: customerEmail, toName: customerName,
            subject: settings.welcomeEmailSubject || `مرحباً بك في ${seller.name}! 🎉`,
            html, fromName: seller.name,
        });

        await prisma.emailLog.create({
            data: { type: 'welcome', toEmail: customerEmail, toName: customerName, subject: settings.welcomeEmailSubject, status: result.success ? 'sent' : 'failed', errorMessage: result.error, sellerId },
        });
    } catch (err) {
        console.error('triggerWelcomeEmail error:', err);
    }
}

// ─── 2. إشعار البائع + صاحب المنصة عند بيع جديد ─────────────────────
export async function triggerSellerNotification({ sellerId, type, title, content }: {
    sellerId: string; type: 'sale' | 'review' | 'question' | 'completion' | 'refund'; title: string; content: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            prisma.automationSettings.findUnique({ where: { userId: sellerId } }),
            prisma.user.findUnique({ where: { id: sellerId } }),
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

        if (methods === 'internal' || methods === 'both') {
            await prisma.notification.create({
                data: { type: 'INTERNAL', title, content, receiverId: sellerId },
            });
        }

        if (methods === 'email' || methods === 'both') {
            const icons: Record<string, string> = { sale: '💰', review: '⭐', question: '❓', completion: '🎓', refund: '⚠️' };
            const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:20px;"><div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);"><h2 style="color:#1e293b;font-size:20px;">${icons[type]} ${title}</h2><p style="color:#334155;font-size:16px;line-height:1.8;">${content}</p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">افتح لوحة التحكم</a></div></body></html>`;
            await sendEmail({ to: seller.email, toName: seller.name, subject: `${icons[type]} ${title}`, html, fromName: 'إشعارات المنصة' });
        }
    } catch (err) {
        console.error('triggerSellerNotification error:', err);
    }
}

// ─── 3. إيميل تهنئة إتمام الكورس ──────────────────────────────────
export async function triggerCourseCompletionEmail({ studentEmail, studentName, sellerId, courseName, courseId, certificateUrl }: {
    studentEmail: string; studentName: string; sellerId: string; courseName: string; courseId: string; certificateUrl?: string;
}) {
    try {
        const [settings, seller] = await Promise.all([
            prisma.automationSettings.findUnique({ where: { userId: sellerId } }),
            prisma.user.findUnique({ where: { id: sellerId } }),
        ]);
        if (!settings?.eduFollowupEnabled || !seller) return;

        const nextCourse = await prisma.course.findFirst({
            where: { userId: sellerId, isActive: true, id: { not: courseId } },
            orderBy: { createdAt: 'desc' },
        });

        const html = courseCompletionTemplate({
            studentName, sellerName: seller.name, brandColor: seller.brandColor || '#0ea5e9', courseName, certificateUrl,
            nextCourseUrl: nextCourse ? `${process.env.NEXTAUTH_URL}/${seller.username}` : undefined,
            nextCourseName: nextCourse?.title,
        });

        const result = await sendEmail({ to: studentEmail, toName: studentName, subject: `🎓 تهانينا! أتممت كورس ${courseName}`, html, fromName: seller.name });
        await prisma.emailLog.create({ data: { type: 'edu_followup', toEmail: studentEmail, toName: studentName, subject: 'تهانينا - إتمام الكورس', status: result.success ? 'sent' : 'failed', errorMessage: result.error, sellerId } });
    } catch (err) {
        console.error('triggerCourseCompletionEmail error:', err);
    }
}

// ─── 4. حفظ السلة المهجورة ──────────────────────────────────────────
export async function saveAbandonedCart({ customerEmail, customerName, productIds, productNames, sellerId, totalAmount }: {
    customerEmail: string; customerName?: string; productIds: string[]; productNames: string[]; sellerId: string; totalAmount: number;
}) {
    try {
        const existing = await prisma.abandonedCart.findFirst({ where: { customerEmail, sellerId, isConverted: false } });
        if (existing) {
            await prisma.abandonedCart.update({ where: { id: existing.id }, data: { productIds, productNames, totalAmount } });
        } else {
            await prisma.abandonedCart.create({ data: { customerEmail, customerName, productIds, productNames, sellerId, totalAmount } });
        }
    } catch (err) {
        console.error('saveAbandonedCart error:', err);
    }
}

// ─── 5. تحويل السلة المهجورة ──────────────────────────────────────
export async function markCartConverted(customerEmail: string, sellerId: string) {
    try {
        await prisma.abandonedCart.updateMany({ where: { customerEmail, sellerId, isConverted: false }, data: { isConverted: true } });
    } catch (err) {
        console.error('markCartConverted error:', err);
    }
}
