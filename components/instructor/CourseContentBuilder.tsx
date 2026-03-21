import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiMove, FiCheckSquare, FiEye, FiEyeOff } from 'react-icons/fi';

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
}

export default function CourseContentBuilder({ courseId }: CourseContentBuilderProps) {
    const router = useRouter();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        if (courseId) fetchModules();
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
                <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">محتوى وتسلسل الدورة</h2>
                    <p className="mt-2 text-slate-500 font-medium text-sm">
                        قم ببناء المنهج وتقسيمه لدروس ومقاطع فيديو. (تُحفظ البيانات تلقائياً هنا)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowModuleForm(true)}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <FiPlus />
                    إنشاء وحدة رئيسية جديدة
                </button>
            </div>

            {/* New Module Form */}
            {showModuleForm && (
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-8 ring-4 ring-indigo-50 transition-all">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">اسم الوحدة الجديدة</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            placeholder="مثال: الفصل الأول - مقدمة وتأسيس..."
                            className="flex-1 bg-slate-50 border-0 rounded-xl px-6 py-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all w-full"
                            onKeyPress={(e) => e.key === 'Enter' && createModule()}
                            autoFocus
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={createModule}
                                className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 font-bold text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
                            >
                                حفظ الوحدة
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModuleForm(false);
                                    setNewModuleTitle('');
                                }}
                                className="flex-1 sm:flex-none px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules List */}
            {modules.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 hover:border-indigo-300 transition-colors">
                    <div className="text-slate-300 text-6xl mb-6">📚</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">الدورة فارغة حالياً</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">ابدأ بإنشاء أول وحدة دراسية (فصل)، ثم ابدأ بإضافة الفيديوهات والدروس داخلها بكل سهولة.</p>
                    <button
                        type="button"
                        onClick={() => setShowModuleForm(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        <FiPlus size={20} />
                        إنشاء أول وحدة تعليمية
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {modules.map((module, moduleIndex) => (
                        <div key={module.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 cursor-default">
                                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                                        {moduleIndex + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800">{module.title}</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{module._count.lessons} درس متاح</p>
                                    </div>
                                </div>
                                <div className="flex items-center w-full lg:w-auto gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                                    >
                                        <FiPlus size={18} />
                                        إضافة درس أو فيديو
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {module.lessons.length > 0 && (
                                <div className="divide-y divide-slate-100">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lesson.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <span className="text-sm font-bold text-slate-400 bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                                    {lessonIndex + 1}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-base">{lesson.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                            {formatDuration(lesson.videoDuration)}
                                                        </span>
                                                        {lesson.isFree && (
                                                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                                                مجاني للمعاينة
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/dashboard/lessons/${lesson.id}/edit`)}
                                                    className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                                                >
                                                    تعديل الدرس
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
