import crypto from 'crypto';

/**
 * توليد رابط تشغيل موقع (Signed URL/Token) لخدمة Bunny Stream
 * يمنع الوصول غير المصرح ويحمي الفيديوهات من التسريب
 * 
 * الخوارزمية: token = SHA256_HEX(securityKey + videoId + expires)
 * المصدر: https://docs.bunny.net/docs/stream-embedding-videos
 */
export async function getBunnySignedUrl(
    libraryId: string | null | undefined,
    videoId: string,
    expirationSeconds: number = 3600
): Promise<string> {
    const securityKey = process.env.BUNNY_SECURITY_KEY?.trim();
    const resolvedLibraryId = libraryId || process.env.BUNNY_LIBRARY_ID;
    const cleanVideoId = videoId.toString().trim().toLowerCase();

    if (!resolvedLibraryId || !securityKey) {
        // إذا لم توجد مفاتيح، نرسل الرابط خام كحل أخير (قد يعطي 403)
        return `https://iframe.mediadelivery.net/embed/${resolvedLibraryId || 'unknown'}/${cleanVideoId}`;
    }

    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    
    // الصيغة الدقيقة لـ Bunny Stream v2:
    // path = /embed/LIBRARY_ID/VIDEO_ID
    // stringToHash = securityKey + path + expires
    const path = `/embed/${resolvedLibraryId}/${cleanVideoId}`;
    const stringToHash = securityKey + path + expires.toString();
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');

    return `https://iframe.mediadelivery.net${path}?token=${hash}&expires=${expires}`;
}

/**
 * فحص رابط Bunny Embed وتوقيعه إذا لزم الأمر
 * (حالياً يرجع الرابط نظيفاً بدون توقيع)
 */
export async function signBunnyEmbedIfNeeded(url: string, expirationSeconds: number = 3600): Promise<string> {
    if (!url) return url;

    const bunnyEmbedMatch = url.match(
        /(?:iframe|player)\.mediadelivery\.net\/embed\/(\d+)\/([a-f0-9-]+)/i
    );

    if (!bunnyEmbedMatch) return url;

    const [, libraryId, videoId] = bunnyEmbedMatch;
    
    // توليد رابط موقع جديد باستخدام التشفير
    return getBunnySignedUrl(libraryId, videoId, expirationSeconds);
}

export async function createBunnyVideo(title: string) {
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    
    // Some libraries use a specific regional domain (e.g. ny.video.bunnycdn.com)
    // Default is video.bunnycdn.com for standard region (Falkenstein, Germany)
    const hostname = process.env.BUNNY_HOSTNAME || 'video.bunnycdn.com';

    if (!apiKey || !libraryId) {
        throw new Error('بيانات الربط مع Bunny (BUNNY_API_KEY, BUNNY_LIBRARY_ID) غير مكتملة في الخادم');
    }

    const res = await fetch(`https://${hostname}/library/${libraryId}/videos`, {
        method: 'POST',
        headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title || 'بدون عنوان' })
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`[BUNNY_INIT_ERROR] Status: ${res.status}. Body: ${text}`);
        throw new Error(`فشل تفويض رفع الفيديو من سيرفر Bunny. الكود: ${res.status}`);
    }

    const data = await res.json();
    if (!data.guid) {
        throw new Error(`لم يقم Bunny بإرجاع معرف صالح للفيديو. الرد كان: ${JSON.stringify(data)}`);
    }
    
    return data; // { guid: "video_id", ... }
}
