import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Verify ownership
        const coupon = await prisma.coupon.findUnique({
            where: { id: params.id },
        });

        if (!coupon || coupon.userId !== userId) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        await prisma.coupon.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'تم حذف الكوبون بنجاح' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في حذف الكوبون' },
            { status: 500 }
        );
    }
}
