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

/**
 * تحويل روابط الصور العادية (مثل Supabase) إلى روابط ImageKit المحسنة
 * @param originalUrl الرابط الأصلي للصورة
 * @param width العرض المطلوب
 * @param height الطول المطلوب
 * @param quality الجودة (1-100)
 */
export function getOptimizedImageUrl(
    originalUrl: string, 
    width?: number, 
    height?: number, 
    quality: number = 80
): string {
    if (!originalUrl) return '';
    
    // إذا لم تكن إعدادات ImageKit مفعلة، نرجع الرابط الأصلي
    if (!IMAGEKIT_URL_ENDPOINT) return originalUrl;

    // إذا كانت الصورة بالفعل من ImageKit، نقوم بإضافة التحويلات فقط
    if (originalUrl.includes(IMAGEKIT_URL_ENDPOINT)) {
        const urlObj = new URL(originalUrl);
        const params = new URLSearchParams(urlObj.search);
        
        let transform = `tr:q-${quality}`;
        if (width) transform += `,w-${width}`;
        if (height) transform += `,h-${height}`;
        
        // ImageKit support for transformations via path or query
        return `${IMAGEKIT_URL_ENDPOINT}${urlObj.pathname}?tr=${transform.replace('tr:', '')}`;
    }

    // إذا كانت الصورة من Supabase، نقوم بتبديل الدومين إذا كان الـ Origin مهيأ في ImageKit
    // نفترض أن المستخدم قام بربط Supabase كـ Origin في ImageKit
    if (originalUrl.includes('supabase.co')) {
        try {
            const urlObj = new URL(originalUrl);
            const pathSegments = urlObj.pathname.split('/');
            // عادة المسار يكون /storage/v1/object/public/BUCKET/USER/FILE
            // نحن نريد المسار النسبي فقط
            const storageIndex = pathSegments.indexOf('public');
            if (storageIndex !== -1) {
                const relativePath = pathSegments.slice(storageIndex + 1).join('/');
                let transform = `tr:q-${quality}`;
                if (width) transform += `,w-${width}`;
                if (height) transform += `,h-${height}`;
                
                return `${IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '')}/${relativePath}?${transform}`;
            }
        } catch (e) {
            return originalUrl;
        }
    }

    return originalUrl;
}
