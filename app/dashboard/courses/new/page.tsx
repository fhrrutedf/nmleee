'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiX, FiVideo, FiLink } from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        duration: '',
        sessions: '',
        image: '',
        fileUrl: '',
        fileType: '',
        tags: [] as string[],
        features: [] as string[],
        isActive: true,
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.price) {
            showToast.error('يرجى ملء الحقول المطلوبة');
            return;
        }

        setLoading(true);
        const toastId = showToast.loading('جاري إضافة الدورة...');

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null
                })
            });

            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم إضافة الدورة بنجاح!');
                router.push('/dashboard/courses');
            } else {
                const error = await res.json();
                showToast.dismiss(toastId);
                showToast.error(error.error || 'حدث خطأ في إضافة الدورة');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ. حاول مرة أخرى');
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">إضافة دورة تدريبية جديدة</h1>
                    <p className="text-gray-600 mt-2">املأ التفاصيل لإضافة دورة جديدة</p>
                </div>
                <Link href="/dashboard/courses" className="btn btn-outline flex items-center gap-2">
                    <FiArrowLeft />
                    <span>رجوع</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* البيانات الأساسية */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4">بيانات الدورة</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* العنوان */}
                        <div className="md:col-span-2">
                            <label className="label">عنوان الدورة <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input w-full"
                                placeholder="مثال: دورة تطوير المواقع الشاملة"
                                required
                            />
                        </div>

                        {/* الوصف */}
                        <div className="md:col-span-2">
                            <label className="label">الوصف <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input w-full"
                                rows={5}
                                placeholder="اكتب وصفاً شاملاً للدورة..."
                                required
                            />
                        </div>

                        {/* السعر */}
                        <div>
                            <label className="label">السعر (ج.م) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="input w-full"
                                placeholder="499.99"
                                required
                            />
                        </div>

                        {/* التصنيف */}
                        <div>
                            <label className="label">التصنيف</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input w-full"
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

                        {/* رابط الصورة */}
                        <div>
                            <label className="label">رابط صورة الغلاف</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="input w-full"
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="معاينة"
                                    className="mt-3 w-full h-48 object-cover rounded-lg"
                                />
                            )}
                        </div>

                        {/* الحالة */}
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded"
                                />
                                <span className="font-medium">نشر الدورة وإتاحتها للبيع</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* روابط الاجتماعات */}
                <div className="card space-y-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-card-dark dark:to-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-3 border-b border-blue-100 dark:border-blue-900/30 pb-4 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600">
                            <FiLink className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">روابط الاجتماعات (Integrations)</h2>
                            <p className="text-sm text-gray-500">أضف روابط الاجتماعات لتسهيل الوصول للطلاب</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="label flex items-center gap-2">
                                <FiVideo className="text-blue-500" /> رابط Zoom
                            </label>
                            <input
                                type="url"
                                className="input w-full"
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
                                className="input w-full"
                                placeholder="https://meet.google.com/..."
                                value={formData.meetLink}
                                onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* التفاصيل الإضافية */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4">تفاصيل إضافية</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* المدة */}
                        <div>
                            <label className="label">المدة الزمنية</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="input w-full"
                                placeholder="مثال: 8 أسابيع"
                            />
                        </div>

                        {/* عدد الجلسات */}
                        <div>
                            <label className="label">عدد الجلسات</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.sessions}
                                onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                className="input w-full"
                                placeholder="مثال: 24"
                            />
                        </div>
                    </div>

                    {/* الكلمات المفتاحية */}
                    <div>
                        <label className="label">الكلمات المفتاحية (Tags)</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="input flex-1"
                                placeholder="اضغط Enter للإضافة"
                            />
                            <button type="button" onClick={addTag} className="btn btn-secondary">إضافة</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                                        <FiX />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* المميزات */}
                    <div>
                        <label className="label">مميزات الدورة</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="input flex-1"
                                placeholder="مثال: شهادة معتمدة"
                            />
                            <button type="button" onClick={addFeature} className="btn btn-secondary">إضافة</button>
                        </div>
                        <ul className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span>{feature}</span>
                                    <button type="button" onClick={() => removeFeature(feature)} className="text-red-500 hover:text-red-700">
                                        حذف
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2 px-8"
                    >
                        <FiSave />
                        <span>{loading ? 'جاري الحفظ...' : 'حفظ الدورة'}</span>
                    </button>
                    <Link href="/dashboard/courses" className="btn btn-outline">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
