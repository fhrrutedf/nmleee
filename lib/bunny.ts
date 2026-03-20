import crypto from 'crypto';

/**
 * توليد رابط تشغيل موقع (Signed URL/Token) لخدمة Bunny Stream
 * يمنع الوصول غير المصرح ويحمي الفيديوهات من التسريب
 */
export async function getBunnySignedUrl(libraryId: string, videoId: string, expirationSeconds: number = 3600) {
    const securityKey = process.env.BUNNY_SECURITY_KEY;
    if (!securityKey) {
        console.warn('BUNNY_SECURITY_KEY is not defined. Returning public embed URL.');
        return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
    }

    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    
    // الصيغة المطلوبة من Bunny Stream للـ Token
    // token = sha256(security_key + video_id + expires)
    const stringToHash = securityKey + videoId + expires.toString();
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');

    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash}&expires=${expires}`;
}

/**
 * الحصول على رابط رفع فيديو جديد لـ Bunny Stream (Instructor Flow)
 */
export async function createBunnyVideo(title: string) {
    const apiKey = process.env.BUNNY_API_KEY;
    const libraryId = process.env.BUNNY_LIBRARY_ID;

    if (!apiKey || !libraryId) throw new Error('Bunny credentials missing');

    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: 'POST',
        headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    });

    return await res.json(); // { guid: "video_id" }
}
