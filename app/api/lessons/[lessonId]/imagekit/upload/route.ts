import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getImageKitUploadAuth, validateImageKitConfig } from '@/lib/imagekit';

/**
 * POST /api/lessons/[lessonId]/imagekit/upload
 * 1. يتحقق من صلاحيات المستخدم
 * 2. يُرجع بيانات توثيق ImageKit للرفع المباشر من المتصفح
 * 3. يُحضّر الدرس للاستقبال (videoStatus = 'uploading')
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

        if (!validateImageKitConfig()) {
            return NextResponse.json(
                { error: 'إعدادات ImageKit غير مكتملة في الخادم' },
                { status: 500 }
            );
        }

        // تحضير الدرس - وضعه في حالة "جاري الرفع"
        await (prisma.lesson as any).update({
            where: { id: lessonId },
            data: { videoStatus: 'uploading' }
        });

        const authParams = getImageKitUploadAuth();

        // اسم المجلد الخاص بالدرس في ImageKit
        const folder = `/videos/lessons/${lessonId}`;

        return NextResponse.json({
            ...authParams,
            publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            folder,
            fileName: `lesson-${lessonId}`, // اسم مقترح للملف
        });

    } catch (error: any) {
        console.error('[ImageKit Upload Init Error]', error?.message || error);
        return NextResponse.json(
            { error: error?.message || 'Failed to init upload' },
            { status: 500 }
        );
    }
}
