'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiMove, FiCheckSquare, FiArrowRight, FiLayers } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    isPublished: boolean;
    lessons: Lesson[];
    _count: {
        lessons: number;
    };
}

interface Lesson {
    id: string;
    title: string;
    videoDuration: number | null;
    isPublished: boolean;
    isFree: boolean;
    order: number;
    quizzes?: { id: string; title: string }[];
}

export default function CourseContentPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        fetchModules();
    }, [courseId]);

    const fetchModules = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/modules`);
            if (response.ok) {
                const data = await response.json();
                setModules(data);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const createModule = async () => {
        if (!newModuleTitle.trim()) return;

        try {
            const response = await fetch(`/api/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newModuleTitle }),
            });

            if (response.ok) {
                setNewModuleTitle('');
                setShowModuleForm(false);
                fetchModules();
                showToast.success('تم إنشاء الوحدة بنجاح! 📚');
            }
        } catch (error) {
            console.error('Error creating module:', error);
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const saveDraft = async () => {
        try {
            showToast.loading('جاري حفظ المسودة...');
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: false, status: 'PENDING_REVIEW' })
            });
            
            if (response.ok) {
                showToast.success('تم حفظ الدورة كمسودة بنجاح! 📥');
                router.push('/dashboard/courses');
            } else {
                showToast.error('فشل في حفظ المسودة');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast.error('خطأ في الاتصال');
        }
    };

    const publishCourse = async () => {
        try {
            showToast.loading('جاري نشر الدورة...');
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true, status: 'APPROVED' })
            });
            
            if (response.ok) {
                showToast.success('تم نشر الدورة بنجاح!');
                router.push('/dashboard/courses'); // Redirect back to courses list
            } else {
                showToast.error('حدث خطأ أثناء نشر الدورة');
            }
        } catch (error) {
            console.error('Error publishing course:', error);
            showToast.error('تعذر الاتصال بالخادم لنشر الدورة');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#111111]">
                <div className="w-12 h-12 border-4 border-ink/20 border-t-ink rounded-xl animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 dir-rtl">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-right space-y-2">
                    <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-400 font-bold text-xs hover:text-[#10B981] transition-colors">
                        <FiArrowRight /> العودة للوحة التحكّم
                    </button>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white leading-none">إدارة منهج الدورة 🎓</h1>
                            <p className="mt-3 text-gray-500 font-medium text-sm">استعرض مصفوفة المنهج، أضف الدروس، ونظّم تجربة التعلم</p>
                        </div>
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowModuleForm(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-[#0A0A0A] text-[#10B981] border border-indigo-100 rounded-[1.5rem] font-bold shadow-lg shadow-[#10B981]/20 hover:bg-[#111111] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <FiPlus /> وحدة جديدة
                            </button>
                            <button
                                onClick={() => saveDraft()}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-800 text-gray-400 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <FiEyeOff /> حفظ كمسودة
                            </button>
                            <button
                                onClick={publishCourse}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-700 text-white-500 text-white rounded-[1.5rem] font-bold shadow-lg shadow-[#10B981]/20 shadow-blue-200 hover:bg-emerald-700 text-white-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <FiCheckSquare /> نشر الدورة الآن
                            </button>
                        </div>
                    </div>
                </div>

                {/* New Module Form */}
                {showModuleForm && (
                    <div className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 shadow-indigo-100 p-8 mb-10 border border-indigo-100 ring-4 ring-indigo-50/50 transition-all animate-in slide-in-from-top-4 duration-300">
                        <h3 className="text-xl font-bold text-white mb-6">اسم الوحدة التعليمية</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                placeholder="مثال: الأساسيات - الفصل الأول..."
                                className="flex-1 px-6 py-4 bg-[#111111] border-0 rounded-xl focus:ring-4 focus:ring-ink/10 font-bold transition-all"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button onClick={createModule} className="flex-1 sm:flex-none px-8 py-4 bg-emerald-700 text-white rounded-xl font-bold text-sm">حفظ</button>
                                <button onClick={() => { setShowModuleForm(false); setNewModuleTitle(''); }} className="flex-1 sm:flex-none px-6 py-4 bg-emerald-800 text-gray-500 rounded-xl font-bold text-sm">إلغاء</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modules List */}
                {modules.length === 0 ? (
                    <div className="text-center py-20 bg-[#0A0A0A] rounded-xl border-2 border-dashed border-slate-200 shadow-lg shadow-[#10B981]/20">
                        <div className="text-slate-200 text-7xl mb-6 flex justify-center"><FiLayers /></div>
                        <h3 className="text-xl font-bold text-white mb-2">المنهج فارغ تماماً</h3>
                        <p className="text-slate-400 font-bold text-sm mb-8">ابدأ بإنشاء أول وحدة دراسية لتبدأ بإضافة الدروس</p>
                        <button onClick={() => setShowModuleForm(true)} className="px-10 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-700 text-white transition-all shadow-lg shadow-[#10B981]/20">تحضير أول وحدة</button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {modules.map((module, i) => (
                            <div key={module.id} className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 border border-emerald-500/20 overflow-hidden hover:shadow-lg shadow-[#10B981]/20 transition-all duration-300 group">
                                {/* Module Header */}
                                <div className="p-6 sm:p-8 bg-[#111111]/50 border-b border-emerald-500/20">
                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 w-full lg:w-auto">
                                            <div className="w-12 h-12 bg-[#0A0A0A] rounded-xl border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-lg shadow-[#10B981]/20 group-hover:text-[#10B981] group-hover:border-indigo-100 transition-colors">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-800 break-words">{module.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-xl ${module.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-gray-500'}`}>
                                                        {module.isPublished ? 'منشور للطلاب' : 'مسودة'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">• {module._count.lessons} درس</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                            className="w-full lg:w-auto px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                                        >
                                            <FiPlus /> إضافة درس للوحدة
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="divide-y divide-slate-50">
                                    {module.lessons.map((lesson, li) => (
                                        <div key={lesson.id} className="p-6 hover:bg-[#111111]/30 transition-colors">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                                                    <span className="text-xs font-bold text-slate-300 w-6">{li + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 text-sm truncate">{lesson.title}</h4>
                                                        <div className="flex items-center gap-3 mt-1.5 font-bold">
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter" dir="ltr">{formatDuration(lesson.videoDuration)}</span>
                                                            {lesson.isFree && <span className="text-[9px] bg-emerald-700 text-white-50 text-[#10B981]-600 px-2 py-0.5 rounded border border-blue-100">معاينة مجانية</span>}
                                                            {lesson.isPublished ? <FiEye className="text-[#10B981]-500" size={12}/> : <FiEyeOff className="text-slate-300" size={12}/>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/new?lessonId=${lesson.id}&returnTo=${encodeURIComponent(`/dashboard/courses/${courseId}/content`)}`)}
                                                        className="px-4 py-1.5 bg-emerald-700 text-white-50 text-blue-700 rounded-lg font-bold text-[10px] flex items-center gap-1.5 border border-blue-100 hover:bg-blue-100 transition-colors"
                                                    >
                                                        <FiCheckSquare size={12}/> اختبار
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/dashboard/lessons/${lesson.id}/edit`)}
                                                        className="w-9 h-9 flex items-center justify-center text-slate-400 bg-[#0A0A0A] border border-slate-200 rounded-lg hover:text-[#10B981] hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-lg shadow-[#10B981]/20"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Quizzes Badges */}
                                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2 pr-10">
                                                    {lesson.quizzes.map(q => (
                                                        <span key={q.id} className="text-[9px] font-bold bg-[#0A0A0A] text-[#10B981] border border-indigo-100 px-2.5 py-1 rounded-xl shadow-lg shadow-[#10B981]/20 flex items-center gap-1.5">
                                                            <FiCheckSquare size={10} /> {q.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {module.lessons.length === 0 && (
                                        <div className="p-8 text-center text-slate-300 font-bold text-xs italic bg-[#111111]/20">لا يوجد دروس في هذه الوحدة حتى الآن.</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
