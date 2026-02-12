'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizBuilder from '@/components/QuizBuilder';
import { FiSave } from 'react-icons/fi';

export default function NewQuizPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: '',
        lessonId: '',
        questions: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.questions.length === 0) {
            alert('يجب إضافة سؤال واحد على الأقل');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    courseId,
                    lessonId: formData.lessonId || null,
                }),
            });

            if (response.ok) {
                router.push(`/dashboard/courses/${courseId}/quizzes`);
            } else {
                const data = await response.json();
                alert(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('حدث خطأ أثناء إنشاء الاختبار');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">إنشاء اختبار جديد</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عنوان الاختبار *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: اختبار الوحدة الأولى"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="وصف مختصر للاختبار"
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    درجة النجاح (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.passingScore}
                                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الزمني (دقائق) - اختياري
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                    placeholder="غير محدود"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Quiz Builder */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">الأسئلة</h3>
                            <QuizBuilder
                                onChange={(questions) => setFormData({ ...formData, questions: questions as any })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <FiSave />
                                {loading ? 'جاري الحفظ...' : 'حفظ الاختبار'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
