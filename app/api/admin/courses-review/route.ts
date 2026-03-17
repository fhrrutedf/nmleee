import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';
import { Resend } from 'resend';
import { sendTelegramMessage } from '@/lib/telegram';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// GET /api/admin/courses-review - pending courses
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'PENDING';

    const courses = await prisma.course.findMany({
        where: { approval_status: status } as any,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
            _count: { select: { sections: true } },
        },
    } as any);

    return NextResponse.json(courses);
}

// PATCH /api/admin/courses-review - approve or reject
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { courseId, action, note } = await req.json();

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { user: { select: { name: true, email: true } } },
    });

    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'approve') {
        await prisma.course.update({
            where: { id: courseId },
            data: {
                isPublished: true,
                approval_status: 'APPROVED',
                reviewed_at: new Date(),
                reviewed_by: user.id,
            } as any,
        });

        // Notify seller via email
        try {
            await resend.emails.send({
                from: FROM,
                to: (course as any).user.email,
                subject: `✅ تم نشر كورسك: ${course.title}`,
                html: `<div dir="rtl" style="font-family:Arial;padding:20px">
                    <h2>مرحباً ${(course as any).user.name}! 🎉</h2>
                    <p>يسعدنا إخبارك أن كورسك <strong>"${course.title}"</strong> تمت مراجعته والموافقة عليه وهو الآن منشور على المنصة.</p>
                    ${note ? `<p><strong>ملاحظة:</strong> ${note}</p>` : ''}
                    <a href="${process.env.NEXTAUTH_URL}/dashboard/courses" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px">عرض الكورس</a>
                </div>`,
            });
        } catch { }

        await logActivity({
            actorId: user.id, actorName: user.name, actorRole: 'ADMIN',
            action: LOG_ACTIONS.COURSE_APPROVED, entityType: 'Course', entityId: courseId,
            details: { title: course.title, note },
        });

        return NextResponse.json({ success: true, message: 'تم نشر الكورس' });
    }

    if (action === 'reject') {
        await prisma.course.update({
            where: { id: courseId },
            data: {
                isPublished: false,
                approval_status: 'REJECTED',
                approval_note: note,
                reviewed_at: new Date(),
                reviewed_by: user.id,
            } as any,
        });

        // Notify seller
        try {
            await resend.emails.send({
                from: FROM,
                to: (course as any).user.email,
                subject: `⚠️ بخصوص كورسك: ${course.title}`,
                html: `<div dir="rtl" style="font-family:Arial;padding:20px">
                    <h2>مرحباً ${(course as any).user.name}</h2>
                    <p>تمت مراجعة كورسك <strong>"${course.title}"</strong> وللأسف لم يتم نشره في الوقت الحالي.</p>
                    ${note ? `<p><strong>السبب / ما يجب تعديله:</strong></p><p style="background:#fef3c7;padding:12px;border-radius:8px;">${note}</p>` : ''}
                    <p>بعد إجراء التعديلات، يمكنك إعادة رفع الكورس للمراجعة.</p>
                </div>`,
            });
        } catch { }

        await logActivity({
            actorId: user.id, actorName: user.name, actorRole: 'ADMIN',
            action: LOG_ACTIONS.COURSE_REJECTED, entityType: 'Course', entityId: courseId,
            details: { title: course.title, note },
        });

        return NextResponse.json({ success: true, message: 'تم رفض الكورس وإبلاغ البائع' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
