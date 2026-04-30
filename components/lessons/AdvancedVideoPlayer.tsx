'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface VideoPlayerProps {
    lessonId: string;
    courseId: string;
    studentEmail: string;
    onComplete?: () => void;
}

export default function AdvancedVideoPlayer({ lessonId, courseId, studentEmail, onComplete }: VideoPlayerProps) {
    const videoRef     = useRef<HTMLVideoElement>(null);
    const [playbackData, setPlaybackData] = useState<any>(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

    // ─── 1. جلب Signed URL + التقدم السابق ────────────────────────────────
    useEffect(() => {
        fetchPlayback();
        return () => stopHeartbeat();
    }, [lessonId]);

    const fetchPlayback = async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetch(`/api/lessons/${lessonId}/playback`);
            const data = await res.json();
            if (res.ok) {
                setPlaybackData(data);
                if (data.lastPosition > 0 && videoRef.current) {
                    videoRef.current.currentTime = data.lastPosition;
                }
            } else {
                setError(data.error || 'خطأ في جلب بيانات الفيديو');
            }
        } catch {
            setError('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    // ─── 2. Heartbeat (حفظ التقدم كل 10 ثوانٍ) ──────────────────────────
    const startHeartbeat = () => {
        if (heartbeatRef.current) return;
        heartbeatRef.current = setInterval(sendProgress, 10000);
    };

    const stopHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    };

    const sendProgress = async () => {
        if (!videoRef.current || !playbackData) return;
        const currentTime = videoRef.current.currentTime;
        const duration    = videoRef.current.duration;
        if (currentTime === 0) return;
        try {
            await fetch('/api/progress/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, courseId, currentTime, duration })
            });
        } catch {
            console.error('[Heartbeat] Failed to send progress');
        }
    };

    // ─── 3. معالجات الأحداث ───────────────────────────────────────────────
    const handlePlay    = () => startHeartbeat();
    const handlePause   = () => stopHeartbeat();
    const handleEnded   = () => {
        stopHeartbeat();
        sendProgress();
        if (onComplete) onComplete();
    };

    // ─── حالات التحميل والخطأ ─────────────────────────────────────────────
    if (loading) return (
        <div className="aspect-video w-full bg-gray-950 flex flex-col items-center justify-center text-white/50">
            <FiLoader size={48} className="animate-spin mb-4" />
            <p className="font-bold">جاري تحميل المشغل الآمن...</p>
        </div>
    );

    if (error || !playbackData) return (
        <div className="aspect-video w-full bg-gray-950 flex flex-col items-center justify-center text-white p-8 text-center">
            <FiAlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">فشل تحميل الفيديو</h3>
            <p className="text-white/60 mb-6">{error || 'بيانات الفيديو غير متوفرة'}</p>
            <button
                onClick={fetchPlayback}
                className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors"
            >
                <FiRefreshCw /> إعادة المحاولة
            </button>
        </div>
    );

    // ─── 4. عرض الفيديو بناءً على المزوّد ────────────────────────────────
    const renderVideo = () => {
        const { provider, playbackUrl } = playbackData;

        // ✅ ImageKit: بث مباشر عبر HTML5 Video (مع Signed URL)
        if (provider === 'imagekit' && playbackUrl) {
            return (
                <video
                    ref={videoRef}
                    key={playbackUrl}
                    src={playbackUrl}
                    controls
                    controlsList="nodownload nofullscreen"
                    disablePictureInPicture
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain"
                    playsInline
                >
                    متصفحك لا يدعم تشغيل هذا الفيديو.
                </video>
            );
        }

        // 🔄 Bunny (Fallback للدروس القديمة) - Iframe
        if (provider === 'bunny' && playbackUrl) {
            return (
                <iframe
                    src={playbackUrl}
                    loading="lazy"
                    style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                />
            );
        }

        // 🔄 Mux / رابط مباشر (Fallback)
        if (playbackUrl) {
            return (
                <video
                    ref={videoRef}
                    key={playbackUrl}
                    src={playbackUrl}
                    controls
                    controlsList="nodownload"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain"
                >
                    متصفحك لا يدعم تشغيل الفيديوهات المشفرة.
                </video>
            );
        }

        return (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
                رابط الفيديو غير صالح
            </div>
        );
    };

    return (
        <div className="relative group bg-black aspect-video rounded-xl overflow-hidden shadow-lg shadow-[#10B981]/20">
            {renderVideo()}

            {/* طبقة منع القرصنة - Watermark ثابت */}
            <div className="absolute top-8 left-8 pointer-events-none opacity-20 select-none hidden md:block">
                <div className="flex flex-col gap-1 items-start bg-black/40 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Protected by ManasaDigital</p>
                    <p className="text-[8px] font-bold text-[#10B981] opacity-50">{studentEmail || 'Authenticating...'}</p>
                </div>
            </div>

            {/* Watermark مائل مضاد للقص */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-[80px] font-bold text-white rotate-[-30deg]">
                MANASA
            </div>
        </div>
    );
}
