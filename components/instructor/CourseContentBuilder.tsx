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
                <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Professional Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-r-4 border-ink pr-6">
                <div>
                    <h2 className="text-2xl font-bold text-ink">هيكلة الدورة التدريبية</h2>
                    <p className="mt-1.5 text-gray-500 font-bold text-sm">
                        قم بتنظيم المنهج الدراسي وتوزيع الدروس والمهام.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModuleForm(true)}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 bg-ink text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-sm shadow-ink/10 active:scale-95"
                >
                    <FiPlus />
                    إنشاء وحدة تعليمية جديدة
                </button>
            </div>

            {/* Corporate Module Form */}
            {showModuleForm && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-10 ring-1 ring-gray-100 transition-all">
                    <h3 className="text-lg font-bold text-ink mb-6">إضافة وحدة دراسية جديدة</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="مثال: مقدمة في علوم البيانات..."
                            className="flex-1 bg-gray-50 border-gray-100 rounded-2xl px-6 py-4 font-bold text-ink focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all w-full"
                            onKeyPress={(e) => e.key === 'Enter' && createModule()}
                            autoFocus
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={createModule}
                                className="flex-1 sm:flex-none px-8 py-4 bg-accent font-bold text-white rounded-2xl hover:bg-accent-hover active:scale-95 transition-all shadow-lg shadow-accent/20"
                            >
                                حفظ الوحدة
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModuleForm(false);
                                    setNewModuleTitle('');
                                }}
                                className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 font-bold text-gray-500 rounded-2xl hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules / Sections List */}
            {modules.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 hover:border-accent/30 transition-all duration-300">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                         <FiLayers className="text-4xl text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">منهج الدورة لا يزال فارغاً</h3>
                    <p className="text-gray-400 mb-10 max-w-sm mx-auto font-bold">ابدأ بإنشاء أول وحدة دراسية، ثم ابدأ بإضافة المحتوى التعليمي داخلها.</p>
                    <button
                        type="button"
                        onClick={() => setShowModuleForm(true)}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-ink text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-sm shadow-ink/20"
                    >
                        <FiPlus size={20} />
                        إضافة أول وحدة دراسية
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {modules.map((module, moduleIndex) => (
                        <div key={module.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="p-6 sm:p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-ink font-inter font-bold shadow-sm">
                                        {moduleIndex + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-ink">{module.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{module._count.lessons} Curriculum Units</span>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                            <button type="button" className="text-[10px] font-black text-accent uppercase tracking-widest hover:text-ink transition-colors">Edit Specification</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center w-full lg:w-auto gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-ink font-bold rounded-xl hover:border-accent hover:text-accent transition-all shadow-sm"
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
                                        <div key={lesson.id} className="p-6 hover:bg-gray-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-white transition-colors">
                                                    <FiVideo />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-ink text-base tracking-tight">{lesson.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                                        <span className="text-xs font-bold text-gray-500 bg-white border border-gray-100 px-3 py-1 rounded-lg font-inter">
                                                            {formatDuration(lesson.videoDuration)}
                                                        </span>
                                                        {lesson.isFree && (
                                                            <span className="text-[10px] font-black text-accent bg-accent/5 px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-2 border border-accent/10">
                                                                <FiEye size={12} /> PUBLIC PREVIEW
                                                            </span>
                                                        )}
                                                        {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                            <span className="text-[10px] font-bold text-ink bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
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
                                                    className="flex-1 sm:flex-none px-4 py-2.5 text-[11px] font-bold text-gray-500 bg-white border border-gray-100 rounded-xl hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FiPlus size={14} /> إضافة اختبار
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/dashboard/lessons/${lesson.id}/edit`)}
                                                    className="flex-1 sm:flex-none px-4 py-2.5 bg-ink text-white text-[11px] font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-ink/5"
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
                                <div className="p-12 text-center bg-gray-50/30">
                                    <p className="text-gray-400 font-bold text-sm mb-4">لا توجد دروس في هذه الوحدة حالياً.</p>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                        className="text-accent font-bold text-xs hover:underline uppercase tracking-widest border border-accent/10 px-6 py-2 rounded-full"
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
