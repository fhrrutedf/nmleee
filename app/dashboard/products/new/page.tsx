'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiUpload, FiDollarSign, FiPackage, FiImage, FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingProduct, setUploadingProduct] = useState(false);
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

    // رفع صورة المنتج
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            showToast.error('يرجى اختيار صورة فقط');
            return;
        }

        setUploading(true);
        const toastId = showToast.loading('جاري رفع الصورة...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('فشل رفع الصورة');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, image: data.url }));
            showToast.dismiss(toastId);
            showToast.success('تم رفع الصورة بنجاح!');
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast.dismiss(toastId);
            showToast.error('فشل رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    // رفع ملف المنتج
    const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingProduct(true);
        const toastId = showToast.loading('جاري رفع الملف...');

        try {
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataObj,
            });

            if (!response.ok) {
                throw new Error('فشل رفع الملف');
            }

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                fileUrl: data.url,
                fileType: getFileType(file.type),
            }));
            showToast.dismiss(toastId);
            showToast.success('تم رفع الملف بنجاح!');
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast.dismiss(toastId);
            showToast.error('فشل رفع الملف');
        } finally {
            setUploadingProduct(false);
        }
    };

    // تحديد نوع الملف
    const getFileType = (mimeType: string): string => {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('video')) return 'video';
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'zip';
        if (mimeType.includes('audio')) return 'audio';
        if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
        return 'other';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const toastId = showToast.loading('جاري حفظ المنتج...');

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
                showToast.dismiss(toastId);
                showToast.success('تم إضافة المنتج بنجاح!');
                router.push('/dashboard/products');
            } else {
                throw new Error('فشل إضافة المنتج');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء إضافة المنتج');
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
                        {/* صورة المنتج */}
                        <div>
                            <label className="label flex items-center gap-2">
                                <FiImage /> صورة المنتج <span className="text-red-500">*</span>
                            </label>

                            {formData.image ? (
                                <div className="relative">
                                    <img
                                        src={formData.image}
                                        alt="Product preview"
                                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-action-blue hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <FiUpload className="text-4xl text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {uploading ? 'جاري الرفع...' : 'انقر لرفع صورة أو اسحب هنا'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP (حد أقصى 50MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            )}

                            <p className="text-xs text-text-muted mt-2">
                                صورة الغلاف ستظهر في صفحة المنتج والمتجر. يفضل استخدام أبعاد مربعة (1080x1080).
                            </p>
                        </div>

                        {/* ملف المنتج */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h3 className="font-bold text-lg mb-4 text-action-blue">ملف المنتج الرقمي</h3>
                            <div className="space-y-4">
                                {formData.fileUrl ? (
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-green-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">تم رفع الملف بنجاح ✅</p>
                                                <a
                                                    href={formData.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-action-blue hover:underline truncate block mt-1"
                                                >
                                                    {formData.fileUrl}
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, fileUrl: '', fileType: 'pdf' })}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FiX className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:border-action-blue hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all">
                                        <div className="flex flex-col items-center justify-center">
                                            <FiUpload className="text-3xl text-blue-500 mb-2" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {uploadingProduct ? 'جاري الرفع...' : 'ارفع ملف المنتج من جهازك'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PDF, ZIP, Video, Audio (حد أقصى 50MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleProductFileUpload}
                                            disabled={uploadingProduct}
                                        />
                                    </label>
                                )}

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
                        disabled={loading || !formData.image || !formData.fileUrl}
                        className="btn btn-primary flex-[2] shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
