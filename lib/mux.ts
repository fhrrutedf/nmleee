import Mux from '@mux/mux-node';

const { Video } = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

/**
 * توليد رابط فيديو محمي (Signed URL) باستخدام Mux
 * يمنع سرقة الرابط أو مشاركته خارج نطاق المنصة
 */
export async function getSignedPlaybackUrl(playbackId: string, expiration = '24h') {
    if (!playbackId) return null;

    try {
        // إذا لم توجد مفاتيح التوقيع، نستخدم الرابط العام (للعرض التوضيحي أو المبتدئين)
        if (!process.env.MUX_SIGNING_KEY || !process.env.MUX_SIGNING_PRIVATE_KEY) {
            return `https://stream.mux.com/${playbackId}.m3u8`;
        }

        const token = Mux.JWT.sign(playbackId, {
            keyId: process.env.MUX_SIGNING_KEY,
            keySecret: process.env.MUX_SIGNING_PRIVATE_KEY,
            type: 'video_playback',
            expiration: expiration,
        });

        return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
    } catch (error) {
        console.error('Mux Sign Error:', error);
        return null;
    }
}

/**
 * توليد رابط صورة مصغرة محمي
 */
export async function getSignedThumbnailUrl(playbackId: string, time = 0) {
    if (!playbackId) return null;

    if (!process.env.MUX_SIGNING_KEY || !process.env.MUX_SIGNING_PRIVATE_KEY) {
        return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}`;
    }

    const token = Mux.JWT.sign(playbackId, {
        keyId: process.env.MUX_SIGNING_KEY,
        keySecret: process.env.MUX_SIGNING_PRIVATE_KEY,
        type: 'thumbnail',
        expiration: '24h',
        params: { time: time.toString() }
    });

    return `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${token}`;
}
