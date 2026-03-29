'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare, FiClock, FiTarget, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    isPublished: boolean;
    lessonId: string | null;
    lesson?: { title: string } | null;
    _count?: { attempts: number };
    questions: any;
}

export default function CourseQuizzesPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/content`);
            if (res.ok) {
                const data = await res.json();
                // Extract quizzes from Course and Modules/Lessons
                const allQuizzes: Quiz[] = data.quizzes || [];
                if (data.modules) {
                    for (const mod of data.modules) {
                        if (mod.lessons) {
                            for (const lesson of mod.lessons) {
                                if (lesson.quizzes) {
                                    for (const quiz of lesson.quizzes) {
                                        allQuizzes.push({
                                            ...quiz,
                                            lesson: { title: lesson.title },
                                            lessonId: lesson.id,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                setQuizzes(allQuizzes);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async (quizId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟')) return;
        try {
            const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('تم حذف الاختبار');
                setQuizzes(prev => prev.filter(q => q.id !== quizId));
            } else {
                toast.error('فشل حذف الاختبار');
            }
        } catch {
            toast.error('حدث خطأ');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#10B981] dark:text-white flex items-center gap-2">
                        <FiCheckSquare className="text-[#10B981]" /> اختبارات الدورة
                    </h1>
                    <p className="text-text-muted text-sm mt-1">إدارة اختبارات وتقييمات الكورس</p>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/new?returnTo=${encodeURIComponent(`/dashboard/courses/${courseId}/quizzes`)}`)}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2.5"
                >
                    <FiPlus /> اختبار جديد
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">إجمالي الاختبارات</p>
                    <p className="text-2xl font-bold text-[#10B981] mt-1">{quizzes.length}</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">منشور</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{quizzes.filter(q => q.isPublished).length}</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">إجمالي الأسئلة</p>
                    <p className="text-2xl font-bold text-[#10B981] mt-1">
                        {quizzes.reduce((sum, q) => {
                            const questions = Array.isArray(q.questions) ? q.questions : [];
                            return sum + questions.length;
                        }, 0)}
                    </p>
                </div>
            </div>

            {/* Quizzes List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-400/30 border-t-ink rounded-xl animate-spin" />
                </div>
            ) : quizzes.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiCheckSquare className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-text-muted text-lg mb-4">لا توجد اختبارات بعد</p>
                    <button
                        onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/new?returnTo=${encodeURIComponent(`/dashboard/courses/${courseId}/quizzes`)}`)}
                        className="btn btn-primary inline-flex items-center gap-2 px-6 py-3"
                    >
                        <FiPlus /> إنشاء أول اختبار
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="card p-0 overflow-hidden">
                            <div className="flex items-center justify-between p-5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-[#10B981] dark:text-white">{quiz.title}</h3>
                                        {quiz.isPublished ? (
                                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-1">
                                                <FiEye size={10} /> منشور
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs bg-emerald-800 dark:bg-gray-700 text-gray-400 dark:text-gray-400 rounded-xl flex items-center gap-1">
                                                <FiEyeOff size={10} /> مسودة
                                            </span>
                                        )}
                                    </div>
                                    {quiz.description && (
                                        <p className="text-sm text-text-muted mt-1 line-clamp-1">{quiz.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-muted">
                                        {quiz.lesson && (
                                            <span>📖 {quiz.lesson.title}</span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <FiTarget size={12} /> نجاح: {quiz.passingScore}%
                                        </span>
                                        {quiz.timeLimit && (
                                            <span className="flex items-center gap-1">
                                                <FiClock size={12} /> {quiz.timeLimit} دقيقة
                                            </span>
                                        )}
                                        <span>
                                            {Array.isArray(quiz.questions) ? quiz.questions.length : 0} سؤال
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/${quiz.id}/edit`)}
                                        className="p-2 text-gray-400 dark:text-gray-400 hover:bg-emerald-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="تعديل"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteQuiz(quiz.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/100/10 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
