'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    FiCheck, FiLock, FiChevronLeft, FiChevronRight, FiVideo, FiFileText,
    FiCheckSquare, FiAward, FiMessageCircle, FiBarChart2, FiArrowRight,
    FiPlay, FiAlertCircle, FiLoader, FiMenu, FiX, FiHome
} from 'react-icons/fi';
import QuizPlayer from '@/components/QuizPlayer';
import AdvancedVideoPlayer from '@/components/lessons/AdvancedVideoPlayer';
import LessonComments from '@/components/lessons/LessonComments';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    
    const [course, setCourse] = useState<any>(null);
    const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'quiz'; data: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }
    };

    const goToPrevItem = () => {
        if (!course || !activeItem) return;
        const flatLessons = (course.modules || []).flatMap((m: any) => m.lessons || []);
        const idx = flatLessons.findIndex((l: any) => l.id === activeItem.data?.id);
        if (idx > 0) {
            setActiveItem({ type: 'lesson', data: flatLessons[idx - 1] });
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-accent-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-accent-500 rounded-full animate-spin"></div>
                </div>
                <p className="mt-8 text-white/40 font-bold tracking-[0.2em] uppercase text-xs">جاري تجهيز بيئة التعلم</p>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-right" dir="rtl">
                <div className="max-w-md w-full p-10 bg-gray-900 border border-white/5 rounded-xl shadow-sm">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <FiLock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">الوصول مقيد</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">تحتاج للاشتراك في هذه الدورة لتتمكن من مشاهدة محتواها.</p>
                    <button onClick={() => router.push('/courses')} className="w-full py-4 bg-accent-600 hover:bg-accent-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3">
                        استكشف الدورات <FiArrowRight />
                    </button>
                </div>
            </div>
        );
    }

    const brandColor = (course?.user as any)?.brandColor || '#3b82f6';
    const modules: any[] = Array.isArray(course.modules) ? course.modules : [];
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedCount = modules.reduce((acc, m) => acc + (m.lessons || []).filter((l: any) => l.completed).length, 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const lesson = activeItem?.type === 'lesson' ? activeItem.data : null;

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col h-screen overflow-hidden text-right selection:bg-accent-500/30" dir="rtl">
            <style dangerouslySetInnerHTML={{
                __html: `
                .text-brand { color: ${brandColor} !important; }
                .bg-brand { background-color: ${brandColor} !important; }
                .border-brand { border-color: ${brandColor} !important; }
                `
            }} />

            {/* --- TOP HEADER (Mobile & Desktop) --- */}
            <header className="h-16 md:h-20 bg-gray-900/80  border-b border-white/5 px-4 md:px-8 flex items-center justify-between z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-xl active:scale-95 transition-all"
                    >
                        <FiMenu size={20} />
                    </button>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white">
                            <FiAward size={16} />
                        </div>
                        <h1 className="text-sm font-bold text-white truncate max-w-[200px] lg:max-w-sm">{course.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end gap-1.5 ml-4">
                        <div className="flex justify-between w-32 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <span>إنجازك</span>
                            <span className="text-blue-400">{progressPercent}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="w-10 h-10 md:w-auto md:px-5 md:h-11 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
                    >
                        <FiHome className="md:hidden" />
                        <span className="hidden md:block text-xs font-bold">الرئيسية</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                
                {/* --- SIDEBAR (Desktop & Mobile Drawer) --- */}
                <AnimatePresence>
                    {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                        <>
                            {/* Mobile Overlay */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden fixed inset-0 bg-black/80  z-40"
                            />
                            
                            <motion.aside 
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`fixed lg:relative top-0 right-0 h-full w-[300px] md:w-[350px] bg-gray-900 border-l border-white/5 z-50 flex flex-col shadow-sm lg:shadow-none`}
                            >
                                <div className="p-6 border-b border-white/5 flex items-center justify-between lg:hidden">
                                    <span className="font-bold text-white">محتوى الدورة</span>
                                    <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white">
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                    {modules.map((module: any) => (
                                        <div key={module.id} className="space-y-2">
                                            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{module.title}</h3>
                                            <div className="space-y-1">
                                                {(module.lessons || []).map((l: any, idx: number) => {
                                                    const isActive = activeItem?.data?.id === l.id;
                                                    return (
                                                        <button
                                                            key={l.id}
                                                            onClick={() => {
                                                                setActiveItem({ type: 'lesson', data: l });
                                                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                            }}
                                                            className={`w-full text-right p-3.5 rounded-2xl flex items-center gap-3 transition-all ${isActive ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/20' : 'hover:bg-white/5 text-gray-400'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold border transition-colors ${l.completed ? 'bg-accent-500 border-accent-500 text-white' : isActive ? 'bg-white/20 border-transparent text-white' : 'border-white/10 text-gray-500'}`}>
                                                                {l.completed ? <FiCheck size={12} strokeWidth={4} /> : idx + 1}
                                                            </div>
                                                            <span className="flex-1 text-xs font-bold truncate">{l.title}</span>
                                                            {(l.videoUrl || l.muxPlaybackId || l.bunnyVideoId) ? <FiVideo size={14} className="opacity-40" /> : <FiFileText size={14} className="opacity-40" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-white/5 hidden lg:block">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">دعم فني</p>
                                        <p className="text-xs text-gray-400">تواجه مشكلة؟ تواصل معنا عبر الوتساب.</p>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-950">
                    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
                        {activeItem ? (
                            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                
                                {/* Lesson Header */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-accent-500 font-bold text-[10px] uppercase tracking-widest">
                                            <FiBarChart2 />
                                            <span>الدرس النشط حالياً</span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                                            {activeItem.data.title}
                                        </h2>
                                    </div>
                                    <button 
                                        onClick={() => setShowComments(!showComments)}
                                        className={`flex items-center justify-center gap-2 h-12 px-6 rounded-2xl font-bold text-xs transition-all ${showComments ? 'bg-accent-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        <FiMessageCircle size={18} />
                                        <span>قسم النقاشات</span>
                                    </button>
                                </div>

                                {/* Video Player Card */}
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-accent-600/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-duration-500"></div>
                                    <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-xl border border-white/5 bg-gray-900 shadow-sm">
                                        {activeItem.type === 'lesson' ? (
                                            (activeItem.data.videoUrl || activeItem.data.bunnyVideoId) ? (
                                                <AdvancedVideoPlayer 
                                                    lessonId={activeItem.data.id} 
                                                    courseId={course.id} 
                                                    studentEmail={session?.user?.email || ''} 
                                                    onComplete={handleLessonComplete}
                                                />
                                            ) : (
                                                <div className="aspect-video flex flex-col items-center justify-center text-gray-600">
                                                    <FiFileText size={64} className="mb-4 opacity-20" />
                                                    <p className="font-bold text-sm uppercase tracking-widest">محتوى نصي فقط</p>
                                                </div>
                                            )
                                        ) : (
                                            <QuizPlayer quiz={activeItem.data} onComplete={handleQuizComplete} />
                                        )}
                                    </div>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button onClick={goToPrevItem} className="flex-1 sm:w-14 sm:h-14 sm:flex-none flex items-center justify-center h-14 bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
                                            <FiChevronRight size={24} />
                                        </button>
                                        <button onClick={goToNextItem} className="flex-1 sm:w-14 sm:h-14 sm:flex-none flex items-center justify-center h-14 bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
                                            <FiChevronLeft size={24} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleLessonComplete}
                                        className={`w-full sm:w-auto px-10 h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${lesson?.completed ? 'bg-accent-500 text-white' : 'bg-accent-500/10 text-accent-500 border border-accent-500/20 hover:bg-accent-500 hover:text-white'}`}
                                    >
                                        <FiCheckSquare size={20} />
                                        <span>{lesson?.completed ? 'تم إكمال الدرس ✓' : 'تحديد كمكتمل'}</span>
                                    </button>
                                </div>

                                {/* Lesson Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-white/5 flex-1"></div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">عن هذا الدرس</span>
                                        <div className="h-px bg-white/5 flex-1"></div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-6 md:p-10 rounded-xl text-gray-300 leading-relaxed font-medium">
                                        {activeItem.data.content ? (
                                            <div className="prose prose-invert max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: activeItem.data.content }} />
                                        ) : (
                                            <p className="text-center text-gray-600 py-10">لا يوجد وصف إضافي لهذا الدرس.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <AnimatePresence>
                                    {showComments && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                        >
                                            <LessonComments lessonId={activeItem.data.id} courseId={course.id} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        ) : (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-700 opacity-20">
                                <FiPlay size={100} strokeWidth={1} />
                                <p className="mt-6 font-bold text-2xl uppercase tracking-widest">اختر درساً للبدء</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* --- BOTTOM MOBILE CONTROLS --- */}
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80  border border-white/10 px-4 py-3 rounded-xl shadow-sm z-40">
                    <button onClick={goToPrevItem} className="w-10 h-10 flex items-center justify-center text-gray-400">
                        <FiChevronRight size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button 
                         onClick={() => setIsSidebarOpen(true)}
                         className="flex items-center gap-2 px-3 text-[10px] font-bold text-white uppercase tracking-widest"
                    >
                        <span>محتوى الدورة</span>
                        <div className="w-5 h-5 bg-accent-600 rounded-full flex items-center justify-center text-[8px]">{completedCount}/{totalLessons}</div>
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button onClick={goToNextItem} className="w-10 h-10 flex items-center justify-center text-gray-400">
                        <FiChevronLeft size={20} />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}
