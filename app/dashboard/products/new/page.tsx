'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiUpload, FiDollarSign, FiPackage, FiImage, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: '',
        fileUrl: '',
        fileType: 'pdf',
        tags: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });

            if (response.ok) {
                router.push('/dashboard/products');
            } else {
                alert('حدث خطأ أثناء إضافة المنتج');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('حدث خطأ أثناء إضافة المنتج');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/products" className="text-text-muted hover:text-action-blue flex items-center gap-2 mb-4 transition-colors">
                    <FiArrowRight />
                    <span>العودة للمنتجات</span>
                </Link>
                <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">إضافة منتج رقمي جديد</h1>
                <p className="text-text-muted mt-2">املأ التفاصيل أدناه لنشر منتجك الرقمي للبيع</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <FiPackage className="text-action-blue" /> المعلومات الأساسية
                    </h2>

                    <div className="grid gap-6">
                        <div>
                            <label className="label">عنوان المنتج <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="مثال: حقيبة المصمم المحترف 2024"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">الوصف <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                rows={5}
                                className="input resize-none"
                                placeholder="اكتب وصفاً جذاباً يشرح مميزات المنتج وما سيحصل عليه العميل..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Details Section */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <FiDollarSign className="text-action-blue" /> التسعير والتصنيف
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">السعر (ج.م) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">ج.م</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input pr-10"
                                    placeholder="299"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">التصنيف</label>
                            <select
                                className="input bg-white dark:bg-gray-800"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">اختر التصنيف المناسب</option>
                                <option value="courses">دورات تدريبية</option>
                                <option value="ebooks">كتب إلكترونية</option>
                                <option value="templates">قوالب ومصادر</option>
                                <option value="software">برمجيات وأدوات</option>
                                <option value="graphics">جرافيك وتصاميم</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">الوسوم (Tags)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="اكتب الوسوم وافصل بينها بفاصلة (مثال: تصميم, فوتوشوب, جرافيك)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                </div>

                {/* Media & Files Section */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <FiUpload className="text-action-blue" /> الملفات والوسائط
                    </h2>

                    <div className="grid gap-6">
                        <div>
                            <label className="label">رابط صورة المنتج (URL)</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                صورة الغلاف ستظهر في صفحة المنتج والمتجر. يفضل استخدام أبعاد مربعة (1080x1080).
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-lg mb-4 text-action-blue">ملف المنتج الرقمي</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">رابط التحميل المباشر <span className="text-red-500">*</span></label>
                                    <input
                                        type="url"
                                        required
                                        className="input bg-white dark:bg-gray-800"
                                        placeholder="https://drive.google.com/..."
                                        value={formData.fileUrl}
                                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                                    />
                                    <p className="text-xs text-text-muted mt-2">
                                        هذا هو الرابط الذي سيصل للعميل بعد إتمام عملية الدفع. تأكد من أن الرابط "عام" أو قابل للوصول.
                                    </p>
                                </div>

                                <div>
                                    <label className="label">نوع الملف</label>
                                    <select
                                        className="input bg-white dark:bg-gray-800"
                                        value={formData.fileType}
                                        onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                                    >
                                        <option value="pdf">ملف PDF</option>
                                        <option value="video">فيديو</option>
                                        <option value="zip">ملف مضغوط (ZIP)</option>
                                        <option value="audio">ملف صوتي</option>
                                        <option value="document">مستند نصي</option>
                                        <option value="other">رابط خارجي / آخر</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                    <Link href="/dashboard/products" className="btn btn-outline flex-1 text-center justify-center">
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex-[2] shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الحفظ...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-8">
                                <FiSave /> حفظ ونشر المنتج
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
