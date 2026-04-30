import crypto from 'crypto';

/**
 * ImageKit.io - مكتبة الوصول الآمن للفيديوهات
 */

const IMAGEKIT_PRIVATE_KEY  = process.env.IMAGEKIT_PRIVATE_KEY  || '';
const IMAGEKIT_PUBLIC_KEY   = process.env.IMAGEKIT_PUBLIC_KEY   || '';
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || '';

// ─── توليد توكن رفع (Client-Side Upload Auth) ─────────────────────────────
export function getImageKitUploadAuth(expire: number = 3600): {
    token: string;
    expire: number;
    signature: string;
} {
    const expireTimestamp = Math.floor(Date.now() / 1000) + expire;
    const token = crypto.randomBytes(16).toString('hex');
    // ImageKit توقيع: HMAC-SHA1(privateKey, token + expire)
    const signature = crypto
        .createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
        .update(token + expireTimestamp)
        .digest('hex');
    return { token, expire: expireTimestamp, signature };
}

// ─── توليد Signed URL لتشغيل الفيديو ──────────────────────────────────────
/**
 * يولّد رابطاً صالحاً مع توقيع وفق توثيق ImageKit الرسمي:
 * https://docs.imagekit.io/features/security/signed-urls
 *
 * صيغة الرابط الموقّع:
 *   {urlEndpoint}/{filePath}?ik-t={expiry}&ik-s={signature}
 *
 * التوقيع = HMAC-SHA256(privateKey, urlEndpoint + filePath + expiry)
 *
 * @param filePathOrFullUrl - مسار الملف أو رابطه الكامل في ImageKit
 * @param expirySeconds     - مدة الصلاحية بالثواني (افتراضي: ساعة)
 */
export function getImageKitSignedUrl(
    filePathOrFullUrl: string,
    expirySeconds: number = 3600
): string {
    if (!filePathOrFullUrl) return '';
    if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
        // إذا لم تُضبط المتغيرات، أعِد الرابط كما هو (للتوافق)
        return filePathOrFullUrl;
    }

    const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '');

    // استخراج المسار النسبي إذا كان URL كاملاً
    let filePath: string;
    if (filePathOrFullUrl.startsWith('http')) {
        // مثال: https://ik.imagekit.io/abc/videos/lesson.mp4 → /videos/lesson.mp4
        try {
            const url = new URL(filePathOrFullUrl);
            // إزالة الـ imagekit ID من المسار إذا كان جزءاً منه
            const endpointUrl = new URL(endpoint);
            filePath = url.pathname.replace(endpointUrl.pathname, '') || url.pathname;
        } catch {
            filePath = filePathOrFullUrl.replace(endpoint, '');
        }
    } else {
        filePath = filePathOrFullUrl.startsWith('/') ? filePathOrFullUrl : `/${filePathOrFullUrl}`;
    }

    const expiry = Math.floor(Date.now() / 1000) + expirySeconds;

    // التوقيع: HMAC-SHA256(privateKey, endpoint + path + expiry)
    const dataToSign = `${endpoint}${filePath}${expiry}`;
    const signature  = crypto
        .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
        .update(dataToSign)
        .digest('hex');

    return `${endpoint}${filePath}?ik-t=${expiry}&ik-s=${signature}`;
}

// ─── التحقق من صحة إعدادات ImageKit ─────────────────────────────────────
export function validateImageKitConfig(): boolean {
    return !!(IMAGEKIT_PRIVATE_KEY && IMAGEKIT_PUBLIC_KEY && IMAGEKIT_URL_ENDPOINT);
}
