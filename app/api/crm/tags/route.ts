import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/tags - List all tags
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tags = await prisma.cRMTag.findMany({
            where: { ownerId: session.user.id },
            include: {
                _count: { select: { contacts: true } }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

// POST /api/crm/tags - Create new tag
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, color } = body;

        // Check if tag already exists
        const existing = await prisma.cRMTag.findFirst({
            where: { name, ownerId: session.user.id }
        });

        if (existing) {
            return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 400 });
        }

        const tag = await prisma.cRMTag.create({
            data: {
                name,
                color: color || '#10B981',
                ownerId: session.user.id
            }
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}

// DELETE /api/crm/tags - Delete tag
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
        }

        await prisma.cRMTag.delete({
            where: { id, ownerId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }
}
