'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    FiCheck, FiLock, FiChevronLeft, FiChevronRight, FiVideo, FiFileText,
    FiCheckSquare, FiAward, FiMessageCircle, FiBarChart2, FiArrowRight,
    FiPlay, FiAlertCircle, FiLoader
} from 'react-icons/fi';
import QuizPlayer from '@/components/QuizPlayer';
import AdvancedVideoPlayer from '@/components/lessons/AdvancedVideoPlayer';
import LessonComments from '@/components/lessons/LessonComments';

export default function LearnPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const [course, setCourse] = useState<any>(null);
    const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'quiz'; data: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // ✅ ALL hooks must be at the top — before any early returns
    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchCourse();
        } else if (sessionStatus === 'unauthenticated') {
            setLoading(false);
        }
    }, [sessionStatus, params.slug]);

    // Anti-Piracy: Disable Right Click & developer shortcuts
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
            }
        };
        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${params.slug}/content`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data);
                setHasAccess(data.isEnrolled || false);
                if (data.modules?.[0]?.lessons?.[0]) {
                    setActiveItem({ type: 'lesson', data: data.modules[0].lessons[0] });
                }
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToNextItem = () => {
        if (!course || !activeItem) return;
        const flatLessons = (course.modules || []).flatMap((m: any) => m.lessons || []);
        const idx = flatLessons.findIndex((l: any) => l.id === activeItem.data?.id);
        if (idx !== -1 && idx < flatLessons.length - 1) {
            setActiveItem({ type: 'lesson', data: flatLessons[idx + 1] });
        }
    };

    const goToPrevItem = () => {
        if (!course || !activeItem) return;
        const flatLessons = (course.modules || []).flatMap((m: any) => m.lessons || []);
        const idx = flatLessons.findIndex((l: any) => l.id === activeItem.data?.id);
        if (idx > 0) {
            setActiveItem({ type: 'lesson', data: flatLessons[idx - 1] });
        }
    };

    const handleLessonComplete = async () => {
        if (!activeItem || activeItem.type !== 'lesson') return;
        try {
            await fetch('/api/progress/mark-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course?.id, lessonId: activeItem.data?.id }),
            });
            setCourse((prev: any) => ({
                ...prev,
                modules: (prev?.modules || []).map((m: any) => ({
                    ...m,
                    lessons: (m.lessons || []).map((l: any) =>
                        l.id === activeItem.data?.id ? { ...l, completed: true } : l
                    ),
                })),
            }));
            goToNextItem();
        } catch (error) {
            console.error('Error marking complete:', error);
        }
    };

    const handleQuizComplete = (score: number, isPassed: boolean) => {
        // handle quiz completion
    };

    // ─── Early returns AFTER all hooks ───────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <p className="text-white/60 font-black tracking-widest uppercase">جاري تجهيز بيئة التعلم...</p>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center p-12 bg-gray-900 border border-white/5 rounded-3xl shadow-2xl">
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <FiLock size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">الوصول مقيد 🔒</h2>
                    <p className="text-gray-400 mb-10 leading-relaxed">يبدو أنك لا تمتلك صلاحية لهذا المحتوى.</p>
                    <button
                        onClick={() => window.location.href = '/courses'}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3"
                    >
                        استكشف الدورات <FiArrowRight />
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6">
                <FiAlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black mb-2">الدورة غير متوفرة</h2>
                <p className="text-gray-400 mb-8">عذراً، لم نتمكن من العثور على محتوى هذه الدورة.</p>
                <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3 bg-blue-600 rounded-xl font-bold">
                    العودة للوحة التحكم
                </button>
            </div>
        );
    }

    // ─── Derived data (after guards) ─────────────────────────────
    const brandColor = (course?.user as any)?.brandColor || '#0ea5e9';
    const courseUserName = (course?.user as any)?.name || 'المدرب';
    const modules: any[] = Array.isArray(course.modules) ? course.modules : [];
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedCount = modules.reduce((acc, m) => acc + (m.lessons || []).filter((l: any) => l.completed).length, 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // ─── Main content renderer ────────────────────────────────────
    const renderContent = () => {
        if (!activeItem) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6 py-40 opacity-50">
                    <FiPlay size={80} className="animate-pulse" />
                    <p className="text-2xl font-black uppercase tracking-widest text-center">
                        اختر درساً للبدء
                        <br />
                        <span className="text-sm font-bold opacity-60">جميع الدروس تظهر في القائمة الجانبية</span>
                    </p>
                </div>
            );
        }

        if (activeItem.type === 'quiz') {
            return (
                <div className="py-12 flex justify-center">
                    <div className="w-full max-w-4xl">
                        <QuizPlayer quiz={activeItem.data} onComplete={handleQuizComplete} />
                    </div>
                </div>
            );
        }

        // Lesson view
        const lesson = activeItem.data || {};
        const hasVideo = !!(lesson.videoUrl || lesson.muxPlaybackId || lesson.bunnyVideoId);

        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <div>
                        <p className="text-blue-400 font-black text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                            <FiBarChart2 /> الدرس النشط
                        </p>
                        <h1 className="text-3xl font-black text-white">{lesson.title || 'درس'}</h1>
                    </div>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all ${showComments ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <FiMessageCircle size={20} /> الأسئلة والنقاشات
                    </button>
                </div>

                {hasVideo ? (
                    <AdvancedVideoPlayer
                        lessonId={lesson.id}
                        courseId={course.id}
                        studentEmail={session?.user?.email || ''}
                        onComplete={handleLessonComplete}
                    />
                ) : (
                    <div className="aspect-video w-full bg-gray-900 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-gray-500">
                        <FiFileText size={48} className="mb-4" />
                        <p className="text-xl font-black">محتوى نصي فقط</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-3">
                        <button onClick={goToPrevItem} className="h-14 w-14 rounded-2xl border border-white/10 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white/50 hover:text-white transition-all">
                            <FiChevronRight size={24} />
                        </button>
                        <button onClick={goToNextItem} className="h-14 w-14 rounded-2xl border border-white/10 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white/50 hover:text-white transition-all">
                            <FiChevronLeft size={24} />
                        </button>
                    </div>
                    <button
                        onClick={handleLessonComplete}
                        className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${lesson.completed ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white'}`}
                    >
                        <FiCheckSquare size={22} />
                        {lesson.completed ? 'مكتمل ✓' : 'إتمام الدرس'}
                    </button>
                </div>

                {(lesson.content || lesson.description) && (
                    <div className="bg-gray-900 rounded-3xl p-8 border border-white/5">
                        <div
                            className="prose prose-invert max-w-none text-gray-300"
                            dangerouslySetInnerHTML={{ __html: lesson.content || lesson.description || '' }}
                        />
                    </div>
                )}

                {showComments && (
                    <LessonComments lessonId={lesson.id} courseId={course.id} />
                )}
            </div>
        );
    };

    // ─── Main render ─────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row h-screen overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                .text-brand { color: ${brandColor} !important; }
                .bg-brand { background-color: ${brandColor} !important; }
                `
            }} />

            {/* Sidebar */}
            <div className="w-full md:w-[360px] bg-gray-900 border-l border-white/5 flex flex-col h-full z-20 shrink-0">
                {/* Course info & progress */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                            <FiAward size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-black text-white text-sm line-clamp-2 leading-snug">{course.title || 'دورة'}</h2>
                            <p className="text-gray-500 text-xs mt-0.5">بإشراف: <span className="text-blue-400">{courseUserName}</span></p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 font-bold">
                            <span>{completedCount} / {totalLessons} درس</span>
                            <span className="text-blue-400">{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>

                {/* Lessons list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {modules.length === 0 ? (
                        <div className="py-16 text-center">
                            <FiLoader size={28} className="mx-auto text-gray-600 mb-3" />
                            <p className="text-gray-500 text-xs font-bold">لا توجد دروس منشورة حالياً</p>
                        </div>
                    ) : (
                        modules.map((module: any) => (
                            <div key={module.id}>
                                <p className="px-3 py-2 text-xs font-black text-gray-500 uppercase tracking-widest">{module.title}</p>
                                <div className="space-y-1">
                                    {(module.lessons || []).map((lesson: any, idx: number) => {
                                        const isActive = activeItem?.type === 'lesson' && activeItem.data?.id === lesson.id;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setActiveItem({ type: 'lesson', data: lesson })}
                                                className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-all ${isActive ? 'bg-blue-500/15 border border-blue-500/25 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center border text-xs font-black ${lesson.completed ? 'bg-green-500 border-green-500 text-white' : 'border-white/10 text-gray-500'}`}>
                                                    {lesson.completed ? <FiCheck size={12} strokeWidth={3} /> : idx + 1}
                                                </div>
                                                <span className="text-sm font-bold flex-1 truncate">{lesson.title}</span>
                                                {(lesson.videoUrl || lesson.muxPlaybackId || lesson.bunnyVideoId)
                                                    ? <FiVideo size={14} className="opacity-40 shrink-0" />
                                                    : <FiFileText size={14} className="opacity-40 shrink-0" />
                                                }
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Back button */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-black transition-all uppercase tracking-widest"
                    >
                        العودة للوحة التحكم
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-full bg-gray-950 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </main>

                {/* Bottom bar */}
                <div className="h-16 bg-gray-900 border-t border-white/5 px-6 flex items-center justify-between shrink-0">
                    <span className="text-xs text-gray-600 font-bold">مدعوم من تمالين</span>
                    <div className="flex gap-2">
                        <button onClick={goToPrevItem} className="h-10 w-10 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
                            <FiChevronRight size={18} />
                        </button>
                        <button onClick={goToNextItem} className="h-10 w-10 rounded-lg border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
                            <FiChevronLeft size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
