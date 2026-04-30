'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    FiCheck, FiLock, FiChevronLeft, FiChevronRight, FiVideo, FiFileText,
    FiCheckSquare, FiAward, FiMessageCircle, FiArrowRight,
    FiPlay, FiMenu, FiX, FiHome, FiBook, FiZap
} from 'react-icons/fi';
import QuizPlayer from '@/components/QuizPlayer';
import AdvancedVideoPlayer from '@/components/lessons/AdvancedVideoPlayer';
import LessonComments from '@/components/lessons/LessonComments';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    const [course, setCourse] = useState<any>(null);
    const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'quiz'; data: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (sessionStatus === 'authenticated') fetchCourse();
        else if (sessionStatus === 'unauthenticated') setLoading(false);
    }, [sessionStatus, params.slug]);

    // Anti-Piracy
    useEffect(() => {
        const prevent = (e: MouseEvent) => e.preventDefault();
        const keys = (e: KeyboardEvent) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) e.preventDefault();
        };
        window.addEventListener('contextmenu', prevent);
        window.addEventListener('keydown', keys);
        return () => { window.removeEventListener('contextmenu', prevent); window.removeEventListener('keydown', keys); };
    }, []);

    const fetchCourse = async () => {
        try {
            const data = await apiGet(`/api/courses/${params.slug}/content`);
            setCourse(data);
            setHasAccess(data.isEnrolled || false);
            if (data.modules?.[0]?.lessons?.[0]) setActiveItem({ type: 'lesson', data: data.modules[0].lessons[0] });
        } catch (error: any) {
            if (error?.status === 403 || error?.status === 401) {
                setHasAccess(false);
            } else if (error?.status === 404) {
                setNotFound(true);
            }
        } finally { setLoading(false); }
    };

    const flatLessons = () => (course?.modules || []).flatMap((m: any) => m.lessons || []);

    const goToNextItem = () => {
        const all = flatLessons();
        const idx = all.findIndex((l: any) => l.id === activeItem?.data?.id);
        if (idx !== -1 && idx < all.length - 1) { setActiveItem({ type: 'lesson', data: all[idx + 1] }); setIsSidebarOpen(false); }
    };

    const goToPrevItem = () => {
        const all = flatLessons();
        const idx = all.findIndex((l: any) => l.id === activeItem?.data?.id);
        if (idx > 0) { setActiveItem({ type: 'lesson', data: all[idx - 1] }); setIsSidebarOpen(false); }
    };

    const handleLessonComplete = async () => {
        if (!activeItem || activeItem.type !== 'lesson') return;
        try {
            await apiPost('/api/progress/mark-complete', { courseId: course?.id, lessonId: activeItem.data?.id });
            setCourse((prev: any) => ({
                ...prev,
                modules: (prev?.modules || []).map((m: any) => ({
                    ...m,
                    lessons: (m.lessons || []).map((l: any) => l.id === activeItem.data?.id ? { ...l, completed: true } : l),
                })),
            }));
            goToNextItem();
        } catch {}
    };

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#080810]">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/20" />
                <div className="absolute inset-0 rounded-2xl border-2 border-t-emerald-400 animate-spin" />
                <div className="absolute inset-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <FiPlay size={20} className="text-emerald-400 ml-0.5" />
                </div>
            </div>
            <p className="text-white/30 font-bold tracking-[0.3em] uppercase text-[10px]">جاري تجهيز بيئة التعلم</p>
        </div>
    );

    // ── 404 Not Found ──
    if (notFound) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6" dir="rtl">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto border border-orange-500/20">
                    <span className="text-4xl">🔍</span>
                </div>
                <div>
                    <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-3">خطأ 404</p>
                    <h2 className="text-3xl font-bold text-white mb-3">الدورة غير موجودة</h2>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        هذه الدورة لم تعد موجودة أو تم حذفها.<br/>
                        يمكنك الذهاب للوحة التحكم لاختيار دوراتك المسجّل بها.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={() => router.push('/dashboard')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                        لوحة التحكم <FiArrowRight />
                    </button>
                    <button onClick={() => router.push('/courses')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-bold transition-all border border-white/10">
                        استكشاف الدورات
                    </button>
                </div>
            </div>
        </div>
    );

    // ── No Access ──
    if (!hasAccess) return (
        <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6" dir="rtl">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                    <FiLock size={40} className="text-red-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-3">الوصول مقيد</h2>
                    <p className="text-gray-400 leading-relaxed">تحتاج للاشتراك في هذه الدورة لتتمكن من مشاهدة محتواها.</p>
                </div>
                <button onClick={() => router.push('/courses')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20">
                    استكشف الدورات <FiArrowRight />
                </button>
            </div>
        </div>
    );


    const modules: any[] = Array.isArray(course?.modules) ? course.modules : [];
    const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
    const completedCount = modules.reduce((a, m) => a + (m.lessons || []).filter((l: any) => l.completed).length, 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const lesson = activeItem?.type === 'lesson' ? activeItem.data : null;
    const allFlat = flatLessons();
    const currentIdx = allFlat.findIndex((l: any) => l.id === activeItem?.data?.id);
    const isFirst = currentIdx <= 0;
    const isLast  = currentIdx >= allFlat.length - 1;

    return (
        <div className="min-h-screen bg-[#080810] flex flex-col h-screen overflow-hidden text-right" dir="rtl">

            {/* ─── TOPBAR ─── */}
            <header className="h-16 bg-[#0D0D1A]/95 backdrop-blur border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between z-30 shrink-0 shadow-lg shadow-black/40">
                {/* Right: Menu + Title */}
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95">
                        <FiMenu size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <FiAward size={16} className="text-white" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">بيئة التعلم</p>
                            <h1 className="text-sm font-bold text-white truncate max-w-[220px] lg:max-w-sm leading-tight">{course?.title}</h1>
                        </div>
                    </div>
                </div>

                {/* Left: Progress + Home */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.06]">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">تقدمك</p>
                            <p className="text-sm font-bold text-emerald-400">{progressPercent}%</p>
                        </div>
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{completedCount}/{totalLessons}</span>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="w-10 h-10 flex items-center justify-center bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/[0.06]">
                        <FiHome size={16} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">

                {/* ─── SIDEBAR ─── */}
                <AnimatePresence>
                    {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />

                            <motion.aside
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                                className="fixed lg:relative top-0 right-0 h-full w-[300px] md:w-[320px] bg-[#0D0D1A] border-l border-white/[0.06] z-50 flex flex-col shadow-2xl"
                            >
                                {/* Sidebar Header */}
                                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FiBook size={16} className="text-emerald-400" />
                                        <span className="font-bold text-white text-sm">محتوى الدورة</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">{completedCount}/{totalLessons}</span>
                                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 rounded-lg transition-all">
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar inside sidebar */}
                                <div className="px-5 py-3 border-b border-white/[0.04]">
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>

                                {/* Modules List */}
                                <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
                                    {modules.map((module: any, mi: number) => (
                                        <div key={module.id}>
                                            <h3 className="px-5 pb-2 text-[9px] font-bold text-gray-600 uppercase tracking-[0.25em] flex items-center gap-2">
                                                <span className="w-4 h-px bg-gray-700 block" />
                                                {module.title}
                                            </h3>
                                            <div className="px-3 space-y-0.5">
                                                {(module.lessons || []).map((l: any, idx: number) => {
                                                    const isActive = activeItem?.data?.id === l.id;
                                                    const hasVideo = l.videoUrl || l.muxPlaybackId || l.bunnyVideoId || l.imagekitFileId;
                                                    return (
                                                        <button key={l.id}
                                                            onClick={() => { setActiveItem({ type: 'lesson', data: l }); setIsSidebarOpen(false); }}
                                                            className={`w-full text-right px-3 py-3 rounded-xl flex items-center gap-3 transition-all group ${isActive ? 'bg-emerald-500/15 border border-emerald-500/20' : 'hover:bg-white/[0.04] border border-transparent'}`}
                                                        >
                                                            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold transition-all ${l.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500 border border-white/10 group-hover:border-white/20'}`}>
                                                                {l.completed ? <FiCheck size={12} strokeWidth={3} /> : idx + 1}
                                                            </div>
                                                            <span className={`flex-1 text-xs font-semibold truncate leading-snug ${isActive ? 'text-emerald-300' : l.completed ? 'text-gray-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                                {l.title}
                                                            </span>
                                                            {hasVideo
                                                                ? <FiVideo size={12} className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-600'}`} />
                                                                : <FiFileText size={12} className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-600'}`} />
                                                            }
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Sidebar Footer */}
                                {progressPercent === 100 && (
                                    <div className="p-4 border-t border-white/[0.06]">
                                        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                            <FiAward size={24} className="text-emerald-400 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-emerald-400">أكملت الدورة! 🎉</p>
                                        </div>
                                    </div>
                                )}
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* ─── MAIN CONTENT ─── */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#080810]">
                    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
                        {activeItem ? (
                            <motion.div key={activeItem.data.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 md:space-y-8">

                                {/* Breadcrumb */}
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    <FiZap size={12} className="text-emerald-500" />
                                    <span>الدرس الحالي</span>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-gray-500">{currentIdx + 1} / {allFlat.length}</span>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {activeItem.data.title}
                                </h2>

                                {/* Video Player */}
                                <div className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/60 bg-black">
                                    {activeItem.type === 'lesson' ? (
                                        (activeItem.data.videoUrl || activeItem.data.bunnyVideoId || activeItem.data.imagekitFileId) ? (
                                            <AdvancedVideoPlayer
                                                lessonId={activeItem.data.id}
                                                courseId={course.id}
                                                studentEmail={session?.user?.email || ''}
                                                onComplete={handleLessonComplete}
                                            />
                                        ) : (
                                            <div className="aspect-video flex flex-col items-center justify-center text-gray-600">
                                                <FiFileText size={48} className="mb-3 opacity-30" />
                                                <p className="font-bold text-sm text-gray-500">محتوى نصي فقط</p>
                                            </div>
                                        )
                                    ) : (
                                        <QuizPlayer quiz={activeItem.data} onComplete={() => {}} />
                                    )}
                                </div>

                                {/* Action Bar */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    {/* Navigation */}
                                    <div className="flex gap-2">
                                        <button onClick={goToPrevItem} disabled={isFirst} className="flex-1 sm:flex-none w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                            <FiChevronRight size={20} />
                                        </button>
                                        <button onClick={goToNextItem} disabled={isLast} className="flex-1 sm:flex-none w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                            <FiChevronLeft size={20} />
                                        </button>
                                    </div>

                                    {/* Mark Complete */}
                                    <button onClick={handleLessonComplete} className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm ${lesson?.completed ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'}`}>
                                        <FiCheckSquare size={18} />
                                        {lesson?.completed ? 'تم الإكمال ✓' : 'تحديد كمكتمل'}
                                    </button>

                                    {/* Comments Toggle */}
                                    <button onClick={() => setShowComments(!showComments)} className={`h-12 px-5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm border ${showComments ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-white/[0.04] text-gray-400 border-white/10 hover:text-white hover:border-white/20'}`}>
                                        <FiMessageCircle size={18} />
                                        <span className="hidden sm:inline">النقاشات</span>
                                    </button>
                                </div>

                                {/* Lesson Content */}
                                {activeItem.data.content && (
                                    <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 md:p-8">
                                        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
                                            <FiBook size={14} className="text-emerald-400" />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ملاحظات الدرس</span>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-gray-300" dangerouslySetInnerHTML={{ __html: activeItem.data.content }} />
                                    </div>
                                )}

                                {/* Comments */}
                                <AnimatePresence>
                                    {showComments && (
                                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
                                            <LessonComments lessonId={activeItem.data.id} courseId={course.id} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </motion.div>
                        ) : (
                            <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                                    <FiPlay size={40} className="text-emerald-400 ml-1" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">اختر درساً للبدء</h3>
                                    <p className="text-gray-500 text-sm">اختر من القائمة على اليمين لبدء رحلتك التعليمية</p>
                                </div>
                                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2">
                                    <FiBook size={16} /> عرض محتوى الدورة
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D1A]/95 backdrop-blur border-t border-white/[0.06] px-4 py-3 flex items-center justify-between z-40">
                <button onClick={goToPrevItem} disabled={isFirst} className="w-11 h-11 flex items-center justify-center text-gray-400 disabled:opacity-30 active:scale-90 transition-all">
                    <FiChevronRight size={22} />
                </button>
                <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.06] rounded-xl border border-white/10 transition-all active:scale-95">
                    <FiBook size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">المحتوى</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{completedCount}/{totalLessons}</span>
                </button>
                <button onClick={goToNextItem} disabled={isLast} className="w-11 h-11 flex items-center justify-center text-gray-400 disabled:opacity-30 active:scale-90 transition-all">
                    <FiChevronLeft size={22} />
                </button>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
            `}</style>
        </div>
    );
}
