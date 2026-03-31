import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/contacts - List all contacts
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const tagId = searchParams.get('tagId');

        const where: any = { ownerId: session.user.id };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) where.status = status;
        if (tagId) where.tags = { some: { id: tagId } };

        const contacts = await prisma.cRMContact.findMany({
            where,
            include: {
                tags: true,
                _count: {
                    select: { deals: true, tasks: true, communications: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

// POST /api/crm/contacts - Create new contact
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, phone, company, source, sourceDetails, status, notes, tagIds, customFields } = body;

        // Check if contact already exists
        const existing = await prisma.cRMContact.findFirst({
            where: { email, ownerId: session.user.id }
        });

        if (existing) {
            return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 400 });
        }

        const contact = await prisma.cRMContact.create({
            data: {
                name,
                email,
                phone,
                company,
                source: source || 'manual',
                sourceDetails,
                status: status || 'lead',
                notes,
                customFields: customFields || {},
                ownerId: session.user.id,
                tags: tagIds ? { connect: tagIds.map((id: string) => ({ id })) } : undefined
            },
            include: { tags: true }
        });

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
