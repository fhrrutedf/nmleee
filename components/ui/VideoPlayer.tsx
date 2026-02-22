"use client";

import { useEffect, useRef, useState } from "react";
import { FiPlay, FiPause, FiMaximize, FiVolume2, FiVolumeX, FiSettings } from "react-icons/fi";

interface VideoPlayerProps {
    src: string;
    videoId: string; // Used to save/resume playback progress in localStorage
    title?: string;
    poster?: string;
}

export default function VideoPlayer({ src, videoId, title, poster }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // States
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [quality, setQuality] = useState("auto"); // Mocking quality selection for UI

    // Load progress from localStorage
    useEffect(() => {
        const savedTime = localStorage.getItem(`video-progress-${videoId}`);
        if (savedTime && videoRef.current) {
            videoRef.current.currentTime = parseFloat(savedTime);
            setCurrentTime(parseFloat(savedTime));
        }
    }, [videoId]);

    // Save progress periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (videoRef.current && isPlaying) {
                localStorage.setItem(`video-progress-${videoId}`, videoRef.current.currentTime.toString());
            }
        }, 3000); // save every 3 seconds

        return () => clearInterval(interval);
    }, [isPlaying, videoId]);

    // Video Events
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play().catch(() => { }); // Catch autoplay block
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgressScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setVolume(vol);
            setIsMuted(vol === 0);
        }
    };

    const setSpeed = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // Formatting time helper
    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div
            ref={containerRef}
            className="relative group bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl"
            onMouseLeave={() => setShowSettings(false)}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                poster={poster}
            />

            {/* Play/Pause Overlay - visible when paused or loading */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-sm transition-all"
                    onClick={togglePlay}
                >
                    <div className="w-20 h-20 bg-action-blue rounded-full flex items-center justify-center text-white p-2 hover:scale-110 transition-transform">
                        <FiPlay className="text-4xl ml-2" />
                    </div>
                </div>
            )}

            {/* Top Title Bar */}
            {title && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-white font-medium text-lg truncate">{title}</h3>
                </div>
            )}

            {/* Bottom Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                {/* Progress Bar */}
                <div className="relative group w-full mb-3 flex items-center h-1 hover:h-2 transition-all cursor-pointer">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleProgressScrub}
                        className="absolute w-full h-full opacity-0 z-20 cursor-pointer"
                    />
                    <div className="w-full h-full bg-white/30 rounded-full relative z-10 overflow-hidden">
                        <div
                            className="h-full bg-action-blue rounded-full transition-all ease-linear"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between" dir="ltr">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4 text-white">
                        <button onClick={togglePlay} className="hover:text-action-blue transition-colors">
                            {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                        </button>

                        <div className="flex items-center gap-2 group/vol relative">
                            <button onClick={toggleMute} className="hover:text-action-blue transition-colors">
                                {isMuted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={changeVolume}
                                className="w-0 group-hover/vol:w-20 transition-all opacity-0 group-hover/vol:opacity-100 accent-action-blue bg-white/20 h-1.5 rounded-lg overflow-hidden appearance-none"
                            />
                        </div>

                        <div className="text-sm font-medium tracking-wide">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4 text-white relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="hover:text-action-blue transition-colors"
                        >
                            <FiSettings size={20} />
                        </button>

                        {/* Settings Menu */}
                        {showSettings && (
                            <div className="absolute bottom-10 right-0 bg-gray-900 rounded-xl border border-gray-700 w-48 py-2 text-sm z-50">
                                {/* Speed Settings */}
                                <div className="px-4 py-2 border-b border-gray-800">
                                    <p className="text-gray-400 mb-2 font-semibold">سرعة التشغيل</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setSpeed(speed)}
                                                className={`px-2 py-1 rounded-lg transition-colors ${playbackRate === speed ? 'bg-action-blue text-white' : 'hover:bg-gray-800'}`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Quality UI Mock */}
                                <div className="px-4 py-2">
                                    <p className="text-gray-400 mb-2 font-semibold">الجودة</p>
                                    <div className="space-y-1">
                                        {['auto', '1080p', '720p', '480p'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => { setQuality(q); setShowSettings(false); }}
                                                className={`block w-full text-left px-2 py-1 rounded-lg transition-colors ${quality === q ? 'text-action-blue font-bold' : 'hover:bg-gray-800'}`}
                                            >
                                                {q === 'auto' ? 'تلقائي' : q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={toggleFullscreen} className="hover:text-action-blue transition-colors">
                            <FiMaximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
