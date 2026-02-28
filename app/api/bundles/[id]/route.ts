import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        const { id } = await params;
        const bundle = await prisma.bundle.findUnique({ where: { id } });

        if (!bundle) return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 });
        if (bundle.userId !== session.user.id) return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });

        await prisma.bundle.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/bundles/[id]:', err);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bundle = await prisma.bundle.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: {
                            select: { id: true, title: true, price: true, image: true, description: true }
                        }
                    }
                },
                user: { select: { name: true, brandColor: true, avatar: true, username: true } }
            }
        });
        if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(bundle);
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
