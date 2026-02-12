'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlay, FiLock, FiCheck, FiClock, FiFileText } from 'react-icons/fi';
import VideoPlayer from '@/components/VideoPlayer';

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    title: string;
    videoDuration: number | null;
    isPublished: boolean;
    isFree: boolean;
    order: number;
    description?: string;
    content?: string;
    videoUrl?: string;
}

export default function LearnCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [modules, setModules] = useState<Module[]>([]);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/modules`);
            if (response.ok) {
                const data = await response.json();
                setModules(data);

                // Auto-select first lesson
                if (data.length > 0 && data[0].lessons.length > 0) {
                    loadLesson(data[0].lessons[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching course content:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLesson = async (lessonId: string) => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`);
            if (response.ok) {
                const data = await response.json();
                setCurrentLesson(data);
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
        }
    };

    const saveProgress = async (watchedDuration: number) => {
        if (!enrollmentId || !currentLesson) return;

        try {
            await fetch(`/api/lessons/${currentLesson.id}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId,
                    watchedDuration,
                }),
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const markComplete = async () => {
        if (!enrollmentId || !currentLesson) return;

        try {
            await fetch(`/api/lessons/${currentLesson.id}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId,
                    isCompleted: true,
                }),
            });
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="flex">
                {/* Video Player Area */}
                <div className="flex-1">
                    <div className="p-6">
                        {currentLesson?.videoUrl ? (
                            <VideoPlayer
                                videoUrl={currentLesson.videoUrl}
                                onProgress={saveProgress}
                                onComplete={markComplete}
                            />
                        ) : (
                            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                                <p className="text-gray-400">لا يوجد فيديو لهذا الدرس</p>
                            </div>
                        )}

                        {/* Lesson Info */}
                        <div className="mt-6 bg-gray-800 rounded-lg p-6">
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {currentLesson?.title || 'اختر درساً'}
                            </h1>
                            {currentLesson?.description && (
                                <p className="text-gray-400 mb-4">{currentLesson.description}</p>
                            )}

                            {/* Lesson Content */}
                            {currentLesson?.content && (
                                <div className="mt-6 prose prose-invert max-w-none">
                                    <div className="text-gray-300 whitespace-pre-wrap">
                                        {currentLesson.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Curriculum */}
                <div className="w-96 bg-gray-800 h-screen overflow-y-auto">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-lg font-bold text-white">محتوى الدورة</h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {modules.map((module, moduleIndex) => (
                            <div key={module.id} className="bg-gray-900 rounded-lg overflow-hidden">
                                <div className="p-4 bg-gray-700">
                                    <h3 className="font-semibold text-white">
                                        {moduleIndex + 1}. {module.title}
                                    </h3>
                                </div>

                                <div className="divide-y divide-gray-700">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => loadLesson(lesson.id)}
                                            className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${currentLesson?.id === lesson.id ? 'bg-gray-700' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">
                                                    {lesson.isFree ? (
                                                        <FiPlay className="text-green-400" size={18} />
                                                    ) : (
                                                        <FiLock className="text-gray-500" size={18} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {lessonIndex + 1}. {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <FiClock className="text-gray-400" size={12} />
                                                        <span className="text-xs text-gray-400">
                                                            {formatDuration(lesson.videoDuration)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
