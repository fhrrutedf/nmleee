import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { createBunnyVideo } from '@/lib/bunny';

/**
 * تجهيز عملية الرفع لـ Bunny Stream
 * 1. إنشاء سجل فيديو في Bunny
 * 2. حفظ الـ IDs في الـ Lesson
 * 3. إرجاع الـ IDs للـ Frontend ليبدأ الرفع
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

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // 1. إنشاء الفيديو في Bunny
        const bunnyResponse = await createBunnyVideo(`Lesson: ${lesson.title}`);
        const bunnyVideoId = bunnyResponse.guid;
        const libraryId = process.env.BUNNY_LIBRARY_ID || '';

        // 2. تحديث الدرس في قاعدة بياناتنا
        await (prisma.lesson as any).update({
            where: { id: lessonId },
            data: {
                bunnyVideoId,
                bunnyLibraryId: libraryId,
                videoStatus: 'uploading'
            }
        });

        return NextResponse.json({
            videoId: bunnyVideoId,
            libraryId: libraryId,
            apiKey: process.env.BUNNY_API_KEY // سنحتاجه للرفع المباشر من المتصفح
        });

    } catch (error) {
        console.error('Bunny Upload Error:', error);
        return NextResponse.json({ error: 'Failed to init upload' }, { status: 500 });
    }
}
