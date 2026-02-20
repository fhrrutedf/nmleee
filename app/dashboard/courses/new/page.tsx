'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
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
        isActive: true,
    });

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
                })
            });

            if (res.ok) {
                const course = await res.json();
                showToast.dismiss(toastId);
                showToast.success('تمت مبدئياً! سيتم تحويلك لإكمال التفاصيل...');
                // Redirect to the edit page where the user has full permissions
                router.push(`/dashboard/courses/${course.id}/edit`);
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">إنشاء دورة تدريبية جديدة</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">خطوة 1: أدخل المعلومات الأساسية للدورة</p>
                </div>
                <Link href="/dashboard/courses" className="btn btn-outline flex items-center gap-2">
                    <FiArrowLeft />
                    <span>رجوع</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* البيانات الأساسية */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">البيانات الأساسية</h2>
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
                            <label className="label">الوصف المبدئي <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input w-full"
                                rows={4}
                                placeholder="اكتب وصفاً مختصراً للدورة..."
                                required
                            />
                        </div>

                        {/* السعر */}
                        <div>
                            <label className="label">السعر المستهدف (ج.م) <span className="text-red-500">*</span></label>
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
                            <label className="label">التصنيف الأساسي <span className="text-red-500">*</span></label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input w-full required"
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
                        <div className="md:col-span-2">
                            <label className="label">رابط صورة الغلاف (اختياري)</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="input w-full"
                                placeholder="https://example.com/cover-image.jpg"
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="معاينة"
                                    className="mt-3 w-full max-w-sm h-48 object-cover rounded-xl border border-gray-100"
                                />
                            )}
                        </div>

                        {/* الحالة */}
                        <div className="md:col-span-2 flex items-center pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-action-blue rounded focus:ring-action-blue"
                                />
                                <div>
                                    <span className="font-bold text-gray-800 dark:text-gray-100 block">النشر الفوري</span>
                                    <span className="text-sm text-text-muted">ستكون الدورة مرئية للطلاب فور إنشائها. يمكنك تغيير هذا لاحقاً من التعديل.</span>
                                </div>
                            </label>
                        </div>
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
                        <span>{loading ? 'جاري الإنشاء...' : 'إنشاء الدورة والانتقال للتفاصيل'}</span>
                    </button>
                    <Link href="/dashboard/courses" className="btn btn-outline py-3 px-6 text-lg">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
