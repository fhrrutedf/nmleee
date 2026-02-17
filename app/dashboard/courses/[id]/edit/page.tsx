'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiSave,
    FiArrowRight,
    FiSettings,
    FiBookOpen,
    FiCheckSquare,
    FiVideo,
    FiLink
} from 'react-icons/fi';
import showToast from '@/lib/toast';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    // Tabs: settings, content, quizzes
    const [activeTab, setActiveTab] = useState('settings');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        duration: '',
        sessions: '',
        image: '',
        tags: [] as string[],
        features: [] as string[],
        isActive: true,
        // Integrations
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}`); // Assuming API endpoint exists
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    category: data.category || '',
                    duration: data.duration || '',
                    sessions: data.sessions?.toString() || '',
                    image: data.image || '',
                    tags: data.tags || [],
                    features: data.features || [],
                    isActive: data.isActive ?? true,
                    zoomLink: data.zoomLink || '',
                    meetLink: data.meetLink || '',
                });
            } else {
                showToast.error('فشل تحميل بيانات الدورة');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            showToast.error('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = showToast.loading('جاري حفظ التغييرات...');

        try {
            const response = await fetch(`/api/courses/${courseId}`, { // Assuming PUT endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null
                }),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم حفظ التغييرات بنجاح!');
            } else {
                const error = await response.json();
                showToast.dismiss(toastId);
                showToast.error(error.error || 'فشل الحفظ');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const removeFeature = (feature: string) => {
        setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">تعديل الدورة التدريبية</h1>
                    <p className="text-text-muted mt-1">{formData.title}</p>
                </div>
                <Link href="/dashboard/courses" className="btn btn-outline flex items-center gap-2">
                    <FiArrowRight />
                    <span>العودة للدورات</span>
                </Link>
            </div>

            {/* Navigation Tabs */}
            <div className="card p-0 overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-4 font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'settings'
                                ? 'border-b-2 border-action-blue text-action-blue bg-blue-50/50 dark:bg-blue-900/10'
                                : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <FiSettings /> الإعدادات العامة
                    </button>
                    <Link
                        href={`/dashboard/courses/${courseId}/content`}
                        className="px-6 py-4 font-bold flex items-center gap-2 text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                        <FiBookOpen /> محتوى الدورة (المناهج)
                    </Link>
                    <Link
                        href={`/dashboard/courses/${courseId}/quizzes`} // Assuming this path exists or will be created
                        className="px-6 py-4 font-bold flex items-center gap-2 text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                        <FiCheckSquare /> الاختبارات
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info */}
                    <div className="card space-y-6">
                        <h2 className="text-xl font-bold border-b pb-4 mb-4">بيانات الدورة</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="label">عنوان الدورة <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="label">الوصف <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={4}
                                    className="input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">السعر (ج.م) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">التصنيف</label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">اختر التصنيف</option>
                                    <option value="برمجة">برمجة</option>
                                    <option value="تصميم">تصميم</option>
                                    <option value="تسويق">تسويق</option>
                                    <option value="أعمال">أعمال</option>
                                    <option value="تطوير شخصي">تطوير شخصي</option>
                                    <option value="لغات">لغات</option>
                                    <option value="أخرى">أخرى</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">رابط صورة الغلاف</label>
                                <input
                                    type="url"
                                    className="input"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>

                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded text-action-blue"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="font-medium">نشر الدورة وإتاحتها للبيع</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Integrations */}
                    <div className="card space-y-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-card-dark dark:to-blue-900/10 border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center gap-3 border-b border-blue-100 dark:border-blue-900/30 pb-4 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-action-blue">
                                <FiLink className="text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">روابط الاجتماعات (Integrations)</h2>
                                <p className="text-sm text-text-muted">أضف روابط الاجتماعات لتسهيل الوصول للطلاب</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label flex items-center gap-2">
                                    <FiVideo className="text-blue-500" /> رابط Zoom
                                </label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://zoom.us/j/..."
                                    value={formData.zoomLink}
                                    onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label flex items-center gap-2">
                                    <FiVideo className="text-green-500" /> رابط Google Meet
                                </label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://meet.google.com/..."
                                    value={formData.meetLink}
                                    onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details (Duration, Sessions, Tags, Features) */}
                    <div className="card space-y-6">
                        <h2 className="text-xl font-bold border-b pb-4 mb-4">تفاصيل إضافية</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">المدة الزمنية</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="مثال: 4 أسابيع"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">عدد الجلسات</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="مثال: 12"
                                    value={formData.sessions}
                                    onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="label">الكلمات المفتاحية (Tags)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="input flex-1"
                                    placeholder="أضف كلمة واضغط إضافة"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <button type="button" onClick={addTag} className="btn btn-secondary">إضافة</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-red-500 hover:text-red-700">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="label">مميزات الدورة</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="input flex-1"
                                    placeholder="أضف ميزة (مثل: شهادة معتمدة)"
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <button type="button" onClick={addFeature} className="btn btn-secondary">إضافة</button>
                            </div>
                            <ul className="space-y-2">
                                {formData.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                        <span>{feature}</span>
                                        <button type="button" onClick={() => removeFeature(feature)} className="text-red-500 hover:text-red-700">حذف</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary px-8"
                        >
                            {saving ? 'جاري الحفظ...' : (
                                <span className="flex items-center gap-2">
                                    <FiSave /> حفظ التعديلات
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
