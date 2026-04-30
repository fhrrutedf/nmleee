import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signBunnyEmbedIfNeeded } from '@/lib/bunny';
import { getImageKitSignedUrl } from '@/lib/imagekit';

/**
 * GET /api/courses/[id]/trailer
 * يُرجع رابط Trailer الموقع (Signed URL) لصفحة الكورس العامة
 * يدعم: ImageKit (جديد) ← Bunny Embed (قديم) ← رابط مباشر
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

        const rawUrl: string = course.trailerUrl;
        let signedUrl: string;

        // الأولوية: ImageKit CDN → Bunny Embed → رابط مباشر
        const imagekitEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';
        if (
            imagekitEndpoint &&
            rawUrl.includes(new URL(imagekitEndpoint).hostname)
        ) {
            // ✅ ImageKit: توليد Signed URL
            signedUrl = getImageKitSignedUrl(rawUrl, 7200);
        } else if (
            rawUrl.includes('iframe.mediadelivery.net') ||
            rawUrl.includes('bunnycdn.com')
        ) {
            // 🔄 Bunny Embed (للفيديوهات القديمة)
            signedUrl = await signBunnyEmbedIfNeeded(rawUrl, 7200);
        } else {
            // رابط خارجي مباشر (YouTube وغيره)
            signedUrl = rawUrl;
        }

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
