import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/lessons/[lessonId]/imagekit/confirm
 * يُستدعى بعد نجاح الرفع من الـ Frontend لحفظ بيانات ImageKit في قاعدة البيانات
 *
 * Body: { fileId: string, url: string, name: string }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileId, url, name } = await req.json();

        if (!fileId || !url) {
            return NextResponse.json(
                { error: 'fileId و url مطلوبان' },
                { status: 400 }
            );
        }

        // حفظ بيانات ImageKit في الدرس
        await (prisma.lesson as any).update({
            where: { id: lessonId },
            data: {
                imagekitFileId: fileId,
                imagekitUrl:    url,
                videoStatus:    'ready',
                // مسح بيانات Bunny القديمة إن وجدت
                bunnyVideoId:   null,
                bunnyLibraryId: null,
            }
        });

        return NextResponse.json({ success: true, fileId, url });

    } catch (error: any) {
        console.error('[ImageKit Confirm Error]', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'Failed to save video data' },
            { status: 500 }
        );
    }
}
