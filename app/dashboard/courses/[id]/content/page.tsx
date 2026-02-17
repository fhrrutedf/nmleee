'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiMove, FiCheckSquare } from 'react-icons/fi';

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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">محتوى الدورة</h1>
                        <p className="mt-2 text-gray-600">
                            نظّم دورتك بوحدات ودروس
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModuleForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus />
                        وحدة جديدة
                    </button>
                </div>

                {/* New Module Form */}
                {showModuleForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">وحدة جديدة</h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newModuleTitle}
                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                placeholder="عنوان الوحدة"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                onKeyPress={(e) => e.key === 'Enter' && createModule()}
                            />
                            <button
                                onClick={createModule}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                إضافة
                            </button>
                            <button
                                onClick={() => {
                                    setShowModuleForm(false);
                                    setNewModuleTitle('');
                                }}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                )}

                {/* Modules List */}
                {modules.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            لا توجد وحدات تعليمية
                        </h3>
                        <p className="text-gray-600 mb-6">
                            ابدأ بإنشاء وحدة تعليمية وأضف دروس لها
                        </p>
                        <button
                            onClick={() => setShowModuleForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <FiPlus />
                            إنشاء وحدة جديدة
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {modules.map((module, moduleIndex) => (
                            <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Module Header */}
                                <div className="p-6 bg-gray-50 border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <FiMove className="cursor-move" />
                                                <span className="font-semibold text-gray-600">
                                                    الوحدة {moduleIndex + 1}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                            {module.isPublished ? (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                    منشور
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                    مسودة
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                {module._count.lessons} درس
                                            </span>
                                            <button
                                                onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/new`)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                            >
                                                <FiPlus size={14} />
                                                درس جديد
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                {module.lessons.length > 0 && (
                                    <div className="divide-y">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-500 w-8">
                                                            {lessonIndex + 1}
                                                        </span>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDuration(lesson.videoDuration)}
                                                                </span>
                                                                {lesson.isFree && (
                                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                                                        مجاني
                                                                    </span>
                                                                )}
                                                                {lesson.isPublished ? (
                                                                    <FiEye className="text-green-500" size={14} />
                                                                ) : (
                                                                    <FiEyeOff className="text-gray-400" size={14} />
                                                                )}
                                                            </div>
                                                            {/* Quizzes List */}
                                                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {lesson.quizzes.map((quiz) => (
                                                                        <span key={quiz.id} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">
                                                                            <FiCheckSquare size={12} />
                                                                            {quiz.title}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/courses/${courseId}/quizzes/new?lessonId=${lesson.id}`)}
                                                            className="p-1.5 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 border border-purple-200 flex items-center gap-1"
                                                            title="إضافة اختبار"
                                                        >
                                                            <FiPlus size={12} /> اختبار
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/dashboard/lessons/${lesson.id}/edit`)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                            title="تعديل الدرس"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                    </div>
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
        </div>
    );
}
