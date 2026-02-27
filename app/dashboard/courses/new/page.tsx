'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiVideo, FiLink, FiBookOpen, FiTag, FiStar } from 'react-icons/fi';
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
        image: '',
        trailerUrl: '',
        isActive: true,
        // التفاصيل الإضافية
        duration: '',
        sessions: '',
        tags: [] as string[],
        features: [] as string[],
        // روابط الاجتماعات
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.price || !formData.category) {
            showToast.error('يرجى ملء الحقول المطلوبة');
            return;
        }

        setLoading(true);
        const toastId = showToast.loading('جاري إنشاء الدورة...');

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null,
                })
            });

            if (res.ok) {
                const course = await res.json();
                showToast.dismiss(toastId);
                showToast.success('تمت مبدئياً! سيتم تحويلك لإضافة المنهج...');
                router.push(`/dashboard/courses/${course.id}/content`);
            } else {
                const error = await res.json();
                showToast.dismiss(toastId);
                showToast.error(error.error || 'حدث خطأ في إنشاء الدورة');
            }
        } catch (error) {
            console.error('Error creating course:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">إنشاء دورة تدريبية جديدة</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">أدخل جميع تفاصيل الدورة لإنشائها</p>
                </div>
                <Link href="/dashboard/courses" className="btn btn-outline flex items-center gap-2">
                    <FiArrowLeft />
                    <span>رجوع</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* البيانات الأساسية */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-action-blue">
                            <FiBookOpen className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">البيانات الأساسية</h2>
                            <p className="text-sm text-text-muted">المعلومات الرئيسية للدورة</p>
                        </div>
                    </div>

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
                                rows={4}
                                placeholder="اكتب وصفاً شاملاً للدورة يوضح ما سيتعلمه الطالب..."
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
                                placeholder="مثال: 499.00 أو 0 للمجاني"
                                required
                            />
                        </div>

                        {/* التصنيف */}
                        <div>
                            <label className="label">التصنيف <span className="text-red-500">*</span></label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input w-full"
                                required
                            >
                                <option value="">اختر التصنيف المناسب</option>
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
                                placeholder="https://example.com/cover-image.jpg"
                            />
                        </div>

                        {/* رابط الفيديو التعريفي */}
                        <div>
                            <label className="label">رابط الفيديو التعريفي (اختياري)</label>
                            <input
                                type="url"
                                value={formData.trailerUrl}
                                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                className="input w-full"
                                placeholder="https://youtube.com/watch?v=... أو Vimeo"
                            />
                        </div>

                        {/* الحالة */}
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-action-blue rounded focus:ring-action-blue"
                                />
                                <div>
                                    <span className="font-bold text-gray-800 dark:text-gray-100 block">نشر الدورة وإتاحتها للبيع</span>
                                    <span className="text-sm text-text-muted">يمكنك تغيير هذا لاحقاً</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {formData.image && (
                        <img
                            src={formData.image}
                            alt="معاينة"
                            className="mt-3 w-full max-w-sm h-48 object-cover rounded-xl border border-gray-100"
                        />
                    )}
                </div>

                {/* روابط الاجتماعات */}
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

                {/* تفاصيل إضافية */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600">
                            <FiStar className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">تفاصيل إضافية</h2>
                            <p className="text-sm text-text-muted">معلومات تساعد الطلاب على فهم الدورة بشكل أفضل</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">المدة الزمنية</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="مثال: 4 أسابيع"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">عدد الجلسات</label>
                            <input
                                type="number"
                                className="input w-full"
                                placeholder="مثال: 12"
                                value={formData.sessions}
                                onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <FiTag className="text-gray-500" /> الكلمات المفتاحية (Tags)
                        </label>
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
                                <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="text-red-400 hover:text-red-600 font-bold">&times;</button>
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
                                <li key={idx} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        {feature}
                                    </span>
                                    <button type="button" onClick={() => removeFeature(feature)} className="text-red-500 hover:text-red-700 text-sm font-medium">حذف</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FiSave className="text-xl" />
                        )}
                        <span>{loading ? 'جاري الإنشاء...' : 'حفظ والانتقال للمحتوى (فيديوهات)'}</span>
                    </button>
                    <Link href="/dashboard/courses" className="btn btn-outline py-3 px-6 text-lg">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
