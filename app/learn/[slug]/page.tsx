'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiCheck, FiLock, FiChevronLeft, FiChevronRight, FiVideo, FiFileText, FiCheckSquare, FiAward, FiDownload, FiMessageCircle, FiBarChart2, FiArrowRight, FiPlay, FiAlertCircle, FiLoader } from 'react-icons/fi';
import QuizPlayer from '@/components/QuizPlayer';
import AdvancedVideoPlayer from '@/components/lessons/AdvancedVideoPlayer';
import LessonComments from '@/components/lessons/LessonComments';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const [course, setCourse] = useState<any>(null);
    const [activeItem, setActiveItem] = useState<{ type: 'lesson' | 'quiz', data: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchCourse();
        } else if (sessionStatus === 'unauthenticated') {
            setLoading(false);
            // window.location.href = `/login?callbackUrl=/learn/${params.slug}`;
        }
    }, [sessionStatus, params.slug]);

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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const goToNextItem = () => {
        if (!course || !activeItem) return;
        const flatLessons = (course.modules || []).flatMap((m: any) => m.lessons || []);
        const currentIndex = flatLessons.findIndex((l: any) => l.id === activeItem.data.id);
        if (currentIndex !== -1 && currentIndex < flatLessons.length - 1) {
            setActiveItem({ type: 'lesson', data: flatLessons[currentIndex + 1] });
        }
    };

    const goToPrevItem = () => {
        if (!course || !activeItem) return;
        const flatLessons = (course.modules || []).flatMap((m: any) => m.lessons || []);
        const currentIndex = flatLessons.findIndex((l: any) => l.id === activeItem.data.id);
        if (currentIndex > 0) {
            setActiveItem({ type: 'lesson', data: flatLessons[currentIndex - 1] });
        }
    };

    const handleLessonComplete = async () => {
        if (!activeItem || activeItem.type !== 'lesson') return;

        try {
            await fetch('/api/progress/mark-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course?.id,
                    lessonId: activeItem.data.id,
                }),
            });

            // Update local state
            setCourse((prev: any) => ({
                ...prev,
                modules: (prev.modules || []).map((m: any) => ({
                    ...m,
                    lessons: (m.lessons || []).map((l: any) => 
                        l.id === activeItem.data.id ? { ...l, completed: true } : l
                    )
                }))
            }));
            
            // Advance to next lesson smoothly
            goToNextItem();
            
        } catch (error) {
            console.error('Error marking lesson complete:', error);
        }
    };

    const handleQuizComplete = (score: number, isPassed: boolean) => {
        if (isPassed) {
            // alert(`أحسنت! لقد اجتزت الاختبار بنتيجة ${score.toFixed(1)}%`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-4 border-action-blue/20 border-t-action-blue rounded-full animate-spin mb-6"></div>
                <p className="text-white/60 font-black tracking-widest uppercase">جاري تجهيز بيئة التعلم...</p>
            </div>
        );
    }

    useEffect(() => {
        // Anti-Piracy: Disable Right Click & Keyboard Shortcuts
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
            if (
                e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
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

    if (!hasAccess && !loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center p-12 bg-gray-900 border border-white/5 rounded-[40px] shadow-2xl backdrop-blur-xl">
                    <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                         <FiLock size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">
                        الوصول مقيد 🔒
                    </h2>
                    <p className="text-gray-400 mb-10 leading-relaxed font-medium">يبدو أنك لا تمتلك صلاحية لهذا المحتوى. اشتراكك يمنحك القوة للتعلم والتميز!</p>
                    <button
                        onClick={() => window.location.href = '/courses'}
                        className="w-full py-5 bg-action-blue text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-action-blue/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                         استكشف الدورات المتاحة <FiArrowRight />
                    </button>
                </div>
            </div>
        );
    }

    if (!course) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6">
            <FiAlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black mb-2">الدورة غير متوفرة</h2>
            <p className="text-gray-400 mb-8">عذراً، لم نتمكن من العثور على محتوى هذه الدورة حالياً.</p>
            <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3 bg-action-blue rounded-xl font-bold">العودة للوحة التحكم</button>
        </div>
    );

    // Defensive data extraction
    const brandColor = (course?.user as any)?.brandColor || '#0ea5e9';
    const courseUser = course?.user || { name: 'المدرب', username: '' };
    
    // Safely calculate lessons and modules
    const modules = Array.isArray(course.modules) ? course.modules : [];
    const totalLessons = modules.reduce((acc: number, m: any) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
    const completedCount = modules.reduce((acc: number, m: any) => acc + (Array.isArray(m.lessons) ? m.lessons.filter((l: any) => l.completed).length : 0), 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Determine what to show in the main stage with high safety
    const renderContent = () => {
        try {
            if (activeItem?.type === 'lesson') {
                const lessonData = activeItem.data || {};
                const hasVideo = !!(lessonData.videoUrl || lessonData.muxPlaybackId || lessonData.bunnyVideoId);
                
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-brand font-black text-[10px] tracking-[4px] uppercase mb-2">
                                    <FiBarChart2 /> الدرس النشط
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                    {lessonData.title || 'درس بدون عنوان'}
                                </h1>
                            </div>
                            <button 
                                onClick={() => setShowComments(!showComments)}
                                className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all ${
                                    showComments ? 'bg-brand text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                <FiMessageCircle size={20} /> الأسئلة والنقاشات
                            </button>
                        </div>

                        {hasVideo ? (
                            <AdvancedVideoPlayer 
                                lessonId={lessonData.id}
                                courseId={course.id}
                                studentEmail={session?.user?.email || ''}
                                onComplete={handleLessonComplete}
                            />
                        ) : (
                            <div className="aspect-video w-full bg-gray-900 rounded-[40px] border border-white/5 flex flex-col items-center justify-center text-gray-500 shadow-inner">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <FiFileText size={48} />
                                </div>
                                <p className="text-xl font-black">محتوى نصي فقط</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                            <div className="flex gap-4">
                                <button onClick={goToPrevItem} className="h-14 w-14 rounded-2xl border border-white/10 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-md">
                                    <FiChevronRight size={24} />
                                </button>
                                <button onClick={goToNextItem} className="h-14 w-14 rounded-2xl border border-white/10 bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-md">
                                    <FiChevronLeft size={24} />
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleLessonComplete}
                                className={`w-full sm:w-auto px-8 py-4 ${lessonData.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 font-black' : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white font-bold'} rounded-2xl transition-all flex justify-center items-center gap-3 tracking-widest uppercase active:scale-95`}
                            >
                                <FiCheckSquare size={24} /> {lessonData.completed ? 'مكتمل - التالي' : 'تم إكمال الدرس'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                             {(lessonData.content || lessonData.description) && (
                                 <section className="bg-white dark:bg-card-white rounded-[40px] p-10 lg:p-12 shadow-xl overflow-hidden">
                                     <div className="prose prose-xl prose-invert max-w-none text-gray-600 dark:text-gray-300 font-medium leading-[1.8] dark:prose-headings:text-white dark:prose-strong:text-brand" 
                                          dangerouslySetInnerHTML={{ __html: lessonData.content || lessonData.description || '' }} 
                                     />
                                 </section>
                             )}

                             {showComments && (
                                 <LessonComments 
                                    lessonId={lessonData.id} 
                                    courseId={course.id} 
                                 />
                             )}
                        </div>
                    </div>
                );
            }

            if (activeItem?.type === 'quiz') {
                return (
                    <div className="py-12 flex justify-center animate-in zoom-in-95 duration-500">
                         <div className="w-full max-w-4xl">
                            <QuizPlayer
                                quiz={activeItem.data}
                                onComplete={handleQuizComplete}
                            />
                        </div>
                    </div>
                );
            }

            return (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-6 py-40 opacity-50">
                    <div className="relative">
                        <FiPlay size={80} className="animate-pulse" />
                        <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full"></div>
                    </div>
                    <p className="text-2xl font-black uppercase tracking-widest text-center">
                        اختر درساً للبدء في رحلتك <br/>
                        <span className="text-sm font-bold opacity-60">جميع الدروس تظهر في القائمة الجانبية</span>
                    </p>
                </div>
            );
        } catch (err) {
            console.error("Render error in main stage:", err);
            return (
                <div className="p-12 bg-red-500/10 border border-red-500/20 rounded-[40px] text-center">
                    <FiAlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">خطأ في عرض المحتوى</h3>
                    <p className="text-red-200/60">حدثت مشكلة تقنية وجاري معالجتها. يرجى محاولة اختيار درس آخر.</p>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row h-screen overflow-hidden font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                .text-brand { color: ${brandColor} !important; }
                .bg-brand { background-color: ${brandColor} !important; }
                .border-brand { border-color: ${brandColor} !important; }
                .text-indigo-600, .text-indigo-700 { color: ${brandColor} !important; }
                .bg-indigo-600, .bg-indigo-500 { background-color: ${brandColor} !important; }
                .bg-indigo-50 { background-color: ${brandColor.startsWith('#') ? brandColor + '15' : brandColor} !important; }
                .border-indigo-600, .border-indigo-500 { border-color: ${brandColor} !important; }
                `
            }} />

            {/* Side Navigation */}
            <div className="w-full md:w-[380px] bg-gray-900 border-l border-white/5 flex flex-col h-full z-20 shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-gray-900 to-gray-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                             <FiAward size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight line-clamp-2">{course.title || 'دورة تعليمية'}</h2>
                            <p className="text-gray-400 text-xs font-bold mt-1">بإشراف: <span className="text-brand">{(courseUser as any)?.name}</span></p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">إنجازك الإجمالي</span>
                            <span className="text-brand font-black text-lg">{progressPercent}%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div 
                                className="h-full bg-brand rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
                             <span>اتمام {completedCount} من {totalLessons} درساً</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {modules.length === 0 ? (
                        <div className="py-20 text-center px-6">
                            <FiLoader size={32} className="mx-auto text-brand opacity-20 mb-4" />
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">لا توجد دروس منشورة حالياً</p>
                        </div>
                    ) : (
                        modules.map((module: any) => (
                            <div key={module.id} className="space-y-3">
                                 <h3 className="px-4 text-[11px] font-black text-gray-500 uppercase tracking-[3px] flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-brand/40"></span>
                                     {module.title}
                                 </h3>
                                 <div className="space-y-1">
                                     {(module.lessons || []).map((lesson: any, lIdx: number) => (
                                         <button
                                             key={lesson.id}
                                             onClick={() => setActiveItem({ type: 'lesson', data: lesson })}
                                             className={`w-full text-right p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group ${
                                                 activeItem?.type === 'lesson' && activeItem?.data?.id === lesson.id
                                                 ? 'bg-brand/10 border border-brand/20 text-white shadow-lg'
                                                 : 'hover:bg-white/5 text-gray-400 opacity-70 hover:opacity-100'
                                             }`}
                                         >
                                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                                 lesson.completed 
                                                 ? 'bg-green-500 border-green-500 text-white' 
                                                 : 'border-white/10 group-hover:border-brand/40'
                                             }`}>
                                                 {lesson.completed ? <FiCheck size={14} strokeWidth={3} /> : <span className="text-[10px] font-black">{lIdx + 1}</span>}
                                             </div>
                                             <span className={`text-sm font-bold flex-1 truncate ${activeItem?.data?.id === lesson.id ? 'text-white' : ''}`}>
                                                 {lesson.title}
                                             </span>
                                             <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                                                 {lesson.videoUrl || lesson.muxPlaybackId || lesson.bunnyVideoId ? <FiVideo size={16} /> : <FiFileText size={16} />}
                                             </div>
                                         </button>
                                     ))}
                                 </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5">
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white/70 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                         العودة للوحة التحكم
                    </button>
                </div>
            </div>

            {/* Master Content Stage */}
            <div className="flex-1 flex flex-col h-full bg-gray-950 overflow-hidden relative">
                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
                    <div className="max-w-5xl mx-auto">
                        {renderContent()}
                    </div>
                </main>

                <div className="h-20 bg-gray-900 border-t border-white/5 px-8 flex items-center justify-between z-30">
                     <div className="hidden md:flex items-center gap-3">
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">مدعوم من</span>
                         <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-[10px] font-black">تمالين</span>
                     </div>
                     
                     <div className="flex gap-4">
                         <button onClick={goToPrevItem} className="h-12 w-12 rounded-xl border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
                             <FiChevronRight size={20} />
                         </button>
                         <button onClick={goToNextItem} className="h-12 w-12 rounded-xl border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all">
                             <FiChevronLeft size={20} />
                         </button>
                     </div>
                </div>
            </div>
        </div>
    );
}
