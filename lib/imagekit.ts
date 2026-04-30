import ImageKit from "imagekit";

const IMAGEKIT_PRIVATE_KEY  = process.env.IMAGEKIT_PRIVATE_KEY  || '';
const IMAGEKIT_PUBLIC_KEY   = process.env.IMAGEKIT_PUBLIC_KEY   || '';
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || '';

// Initialize with dummy values if env variables are missing during build time
export const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY || 'dummy_public_key',
    privateKey: IMAGEKIT_PRIVATE_KEY || 'dummy_private_key',
    urlEndpoint: IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy',
});


// ─── توليد توكن رفع (Client-Side Upload Auth) ─────────────────────────────
export function getImageKitUploadAuth() {
    return imagekit.getAuthenticationParameters();
}

// ─── توليد Signed URL لتشغيل الفيديو ──────────────────────────────────────
/**
 * يولّد رابطاً صالحاً مع توقيع وفق توثيق ImageKit الرسمي
 * @param filePathOrFullUrl - مسار الملف أو رابطه الكامل في ImageKit
 * @param expirySeconds     - مدة الصلاحية بالثواني (افتراضي: 3600)
 */
export function getImageKitSignedUrl(
    filePathOrFullUrl: string,
    expirySeconds: number = 3600
): string {
    if (!filePathOrFullUrl) return '';
    if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
        return filePathOrFullUrl;
    }

    const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '');
    const expireTimestamp = Math.floor(Date.now() / 1000) + expirySeconds;

    // تحديد مسار الصورة أو الفيديو بشكل صحيح
    let urlToSign = filePathOrFullUrl;
    
    // إذا كان رابطاً كاملاً، نستخدمه كما هو للـ url parameter
    if (filePathOrFullUrl.startsWith('http')) {
        return imagekit.url({
            src: filePathOrFullUrl,
            expireSeconds: expirySeconds,
            signed: true
        });
    } else {
        // إذا كان مساراً (مثلاً /videos/lesson.mp4)
        const path = filePathOrFullUrl.startsWith('/') ? filePathOrFullUrl : `/${filePathOrFullUrl}`;
        return imagekit.url({
            path: path,
            expireSeconds: expirySeconds,
            signed: true
        });
    }
}

// ─── التحقق من صحة إعدادات ImageKit ─────────────────────────────────────
export function validateImageKitConfig(): boolean {
    return !!(IMAGEKIT_PRIVATE_KEY && IMAGEKIT_PUBLIC_KEY && IMAGEKIT_URL_ENDPOINT);
}
