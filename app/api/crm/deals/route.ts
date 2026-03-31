import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/deals - List all deals
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const stage = searchParams.get('stage');
        const contactId = searchParams.get('contactId');

        const where: any = { ownerId: session.user.id };

        if (stage) where.stage = stage;
        if (contactId) where.contactId = contactId;

        const deals = await prisma.cRMDeal.findMany({
            where,
            include: {
                contact: { select: { id: true, name: true, email: true } },
                _count: { select: { tasks: true, communications: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }
}

// POST /api/crm/deals - Create new deal
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, value, currency, stage, probability, expectedCloseDate, contactId, productId, courseId } = body;

        const deal = await prisma.cRMDeal.create({
            data: {
                title,
                description,
                value: value || 0,
                currency: currency || 'USD',
                stage: stage || 'lead',
                probability: probability || 0,
                expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
                contactId,
                ownerId: session.user.id,
                productId,
                courseId
            },
            include: {
                contact: { select: { id: true, name: true, email: true } }
            }
        });

        return NextResponse.json(deal, { status: 201 });
    } catch (error) {
        console.error('Error creating deal:', error);
        return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }
}
