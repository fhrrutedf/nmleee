import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const broadcast = await prisma.broadcast.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'تم إيقاف عملية البث بنجاح' 
        });
    } catch (error) {
        return NextResponse.json({ error: 'فشل إيقاف البث' }, { status: 500 });
    }
}
