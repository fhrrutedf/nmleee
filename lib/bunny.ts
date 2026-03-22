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
