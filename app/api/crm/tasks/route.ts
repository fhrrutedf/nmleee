import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/crm/tasks - List all tasks
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const contactId = searchParams.get('contactId');
        const dealId = searchParams.get('dealId');
        const upcoming = searchParams.get('upcoming'); // Get upcoming tasks

        const where: any = { ownerId: session.user.id };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (contactId) where.contactId = contactId;
        if (dealId) where.dealId = dealId;
        
        if (upcoming === 'true') {
            where.dueDate = { gte: new Date() };
            where.status = { not: 'completed' };
        }

        const tasks = await prisma.cRMTask.findMany({
            where,
            include: {
                contact: { select: { id: true, name: true, email: true } },
                deal: { select: { id: true, title: true, stage: true } }
            },
            orderBy: [
                { status: 'asc' },
                { dueDate: 'asc' }
            ]
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/crm/tasks - Create new task
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, dueDate, priority, type, contactId, dealId } = body;

        const task = await prisma.cRMTask.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || 'medium',
                type: type || 'general',
                status: 'pending',
                contactId,
                dealId,
                ownerId: session.user.id
            },
            include: {
                contact: { select: { id: true, name: true, email: true } },
                deal: { select: { id: true, title: true } }
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

// PATCH /api/crm/tasks - Bulk update tasks
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, completedAt } = body;

        const updateData: any = { status };
        if (status === 'completed') {
            updateData.completedAt = new Date();
        } else if (status === 'pending' || status === 'in_progress') {
            updateData.completedAt = null;
        }

        const task = await prisma.cRMTask.update({
            where: { id, ownerId: session.user.id },
            data: updateData,
            include: {
                contact: { select: { id: true, name: true } },
                deal: { select: { id: true, title: true } }
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE /api/crm/tasks - Delete task
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        await prisma.cRMTask.delete({
            where: { id, ownerId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
