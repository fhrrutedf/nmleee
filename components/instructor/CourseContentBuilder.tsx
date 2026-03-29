import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiCheckSquare, FiEye, FiActivity, FiVideo, FiTrash2, FiEdit, FiLayers } from 'react-icons/fi';

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

interface CourseContentBuilderProps {
    courseId: string;
    onLessonsChange?: (count: number) => void;
}

export default function CourseContentBuilder({ courseId, onLessonsChange }: CourseContentBuilderProps) {
    const router = useRouter();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        if (courseId) fetchModules();
    }, [courseId]);

    useEffect(() => {
        if (!loading && onLessonsChange) {
            const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
            onLessonsChange(totalLessons);
        }
    }, [modules, loading, onLessonsChange]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-accent rounded-xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Professional Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-r-4 border-ink pr-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#10B981]">هيكلة الدورة التدريبية</h2>
                    <p className="mt-1.5 text-gray-500 font-bold text-sm">
                        قم بتنظيم المنهج الدراسي وتوزيع الدروس والمهام.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModuleForm(true)}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-emerald-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-[#10B981]/20 shadow-ink/10 active:scale-95"
                >
                    <FiPlus />
                    إنشاء وحدة تعليمية جديدة
                </button>
            </div>

            {/* Corporate Module Form */}
            {showModuleForm && (
                <div className="bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20 border border-gray-100 p-8 mb-10 ring-1 ring-gray-100 transition-all">
                    <h3 className="text-lg font-bold text-[#10B981] mb-6">إضافة وحدة دراسية جديدة</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="مثال: مقدمة في علوم البيانات..."
                            className="flex-1 bg-[#111111] border-gray-100 rounded-xl px-6 py-4 font-bold text-[#10B981] focus:ring-4 focus:ring-accent/5 focus:border-emerald-600 transition-all w-full"
                            onKeyPress={(e) => e.key === 'Enter' && createModule()}
                            autoFocus
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={createModule}
                                className="flex-1 sm:flex-none px-8 py-4 bg-emerald-700 font-bold text-white rounded-xl hover:bg-emerald-700-hover active:scale-95 transition-all shadow-lg shadow-[#10B981]/20 shadow-accent/20"
                            >
                                حفظ الوحدة
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModuleForm(false);
                                    setNewModuleTitle('');
                                }}
                                className="flex-1 sm:flex-none px-8 py-4 bg-emerald-800 font-bold text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules / Sections List */}
            {modules.length === 0 ? (
                <div className="text-center py-24 bg-[#0A0A0A] rounded-[2rem] border-2 border-dashed border-gray-100 hover:border-emerald-600/30 transition-all duration-300">
                    <div className="w-20 h-20 bg-[#111111] rounded-xl flex items-center justify-center mx-auto mb-8">
                         <FiLayers className="text-4xl text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-2">منهج الدورة لا يزال فارغاً</h3>
                    <p className="text-gray-400 mb-10 max-w-sm mx-auto font-bold">ابدأ بإنشاء أول وحدة دراسية، ثم ابدأ بإضافة المحتوى التعليمي داخلها.</p>
                    <button
                        type="button"
                        onClick={() => setShowModuleForm(true)}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-[#10B981]/20 shadow-ink/20"
                    >
                        <FiPlus size={20} />
                        إضافة أول وحدة دراسية
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {modules.map((module, moduleIndex) => (
                        <div key={module.id} className="bg-[#0A0A0A] rounded-xl border border-gray-100 overflow-hidden shadow-lg shadow-[#10B981]/20 hover:shadow-md transition-all">
                            <div className="p-6 sm:p-8 bg-[#111111]/50 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-[#0A0A0A] rounded-xl border border-gray-100 flex items-center justify-center text-[#10B981] font-inter font-bold shadow-lg shadow-[#10B981]/20">
                                        {moduleIndex + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#10B981]">{module.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{module._count.lessons} Curriculum Units</span>
                                            <div className="w-1 h-1 bg-gray-200 rounded-xl"></div>
                                            <button type="button" className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest hover:text-[#10B981] transition-colors">Edit Specification</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center w-full lg:w-auto gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0A] border border-emerald-500/20 text-[#10B981] font-bold rounded-xl hover:border-emerald-600 hover:text-[#10B981] transition-all shadow-lg shadow-[#10B981]/20"
                                    >
                                        <FiPlus size={18} />
                                        إضافة درس أو فيديو
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List - Minimalist UI */}
                            {module.lessons.length > 0 && (
                                <div className="divide-y divide-gray-50">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lesson.id} className="p-6 hover:bg-[#111111]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                                <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                                                    <FiVideo />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-[#10B981] text-base tracking-tight">{lesson.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                                        <span className="text-xs font-bold text-gray-500 bg-[#0A0A0A] border border-gray-100 px-3 py-1 rounded-lg font-inter">
                                                            {formatDuration(lesson.videoDuration)}
                                                        </span>
                                                        {lesson.isFree && (
                                                            <span className="text-[10px] font-bold text-[#10B981] bg-emerald-700/5 px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-2 border border-emerald-600/10">
                                                                <FiEye size={12} /> PUBLIC PREVIEW
                                                            </span>
                                                        )}
                                                        {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                            <span className="text-[10px] font-bold text-[#10B981] bg-emerald-800 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                                                                <FiCheckSquare size={12} /> {lesson.quizzes.length} Assignments
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/new?lessonId=${lesson.id}&returnTo=${encodeURIComponent('/dashboard/courses/new')}`)}
                                                    className="flex-1 sm:flex-none px-4 py-2.5 text-[11px] font-bold text-gray-500 bg-[#0A0A0A] border border-gray-100 rounded-xl hover:border-emerald-600 hover:text-[#10B981] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FiPlus size={14} /> إضافة اختبار
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/dashboard/lessons/${lesson.id}/edit`)}
                                                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 text-white text-[11px] font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-[#10B981]/20 shadow-ink/5"
                                                >
                                                    تعديل المحتوى
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Empty module state */}
                            {module.lessons.length === 0 && (
                                <div className="p-12 text-center bg-[#111111]/30">
                                    <p className="text-gray-400 font-bold text-sm mb-4">لا توجد دروس في هذه الوحدة حالياً.</p>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                        className="text-[#10B981] font-bold text-xs hover:underline uppercase tracking-widest border border-emerald-600/10 px-6 py-2 rounded-xl"
                                    >
                                        + إضافة أول درس الآن
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}
