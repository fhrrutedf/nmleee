import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSignedPlaybackUrl } from '@/lib/mux';
import { getBunnySignedUrl } from '@/lib/bunny';
import { getImageKitSignedUrl } from '@/lib/imagekit';

/**
 * GET /api/lessons/[lessonId]/playback
 * الحصول على رابط التشغيل الآمن (Signed URL)
 * يدعم: ImageKit ← Bunny ← Mux ← رابط مباشر
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const lesson: any = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    select: { courseId: true }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        // 1. التحقق من هوية المستخدم وصلاحياته
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        const isAdmin = user?.role === 'ADMIN';

        const enrollment = await prisma.courseEnrollment.findFirst({
            where: {
                courseId: lesson.module.courseId,
                studentEmail: { equals: session.user.email, mode: 'insensitive' }
            }
        });

        const course = await prisma.course.findUnique({
            where: { id: lesson.module.courseId },
            select: { userId: true }
        });
        const isCreator = course?.userId === user?.id;

        // السماح بالوصول: طالب مشترك | أدمن | منشئ الكورس
        if (!enrollment && !isAdmin && !isCreator) {
            return NextResponse.json(
                { error: 'يجب الاشتراك في الكورس لمشاهدة الفيديو' },
                { status: 403 }
            );
        }

        // 2. استرجاع التقدم السابق (للطلاب فقط)
        let progress: any = null;
        if (enrollment) {
            progress = await prisma.lessonProgress.findUnique({
                where: {
                    lessonId_enrollmentId: {
                        lessonId: lesson.id,
                        enrollmentId: enrollment.id
                    }
                }
            });
        }

        // 3. توليد رابط التشغيل حسب مزود الفيديو
        // الأولوية: ImageKit → Bunny → Mux → رابط مباشر
        let playbackUrl = lesson.videoUrl;
        let provider: 'imagekit' | 'bunny' | 'mux' | 'native' = 'native';

        if (lesson.imagekitUrl) {
            // ✅ المزود الجديد: ImageKit مع Signed URL للحماية
            playbackUrl = getImageKitSignedUrl(lesson.imagekitUrl, 3600);
            provider    = 'imagekit';
        } else if (lesson.bunnyVideoId) {
            // 🔄 Fallback: Bunny (للدروس القديمة)
            playbackUrl = await getBunnySignedUrl(lesson.bunnyLibraryId, lesson.bunnyVideoId);
            provider    = 'bunny';
        } else if (lesson.muxPlaybackId) {
            // 🔄 Fallback: Mux
            playbackUrl = await getSignedPlaybackUrl(lesson.muxPlaybackId);
            provider    = 'mux';
        }

        return NextResponse.json({
            playbackUrl,
            provider,
            lastPosition: progress?.lastPosition || 0,
            isCompleted:  progress?.isCompleted  || false
        });

    } catch (error) {
        console.error('[Playback API Error]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
