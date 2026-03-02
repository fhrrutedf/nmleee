'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiX, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FileUploader from '@/components/ui/FileUploader';

export default function NewLessonPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.moduleId as string;
    const courseId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        videoDuration: '',
        isFree: false,
        attachments: [''],
    });

    const addAttachment = () => {
        setFormData({
            ...formData,
            attachments: [...formData.attachments, ''],
        });
    };

    const removeAttachment = (index: number) => {
        const newAttachments = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newAttachments });
    };

    const updateAttachment = (index: number, value: string) => {
        const newAttachments = [...formData.attachments];
        newAttachments[index] = value;
        setFormData({ ...formData, attachments: newAttachments });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/modules/${moduleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    attachments: formData.attachments.filter(a => a.trim() !== ''),
                }),
            });

            if (response.ok) {
                router.push(`/dashboard/courses/${courseId}/content`);
            } else {
                const data = await response.json();
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            toast.error('حدث خطأ أثناء إنشاء الدرس');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">إضافة درس جديد</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عنوان الدرس *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: مقدمة في React"
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
                                placeholder="وصف مختصر للدرس"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Content (Markdown) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المحتوى النصي (Markdown)
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="يمكنك استخدام Markdown للتنسيق..."
                                rows={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                            />
                        </div>

                        {/* Video Upload & Duration */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    فيديو الدرس
                                </label>
                                {formData.videoUrl ? (
                                    <div className="relative group">
                                        <video src={formData.videoUrl} controls className="w-full max-h-56 rounded-xl border border-gray-200" />
                                        <button type="button" onClick={() => setFormData({ ...formData, videoUrl: '' })} className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                    </div>
                                ) : (
                                    <FileUploader
                                        onUploadSuccess={(urls) => { if (urls.length > 0) setFormData({ ...formData, videoUrl: urls[0] }); }}
                                        maxFiles={1}
                                        accept={{ 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }}
                                        maxSize={500 * 1024 * 1024}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    مدة الفيديو (بالثواني)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.videoDuration}
                                    onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                                    placeholder="600"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Free Preview */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isFree"
                                checked={formData.isFree}
                                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                                درس مجاني للمعاينة
                            </label>
                        </div>

                        {/* Attachments - File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المرفقات (ملفات)
                            </label>
                            {formData.attachments.filter(a => a.trim() !== '').length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {formData.attachments.filter(a => a.trim() !== '').map((attachment, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
                                            <FiUploadCloud className="text-indigo-500" />
                                            <span className="flex-1 text-sm text-gray-700 truncate dir-ltr text-left">{attachment.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <FileUploader
                                onUploadSuccess={(urls) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        attachments: [...prev.attachments.filter(a => a.trim() !== ''), ...urls]
                                    }));
                                }}
                                maxFiles={5}
                                maxSize={100 * 1024 * 1024}
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
                                {loading ? 'جاري الحفظ...' : 'حفظ الدرس'}
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
