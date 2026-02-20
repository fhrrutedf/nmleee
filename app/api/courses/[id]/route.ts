import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الدورة' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();

        const { id } = await params;

        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        if (course.userId !== userId) {
            return NextResponse.json({ error: 'غير مصرح بتعديل هذه الدورة' }, { status: 403 });
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                price: body.price !== undefined ? parseFloat(body.price) : undefined,
                category: body.category,
                image: body.image,
                tags: body.tags,
                duration: body.duration,
                sessions: body.sessions !== undefined ? (body.sessions ? parseInt(body.sessions) : null) : undefined,
                isActive: body.isActive,
                zoomLink: body.zoomLink,
                meetLink: body.meetLink,
            },
        });

        return NextResponse.json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في تحديث الدورة' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { id } = await params;

        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        if (course.userId !== userId) {
            return NextResponse.json({ error: 'غير مصرح بحذف هذه الدورة' }, { status: 403 });
        }

        await prisma.course.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'تم حذف الدورة بنجاح' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في حذف الدورة' },
            { status: 500 }
        );
    }
}
