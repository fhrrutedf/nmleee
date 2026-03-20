import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';

// GET Admin ticket info
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            user: { select: { name: true, email: true, role: true, avatar: true } },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { sender: { select: { name: true, role: true, avatar: true } } },
            },
        },
    });

    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ticket });
}

// PATCH Admin reply or status update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: ticketId } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, message, status, priority } = await req.json();

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    try {
        if (action === 'reply' && message) {
            await prisma.$transaction(async (tx) => {
                await tx.supportTicketMessage.create({
                    data: {
                        ticketId,
                        senderId: user.id,
                        senderRole: 'ADMIN',
                        message,
                    },
                });

                await tx.supportTicket.update({
                    where: { id: ticketId },
                    data: {
                        updatedAt: new Date(),
                        // Auto-set as resolved if requested or keep in progress
                        status: status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS',
                    },
                });
            });

            return NextResponse.json({ success: true, message: 'تم إرسال الرد بنجاح' });
        }

        if (action === 'updateStatus') {
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: { status, priority, updatedAt: new Date() },
            });

            return NextResponse.json({ success: true, message: 'تم تحديث حالة التذكرة' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'خطأ أثناء المعالجة' }, { status: 500 });
    }
}
