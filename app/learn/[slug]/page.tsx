'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiCheck, FiLock, FiChevronLeft, FiChevronRight, FiVideo, FiFileText, FiCheckSquare, FiAward, FiDownload } from 'react-icons/fi';
import QuizPlayer from '@/components/QuizPlayer';

interface Quiz {
    id: string;
    title: string;
    passingScore: number;
    timeLimit?: number;
    questions: any[];
}

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string;
    content?: string;
    order: number;
    completed?: boolean;
    quizzes?: Quiz[];
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    zoomLink?: string;
    meetLink?: string;
    modules: Module[];
    isEnrolled: boolean;
    certificate?: any;
    user: {
        brandColor?: string;
        name?: string;
        username?: string;
    };
}

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'quiz', data: Lesson | Quiz } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        if (session) {
            fetchCourse();
        }
    }, [session, params.slug]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${params.slug}/content`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
                setHasAccess(data.isEnrolled || false); // API now returns enrollment status

                // Set initial active item
                if (data.modules?.[0]?.lessons?.[0]) {
                    setActiveItem({ type: 'lesson', data: data.modules[0].lessons[0] });
                }
            } else {
                setHasAccess(false);
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

            // Update local state is tricky without re-fetching, simplest is to mark current lesson as completed
            if (course) {
                const updatedModules = course.modules.map((module) => ({
                    ...module,
                    lessons: module.lessons.map((lesson) =>
                        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
                    ),
                }));
                // Don't overwrite the whole course, just modules
                setCourse(prev => prev ? ({ ...prev, modules: updatedModules }) : null);
            }
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const handleQuizComplete = (score: number, isPassed: boolean) => {
        // Refresh to maybe unlock certificate or show progress
        if (isPassed) {
            alert(`أحسنت! لقد اجتزت الاختبار بنتيجة ${score.toFixed(1)}%`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!hasAccess && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <FiLock size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ليس لديك صلاحية للوصول
                    </h2>
                    <p className="text-gray-600 mb-6">يجب شراء الكورس أولاً لمشاهدة المحتوى</p>
                    <button
                        onClick={() => router.push(`/courses`)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        استعراض الكورسات
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-12">الكورس غير موجود</div>;
    }

    const effectiveBrandColor = course.user?.brandColor;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row h-screen overflow-hidden">
            {effectiveBrandColor && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .text-indigo-600, .text-indigo-700 { color: ${effectiveBrandColor} !important; }
                    .bg-indigo-600, .bg-indigo-500 { background-color: ${effectiveBrandColor} !important; }
                    .bg-indigo-50 { background-color: ${effectiveBrandColor}15 !important; }
                    .border-indigo-600, .border-indigo-500 { border-color: ${effectiveBrandColor} !important; }
                    .hover\\:bg-indigo-700:hover { background-color: ${effectiveBrandColor}cc !important; }
                    `
                }} />
            )}
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-white border-l overflow-y-auto flex-shrink-0 z-10">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-900 leading-tight mb-2">{course.title}</h2>

                    {/* External Links */}
                    <div className="flex flex-col gap-2 mt-3">
                        {course.zoomLink && (
                            <a href={course.zoomLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                <FiVideo /> رابط Zoom المباشر
                            </a>
                        )}
                        {course.meetLink && (
                            <a href={course.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-orange-600 hover:underline">
                                <FiVideo /> رابط Google Meet
                            </a>
                        )}
                        {course.certificate && (
                            <a href={`/certificates/${course.certificate.id}`} target="_blank" className="flex items-center gap-2 text-xs text-green-600 hover:underline font-bold">
                                <FiAward /> تحميل الشهادة
                            </a>
                        )}
                    </div>
                </div>

                <div className="p-2">
                    {course.modules.map((module, mIdx) => (
                        <div key={module.id} className="mb-4">
                            <h3 className="px-2 font-bold text-gray-700 text-sm mb-2 uppercase tracking-wider">
                                {module.title}
                            </h3>
                            <div className="space-y-1">
                                {module.lessons.map((lesson, lIdx) => (
                                    <div key={lesson.id}>
                                        {/* Lesson Item */}
                                        <button
                                            onClick={() => setActiveItem({ type: 'lesson', data: lesson })}
                                            className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3 ${activeItem?.data.id === lesson.id && activeItem.type === 'lesson'
                                                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {lesson.completed ? (
                                                <FiCheck className="text-green-500 flex-shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                            )}
                                            <span className="text-sm font-medium flex-1 truncate">
                                                {mIdx + 1}.{lIdx + 1} {lesson.title}
                                            </span>
                                            {lesson.videoUrl ? <FiVideo size={14} className="opacity-50" /> : <FiFileText size={14} className="opacity-50" />}
                                        </button>

                                        {/* Nested Quizzes */}
                                        {lesson.quizzes?.map((quiz) => (
                                            <button
                                                key={quiz.id}
                                                onClick={() => setActiveItem({ type: 'quiz', data: quiz })}
                                                className={`w-full text-right p-2 pr-8 rounded-lg transition-colors flex items-center gap-2 mt-1 ${activeItem?.data.id === quiz.id && activeItem.type === 'quiz'
                                                        ? 'bg-purple-50 text-purple-700'
                                                        : 'hover:bg-gray-50 text-gray-600'
                                                    }`}
                                            >
                                                <FiCheckSquare size={14} className="flex-shrink-0" />
                                                <span className="text-xs">{quiz.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
                {activeItem?.type === 'lesson' ? (
                    <>
                        {/* Video Player */}
                        <div className="bg-black flex-shrink-0 relative">
                            {/* Aspect Ratio 16:9 Container */}
                            <div className="aspect-video w-full max-h-[60vh] flex items-center justify-center bg-black">
                                {(activeItem.data as Lesson).videoUrl ? (
                                    <video
                                        key={activeItem.data.id}
                                        controls
                                        className="w-full h-full object-contain"
                                        onEnded={() => markComplete(activeItem.data.id)}
                                        src={(activeItem.data as Lesson).videoUrl}
                                    >
                                        المتصفح لا يدعم تشغيل الفيديو
                                    </video>
                                ) : (
                                    <div className="text-gray-500 flex flex-col items-center">
                                        <FiFileText size={48} className="mb-2" />
                                        <p>هذا الدرس نصي فقط</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content & Desc */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {(activeItem.data as Lesson).title}
                                    </h1>
                                    {!(Boolean((activeItem.data as Lesson).completed)) && (
                                        <button
                                            onClick={() => markComplete(activeItem.data.id)}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiCheck /> اكتمال
                                        </button>
                                    )}
                                </div>

                                {(activeItem.data as Lesson).content && (
                                    <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: (activeItem.data as Lesson).content || '' }} />
                                )}
                            </div>
                        </div>
                    </>
                ) : activeItem?.type === 'quiz' ? (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100 flex items-center justify-center">
                        <div className="w-full max-w-3xl">
                            <QuizPlayer
                                quiz={activeItem.data as Quiz}
                                onComplete={handleQuizComplete}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        اختر درساً للبدء
                    </div>
                )}
            {/* Simple Footer Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <p className="text-gray-400 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    مدعوم من منصة تقانة
                </p>
            </div>
        </div>
    );
}
