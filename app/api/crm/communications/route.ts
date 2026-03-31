import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/communications - List all communications
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contactId = searchParams.get('contactId');
        const dealId = searchParams.get('dealId');
        const type = searchParams.get('type');

        const where: any = { ownerId: session.user.id };

        if (contactId) where.contactId = contactId;
        if (dealId) where.dealId = dealId;
        if (type) where.type = type;

        const communications = await prisma.cRMCommunication.findMany({
            where,
            include: {
                contact: { select: { id: true, name: true, email: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(communications);
    } catch (error) {
        console.error('Error fetching communications:', error);
        return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
    }
}

// POST /api/crm/communications - Create new communication
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, direction, subject, content, callDuration, contactId, dealId } = body;

        const communication = await prisma.cRMCommunication.create({
            data: {
                type,
                direction: direction || 'outbound',
                subject,
                content,
                callDuration,
                contactId,
                dealId,
                ownerId: session.user.id
            },
            include: {
                contact: { select: { id: true, name: true, email: true } },
                deal: { select: { id: true, title: true } }
            }
        });

        // Update lastContactedAt on the contact
        if (contactId) {
            await prisma.cRMContact.update({
                where: { id: contactId },
                data: { lastContactedAt: new Date() }
            });
        }

        return NextResponse.json(communication, { status: 201 });
    } catch (error) {
        console.error('Error creating communication:', error);
        return NextResponse.json({ error: 'Failed to create communication' }, { status: 500 });
    }
}

// DELETE /api/crm/communications - Delete communication
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Communication ID required' }, { status: 400 });
        }

        await prisma.cRMCommunication.delete({
            where: { id, ownerId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting communication:', error);
        return NextResponse.json({ error: 'Failed to delete communication' }, { status: 500 });
    }
}
