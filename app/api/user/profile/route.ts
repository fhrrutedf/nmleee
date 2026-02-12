import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
                id: true,
                name: true,
                email: true,
                username: true,
                bio: true,
                avatar: true,
                coverImage: true,
                brandColor: true,
                website: true,
                facebook: true,
                instagram: true,
                twitter: true,
                bankName: true,
                accountNumber: true,
                accountName: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الملف الشخصي' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: body.name,
                bio: body.bio,
                avatar: body.avatar,
                coverImage: body.coverImage,
                brandColor: body.brandColor,
                website: body.website,
                facebook: body.facebook,
                instagram: body.instagram,
                twitter: body.twitter,
                bankName: body.bankName,
                accountNumber: body.accountNumber,
                accountName: body.accountName,
            },
            select: {
                id: true,
                name: true,
                username: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في تحديث الملف الشخصي' },
            { status: 500 }
        );
    }
}
