import crypto from 'crypto';

/**
 * ImageKit.io - مكتبة الوصول الآمن للفيديوهات
 * تولّد روابط موقعة (Signed URLs) لحماية الفيديوهات
 * من الوصول غير المصرح به.
 *
 * الوثائق: https://docs.imagekit.io/api-reference/upload-file-api
 */

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_PUBLIC_KEY  = process.env.IMAGEKIT_PUBLIC_KEY  || '';
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || '';

// ─── توليد توكن رفع (Upload Auth Token) ───────────────────────────────────
export function getImageKitUploadAuth(expire: number = 3600): {
    token: string;
    expire: number;
    signature: string;
} {
    const expireTimestamp = Math.floor(Date.now() / 1000) + expire;
    const token = crypto.randomBytes(16).toString('hex');
    const signature = crypto
        .createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
        .update(token + expireTimestamp)
        .digest('hex');
    return { token, expire: expireTimestamp, signature };
}

// ─── توليد Signed URL لتشغيل الفيديو ──────────────────────────────────────
/**
 * يولّد رابطاً موقعاً يصلح لمدة محدودة (الافتراضي: ساعة)
 * @param filePath  - مسار الملف في ImageKit (مثال: /videos/lesson-abc.mp4)
 * @param expirySeconds - مدة صلاحية الرابط بالثواني
 */
export function getImageKitSignedUrl(
    filePath: string,
    expirySeconds: number = 3600
): string {
    if (!filePath) return '';

    const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '');
    const path     = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const expiry   = Math.floor(Date.now() / 1000) + expirySeconds;

    // إنشاء التوقيع: HMAC-SHA256(privateKey, endpoint + path + expiry)
    const dataToSign = `${endpoint}${path}${expiry}`;
    const signature  = crypto
        .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
        .update(dataToSign)
        .digest('hex');

    return `${endpoint}${path}?ik-t=${expiry}&ik-s=${signature}`;
}

// ─── بناء رابط HLS Streaming (مشفر) ───────────────────────────────────────
/**
 * يبني رابط بث HLS آمن من ImageKit
 * ImageKit يدعم تحويل الفيديو تلقائياً إلى HLS عبر transformation
 * @param filePath - مسار الملف في ImageKit
 * @param signed   - هل تريد رابطاً موقعاً لمنع السرقة؟
 */
export function getImageKitStreamUrl(
    filePath: string,
    signed: boolean = true
): string {
    if (!filePath) return '';

    const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '');
    const path     = filePath.startsWith('/') ? filePath : `/${filePath}`;

    // تحويل الفيديو تلقائياً عبر ImageKit transformations
    const streamPath = `${endpoint}/tr:f-auto,q-auto${path}`;

    if (!signed) return streamPath;

    const expiry    = Math.floor(Date.now() / 1000) + 3600;
    const signature = crypto
        .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
        .update(`${endpoint}${path}${expiry}`)
        .digest('hex');

    return `${streamPath}?ik-t=${expiry}&ik-s=${signature}`;
}

// ─── التحقق من صحة إعدادات ImageKit ─────────────────────────────────────
export function validateImageKitConfig(): boolean {
    return !!(IMAGEKIT_PRIVATE_KEY && IMAGEKIT_PUBLIC_KEY && IMAGEKIT_URL_ENDPOINT);
}
