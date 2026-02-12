'use client';

import { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiVolume2, FiMaximize, FiSettings } from 'react-icons/fi';

interface VideoPlayerProps {
    videoUrl: string;
    onProgress?: (watchedDuration: number) => void;
    onComplete?: () => void;
    autoSaveInterval?: number; // in seconds
}

export default function VideoPlayer({
    videoUrl,
    onProgress,
    onComplete,
    autoSaveInterval = 10,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const lastSavedTime = useRef(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const current = video.currentTime;
            setCurrentTime(current);

            // Auto-save progress every N seconds
            if (onProgress && current - lastSavedTime.current >= autoSaveInterval) {
                onProgress(Math.floor(current));
                lastSavedTime.current = current;
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (onComplete) {
                onComplete();
            }
            if (onProgress) {
                onProgress(Math.floor(video.duration));
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onProgress, onComplete, autoSaveInterval]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newTime = parseFloat(e.target.value);
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                onClick={togglePlay}
            />

            {/* Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 mb-4 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / duration) * 100
                            }%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
                    }}
                />

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                        </button>

                        {/* Time */}
                        <span className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <FiVolume2 size={18} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Settings (placeholder) */}
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <FiSettings size={18} />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <FiMaximize size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
