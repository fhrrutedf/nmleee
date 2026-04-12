import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                brandColor: true,
                logoUrl: true,
                signatureUrl: true,
            },
        });

        return NextResponse.json(user ?? {});
    } catch (error) {
        console.error('Error fetching certificate settings:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { brandColor, logoUrl, signatureUrl } = await request.json();

        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(brandColor !== undefined && { brandColor }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(signatureUrl !== undefined && { signatureUrl }),
            },
        });

        return NextResponse.json({ success: true, message: 'تم حفظ إعدادات الشهادة بنجاح' });
    } catch (error) {
        console.error('Error saving certificate settings:', error);
        return NextResponse.json({ error: 'حدث خطأ في الحفظ' }, { status: 500 });
    }
}
