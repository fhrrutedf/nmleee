'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiCheck, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string;
    content?: string;
    order: number;
    completed?: boolean;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [course, setCourse] = useState<Course | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        if (session) {
            checkAccess();
            fetchCourse();
        } else {
            router.push('/login');
        }
    }, [session, params.slug]);

    const checkAccess = async () => {
        try {
            const response = await fetch(`/api/courses/${params.slug}/access`);
            setHasAccess(response.ok);
        } catch (error) {
            console.error('Error:', error);
            setHasAccess(false);
        }
    };

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${params.slug}/content`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
                // Set first lesson
                if (data.modules?.[0]?.lessons?.[0]) {
                    setCurrentLesson(data.modules[0].lessons[0]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async (lessonId: string) => {
        try {
            await fetch('/api/progress/mark-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course?.id,
                    lessonId,
                }),
            });

            // Update local state
            if (course) {
                const updatedModules = course.modules.map((module) => ({
                    ...module,
                    lessons: module.lessons.map((lesson) =>
                        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
                    ),
                }));
                setCourse({ ...course, modules: updatedModules });
            }
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const goToNextLesson = () => {
        if (!course || !currentLesson) return;

        let found = false;
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (found) {
                    setCurrentLesson(lesson);
                    return;
                }
                if (lesson.id === currentLesson.id) {
                    found = true;
                }
            }
        }
    };

    const goToPreviousLesson = () => {
        if (!course || !currentLesson) return;

        let previous: Lesson | null = null;
        for (const module of course.modules) {
            for (const lesson of module.lessons) {
                if (lesson.id === currentLesson.id && previous) {
                    setCurrentLesson(previous);
                    return;
                }
                previous = lesson;
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiLock size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ليس لديك صلاحية للوصول
                    </h2>
                    <p className="text-gray-600 mb-6">يجب شراء الكورس أولاً</p>
                    <button
                        onClick={() => router.push(`/courses/${params.slug}`)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        عرض الكورس
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-12">الكورس غير موجود</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <div className="w-80 bg-white overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900 text-lg">{course.title}</h2>
                </div>

                <div className="p-4">
                    {course.modules.map((module) => (
                        <div key={module.id} className="mb-4">
                            <h3 className="font-bold text-gray-900 mb-2">{module.title}</h3>
                            <div className="space-y-1">
                                {module.lessons.map((lesson) => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-2 ${currentLesson?.id === lesson.id
                                                ? 'bg-indigo-100 text-indigo-900'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {lesson.completed ? (
                                            <FiCheck className="text-green-600 flex-shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                        )}
                                        <span className="text-sm flex-1 truncate">{lesson.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Video Player */}
                <div className="bg-black">
                    {currentLesson?.videoUrl ? (
                        <video
                            key={currentLesson.id}
                            controls
                            className="w-full"
                            style={{ maxHeight: '70vh' }}
                            onEnded={() => markComplete(currentLesson.id)}
                        >
                            <source src={currentLesson.videoUrl} type="video/mp4" />
                            المتصفح لا يدعم تشغيل الفيديو
                        </video>
                    ) : (
                        <div className="h-96 flex items-center justify-center text-gray-500">
                            لا يوجد فيديو لهذا الدرس
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="bg-white p-6 flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {currentLesson?.title}
                        </h1>

                        {currentLesson?.content && (
                            <div className="prose max-w-none mb-6">
                                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                            </div>
                        )}

                        {/* Mark Complete */}
                        {!currentLesson?.completed && (
                            <button
                                onClick={() => currentLesson && markComplete(currentLesson.id)}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <FiCheck />
                                وضع علامة مكتمل
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white border-t p-4 flex justify-between">
                    <button
                        onClick={goToPreviousLesson}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                        <FiChevronRight />
                        الدرس السابق
                    </button>
                    <button
                        onClick={goToNextLesson}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        الدرس التالي
                        <FiChevronLeft />
                    </button>
                </div>
            </div>
        </div>
    );
}
