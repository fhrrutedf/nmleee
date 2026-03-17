import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

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

// POST /api/tickets - Create a new ticket
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        const { subject, category, message } = await req.json();

        if (!subject || !category || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the ticket and the initial message in a transaction
        const ticket = await prisma.$transaction(async (tx) => {
            // Generation logic for ticket number e.g. TKT-123456
            const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

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
                }
            });

            return newTicket;
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء التذكرة' }, { status: 500 });
    }
}
