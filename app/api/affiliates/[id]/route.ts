import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const linkId = id;
        if (!linkId) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });

        const body = await req.json();

        // Basic check to see if this seller owns the product that this link targets
        const link = await prisma.affiliateLink.findUnique({
            where: { id: linkId },
            include: { product: true, course: true }
        });

        if (!link) {
            return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
        }

        const isOwner = (link.product && link.product.userId === session.user.id) ||
            (link.course && link.course.userId === session.user.id);

        if (!isOwner) {
            return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا الرابط' }, { status: 403 });
        }

        const updated = await prisma.affiliateLink.update({
            where: { id: linkId },
            data: { isActive: body.isActive !== undefined ? body.isActive : link.isActive }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating affiliate link:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const linkId = id;
        const link = await prisma.affiliateLink.findUnique({
            where: { id: linkId },
            include: { product: true, course: true }
        });

        if (!link) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

        const isOwner = (link.product && link.product.userId === session.user.id) ||
            (link.course && link.course.userId === session.user.id);

        if (!isOwner) return NextResponse.json({ error: 'غير مصرح بمسح الرابط' }, { status: 403 });

        await prisma.affiliateLink.delete({ where: { id: linkId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json({ error: 'خطأ أثناء الحذف' }, { status: 500 });
    }
}
