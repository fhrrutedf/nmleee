'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiArrowRight, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FileUploader from '@/components/ui/FileUploader';
import BunnyUpload from '@/components/instructor/BunnyUpload';

interface LessonData {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    videoUrl: string | null;
    videoDuration: number | null;
    isFree: boolean;
    isPublished: boolean;
    attachments: string[];
    bunnyVideoId: string | null;
    bunnyLibraryId: string | null;
    module: {
        course: {
            id: string;
            title: string;
        };
    };
}

export default function EditLessonPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        videoDuration: '',
        isFree: false,
        isPublished: false,
        attachments: [] as string[],
        bunnyVideoId: '',
        bunnyLibraryId: '',
    });

    useEffect(() => {
        fetchLesson();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`);
            if (res.ok) {
                const data = await res.json();
                setLesson(data);
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    content: data.content || '',
                    videoUrl: data.videoUrl || '',
                    videoDuration: data.videoDuration?.toString() || '',
                    isFree: data.isFree || false,
                    isPublished: data.isPublished || false,
                    attachments: data.attachments || [],
                    bunnyVideoId: data.bunnyVideoId || '',
                    bunnyLibraryId: data.bunnyLibraryId || '',
                });
            } else {
                toast.error('الدرس غير موجود');
                router.back();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء تحميل الدرس');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    attachments: formData.attachments.filter(a => a.trim() !== ''),
                }),
            });

            if (res.ok) {
                toast.success('تم حفظ التغييرات');
                if (lesson?.module?.course?.id) {
                    router.push(`/dashboard/courses/${lesson.module.course.id}/content`);
                } else {
                    router.back();
                }
            } else {
                const data = await res.json();
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء حفظ التغييرات');
        } finally {
            setSaving(false);
        }
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-xl animate-spin" />
            </div>
        );
    }

    if (!lesson) return null;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
                <button onClick={() => router.push(`/dashboard/courses/${lesson.module.course.id}/content`)} className="hover:text-accent transition-colors">
                    محتوى الدورة
                </button>
                <FiArrowRight size={12} />
                <span className="text-ink dark:text-white font-medium">تعديل: {lesson.title}</span>
            </div>

            <div className="card">
                <h1 className="text-2xl font-bold text-ink dark:text-white mb-6">تعديل الدرس</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">عنوان الدرس *</label>
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
                            placeholder="وصف مختصر للدرس"
                            rows={3}
                            className="input w-full"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="label">المحتوى النصي (Markdown)</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="يمكنك استخدام Markdown للتنسيق..."
                            rows={8}
                            className="input w-full font-mono text-sm"
                        />
                    </div>

                    {/* Video Section */}
                    <div className="space-y-4">
                        <div className="p-6 bg-accent-50/30 dark:bg-accent/5 rounded-xl border border-accent/10">
                            <label className="label mb-4 opacity-70">إعدادات الفيديو (Bunny Stream)</label>
                            
                            {formData.bunnyVideoId ? (
                                <div className="bg-white dark:bg-card-white p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                                            <FiCheckCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-ink dark:text-white">الفيديو مرتبط بـ Bunny</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">ID: {formData.bunnyVideoId}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({ ...formData, bunnyVideoId: '', bunnyLibraryId: '' })}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            ) : (
                                <BunnyUpload 
                                    lessonId={lessonId} 
                                    onComplete={() => fetchLesson()} 
                                />
                            )}
                        </div>

                        <div>
                            <label className="label">مدة الفيديو (بالثواني)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.videoDuration}
                                onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                                placeholder="مثلاً: 600 ثانية"
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isFree}
                                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                            />
                            <span className="text-sm font-medium text-ink dark:text-white">درس مجاني للمعاينة</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-ink dark:text-white">منشور</span>
                        </label>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="label">المرفقات</label>
                        {formData.attachments.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {formData.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate" dir="ltr">{attachment.split('/').pop()}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <FileUploader
                            onUploadSuccess={(urls) => {
                                setFormData(prev => ({
                                    ...prev,
                                    attachments: [...prev.attachments, ...urls],
                                }));
                            }}
                            maxFiles={5}
                            maxSize={100 * 1024 * 1024}
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
