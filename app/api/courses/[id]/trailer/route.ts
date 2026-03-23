import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signBunnyEmbedIfNeeded } from '@/lib/bunny';

/**
 * GET /api/courses/[id]/trailer
 * يُرجع رابط Trailer الموقع (Signed URL) لصفحة الكورس العامة
 * يُعالج Bunny Stream URLs تلقائياً ويحمي من 403 Forbidden
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // البحث بالـ ID أولاً، ثم بالـ slug
        let course: any = null;
        try {
            course = await prisma.course.findUnique({
                where: { id },
                select: { trailerUrl: true, isActive: true }
            });
        } catch (e) { /* not a valid cuid, skip */ }

        if (!course) {
            course = await prisma.course.findFirst({
                where: { slug: id },
                select: { trailerUrl: true, isActive: true }
            });
        }

        if (!course || !course.trailerUrl) {
            return NextResponse.json({ trailerUrl: null });
        }

        // توليد الرابط الموقع إذا كان من Bunny
        const signedUrl = await signBunnyEmbedIfNeeded(course.trailerUrl, 7200); // 2 ساعة

        // Cache headers: لا نُخزن مؤقتاً، لأن الـ token يتغير مع الوقت
        return NextResponse.json(
            { trailerUrl: signedUrl },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                }
            }
        );
    } catch (error) {
        console.error('[TRAILER_API] Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
