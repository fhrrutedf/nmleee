import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { getSignedPlaybackUrl } from '@/lib/mux';
import { getBunnySignedUrl } from '@/lib/bunny';

/**
 * الحصول على رابط التشغيل الموقع (Signed URL)
 * لمنع سرقة الفيديوهات وضمان الوصول المصرح فقط
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
                    select: {
                        courseId: true
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
        }

        // 1. التحقق من اشتراك المستخدم
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId: lesson.module.courseId,
                    studentEmail: session.user.email
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json({ error: 'يجب الاشتراك في الكورس لمشاهدة الفيديو' }, { status: 403 });
        }

        // 2. التحقق من التقدم السابق للدرس لتمريره للـ Player
        const progress: any = await prisma.lessonProgress.findUnique({
            where: {
                lessonId_enrollmentId: {
                    lessonId: lesson.id,
                    enrollmentId: enrollment.id
                }
            }
        });

        // 3. توليد الرابط الموقع إذا كان الفيديو محمياً
        let playbackUrl = lesson.videoUrl;
        let provider: 'mux' | 'bunny' | 'native' = 'native';
        
        if (lesson.bunnyVideoId && lesson.bunnyLibraryId) {
             playbackUrl = await getBunnySignedUrl(lesson.bunnyLibraryId, lesson.bunnyVideoId);
             provider = 'bunny';
        } else if (lesson.muxPlaybackId) {
             playbackUrl = await getSignedPlaybackUrl(lesson.muxPlaybackId);
             provider = 'mux';
        }

        return NextResponse.json({
            playbackUrl,
            provider,
            lastPosition: progress?.lastPosition || 0,
            isCompleted: progress?.isCompleted || false
        });

    } catch (error) {
        console.error('Playback API Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
