import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getImageKitUploadAuth, validateImageKitConfig } from '@/lib/imagekit';

/**
 * GET /api/imagekit/auth
 * يُرجع بيانات التوثيق اللازمة لرفع الفيديو مباشرةً من المتصفح إلى ImageKit
 * المرجع: https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!validateImageKitConfig()) {
            return NextResponse.json(
                { error: 'إعدادات ImageKit غير مكتملة في الخادم' },
                { status: 500 }
            );
        }

        const authParams = getImageKitUploadAuth();

        return NextResponse.json({
            ...authParams,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
    } catch (error: any) {
        console.error('[ImageKit Auth Error]', error);
        return NextResponse.json(
            { error: error?.message || 'فشل إنشاء توكن الرفع' },
            { status: 500 }
        );
    }
}
