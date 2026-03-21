import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/resend';

// GET /api/tickets - List my tickets
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const tickets = await prisma.supportTicket.findMany({
        where: { userId: user.id },
        include: {
            _count: { select: { messages: true } },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1, // Get the latest message
            }
        },
        orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(tickets);
}

// POST /api/tickets - Create a new ticket with security and features
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        const { subject, category, message, attachmentUrl } = await req.json();

        if (!subject || !category || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Rate Limiting: Prevent more than 3 active (OPEN/IN_PROGRESS) tickets per user
        const activeTicketsCount = await prisma.supportTicket.count({
            where: {
                userId: user.id,
                status: { in: ['OPEN', 'IN_PROGRESS'] }
            }
        });

        if (activeTicketsCount >= 3) {
            return NextResponse.json({ 
                error: 'لديك عدد كبير من التذاكر المفتوحة حالياً. يرجى انتظار ردنا على التذاكر السابقة قبل فتح تذكرة جديدة.' 
            }, { status: 429 });
        }

        // 2. Robust and Unique Ticket ID Generation
        let ticketNumber = '';
        let exists = true;
        let attempts = 0;

        while (exists && attempts < 5) {
            ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
            const duplicate = await prisma.supportTicket.findUnique({ where: { ticketNumber } });
            if (!duplicate) exists = false;
            attempts++;
        }

        // 3. Create Ticket & Message in Transaction
        const ticket = await prisma.$transaction(async (tx) => {
            const newTicket = await tx.supportTicket.create({
                data: {
                    ticketNumber,
                    subject,
                    category: category as any,
                    userId: user.id,
                    priority: 'NORMAL',
                    status: 'OPEN',
                }
            });

            await tx.supportTicketMessage.create({
                data: {
                    ticketId: newTicket.id,
                    senderId: user.id,
                    senderRole: user.role,
                    message,
                    attachmentUrl: attachmentUrl || null, // Optional Attachment Support
                }
            });

            return newTicket;
        });

        // 4. Auto-Responder & Admin Notification (Async - do not block response)
        try {
            // User Auto-Responder
            await sendEmail({
                to: user.email,
                toName: user.name,
                subject: `استلمنا طلب الدعم الفني الخاص بك #${ticketNumber}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #0ea5e9;">مرحباً ${user.name}،</h2>
                        <p>نشكرك على تواصلك مع فريق دعم <strong>تمالين</strong>.</p>
                        <p>لقد تم فتح التذكرة رقم <strong>${ticketNumber}</strong> بخصوص <strong>"${subject}"</strong>.</p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>حالة الطلب:</strong> قيد المراجعة</p>
                            <p><strong>المدة المتوقعة للرد:</strong> خلال 24 ساعة عمل</p>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">يمكنك متابعة حالة التذكرة من خلال لوحة التحكم الخاصة بك.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="text-align: center; color: #94a3b8; font-size: 11px;">© منصة تمالين - نظام الدعم الفني الآلي</p>
                    </div>
                `
            });

            // Admin Notification (Using environment email)
            const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || 'support@tmleen.com';
            await sendEmail({
                to: adminEmail,
                toName: 'Platform Admin',
                subject: `📢 تذكرة دعم جديدة #${ticketNumber}: ${subject}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif;">
                        <h3>تذكرة دعم جديدة بانتظار الرد</h3>
                        <p><strong>المرسل:</strong> ${user.name} (${user.email})</p>
                        <p><strong>الموضوع:</strong> ${subject}</p>
                        <p><strong>التصنيف:</strong> ${category}</p>
                        <p><strong>الرسالة:</strong></p>
                        <blockquote style="background: #f1f5f9; padding: 15px; border-right: 4px solid #0ea5e9;">${message}</blockquote>
                        ${attachmentUrl ? `<p><strong>المرفقات:</strong> <a href="${attachmentUrl}">فتح المرفق</a></p>` : ''}
                        <br>
                        <a href="${process.env.NEXTAUTH_URL}/dashboard/admin/tickets/${ticket.id}" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">فتح التذكرة في لوحة الأدمن</a>
                    </div>
                `
            });
        } catch (mailError) {
            console.error('Support Notification Error:', mailError);
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء التذكرة، يرجى المحاولة لاحقاً' }, { status: 500 });
    }
}
