/**
 * Mux Utility - Stub
 * 
 * تم تعطيل مكتبة Mux حالياً لتجنب أخطاء البناء في Vercel 
 * لأننا نستخدم Bunny Stream كخيار أساسي. 
 * إذا أردت تفعيل Mux:
 * 1. قم بتشغيل: npm install @mux/mux-node
 * 2. أعد تفعيل الكود الأصلي
 */

export async function getSignedPlaybackUrl(playbackId: string, expiration = '24h') {
    if (!playbackId) return null;
    
    // Fallback: رابط عام إذا لم يكن هناك مفاتيح توقيع
    // في حالة عدم وجود المكتبة، نعرض الرابط بدون توقيع (للعرض فقط)
    return `https://stream.mux.com/${playbackId}.m3u8`;
}

export async function getSignedThumbnailUrl(playbackId: string, time = 0) {
    if (!playbackId) return null;
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;
}
