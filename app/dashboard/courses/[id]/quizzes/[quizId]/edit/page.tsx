'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizBuilder from '@/components/QuizBuilder';
import { FiSave, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const quizId = params.quizId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: '',
        isPublished: false,
        questions: [] as any[],
    });

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`/api/quizzes/${quizId}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    passingScore: data.passingScore || 70,
                    timeLimit: data.timeLimit?.toString() || '',
                    isPublished: data.isPublished || false,
                    questions: Array.isArray(data.questions) ? data.questions : [],
                });
            } else {
                toast.error('الاختبار غير موجود');
                router.back();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.questions.length === 0) {
            toast.error('يجب إضافة سؤال واحد على الأقل');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/quizzes/${quizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('تم حفظ التغييرات');
                router.push(`/dashboard/courses/${courseId}/quizzes`);
            } else {
                const data = await res.json();
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء حفظ الاختبار');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-purple-400/30 border-t-ink rounded-xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
                <button onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes`)} className="hover:text-accent transition-colors">
                    الاختبارات
                </button>
                <FiArrowRight size={12} />
                <span className="text-ink dark:text-white font-medium">تعديل: {formData.title}</span>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-ink dark:text-white">تعديل الاختبار</h1>
                    <label className="flex items-center gap-2 cursor-pointer">
                        {formData.isPublished ? (
                            <FiEye className="text-green-500" />
                        ) : (
                            <FiEyeOff className="text-gray-400" />
                        )}
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">{formData.isPublished ? 'منشور' : 'مسودة'}</span>
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">عنوان الاختبار *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input w-full"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">الوصف</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف مختصر للاختبار"
                            rows={2}
                            className="input w-full"
                        />
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">درجة النجاح (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.passingScore}
                                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label">الحد الزمني (دقائق) - اختياري</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.timeLimit}
                                onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                placeholder="غير محدود"
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Quiz Builder */}
                    <div>
                        <h3 className="text-lg font-semibold text-ink dark:text-white mb-4">الأسئلة</h3>
                        <QuizBuilder
                            initialQuestions={formData.questions}
                            onChange={(questions) => setFormData({ ...formData, questions: questions as any })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-xl animate-spin" />
                            ) : (
                                <FiSave />
                            )}
                            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-outline py-3 px-6"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
