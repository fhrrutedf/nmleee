import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                include: { sender: { select: { name: true, role: true, avatar: true } } },
            },
        },
    });

    if (!ticket || ticket.userId !== user.id) {
        return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { message, attachmentUrl } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== user.id) {
        return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 });
    }

    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
        return NextResponse.json({ error: 'لا يمكن الرد على تذكرة مغلقة' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
        await tx.supportTicketMessage.create({
            data: {
                ticketId,
                senderId: user.id,
                senderRole: user.role,
                message,
                attachmentUrl: attachmentUrl || null
            },
        });

        // Update the ticket to show it was recently active
        await tx.supportTicket.update({
            where: { id: ticketId },
            data: {
                updatedAt: new Date(),
                // If it was waiting on the user, it is now OPEN or IN_PROGRESS again
                status: ticket.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'OPEN',
            },
        });
    });

    return NextResponse.json({ success: true });
}
