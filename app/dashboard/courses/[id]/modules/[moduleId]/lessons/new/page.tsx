'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';

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
                alert(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            alert('حدث خطأ أثناء إنشاء الدرس');
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

                        {/* Video URL & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رابط الفيديو
                                </label>
                                <input
                                    type="url"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    placeholder="https://example.com/video.mp4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
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

                        {/* Attachments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المرفقات (روابط)
                            </label>
                            <div className="space-y-2">
                                {formData.attachments.map((attachment, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="url"
                                            value={attachment}
                                            onChange={(e) => updateAttachment(index, e.target.value)}
                                            placeholder="https://example.com/file.pdf"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        {formData.attachments.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addAttachment}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                + إضافة مرفق
                            </button>
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
