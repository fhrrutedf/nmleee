'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiSave, FiX, FiFilm, FiEye, FiImage, FiCheck
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';

type PricingType = 'fixed' | 'free' | 'pwyw';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Upload states
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showGalleryUploader, setShowGalleryUploader] = useState(false);
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);
    const [showPreviewUploader, setShowPreviewUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        tags: '',
        image: '',
        images: [] as string[],
        fileUrl: '',
        fileType: 'pdf',
        trailerUrl: '',
        previewFileUrl: '',
        pricingType: 'fixed' as PricingType,
        minPrice: '',
        suggestedPrice: '',
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            if (response.ok) {
                const data = await response.json();

                // Determine pricing type
                let pType: PricingType = 'fixed';
                if (data.isFree || data.price === 0) pType = 'free';
                else if (data.minPrice !== null && data.minPrice !== undefined) pType = 'pwyw';

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price ? data.price.toString() : '',
                    category: data.category || '',
                    tags: data.tags ? data.tags.join(', ') : '',
                    image: data.image || '',
                    images: data.images || [],
                    fileUrl: data.fileUrl || '',
                    fileType: data.fileType || 'pdf',
                    trailerUrl: data.trailerUrl || '',
                    previewFileUrl: data.previewFileUrl || '',
                    pricingType: pType,
                    minPrice: data.minPrice ? data.minPrice.toString() : '',
                    suggestedPrice: data.suggestedPrice ? data.suggestedPrice.toString() : '',
                    isActive: data.isActive ?? true,
                    displayOrder: data.displayOrder || 0
                });
            } else {
                showToast.error('المنتج غير موجود');
                router.push('/dashboard/products');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast.error('حدث خطأ أثناء جلب بيانات المنتج');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const getFileType = (name: string) => {
        if (name.includes('pdf')) return 'pdf';
        if (name.includes('video') || name.match(/\.(mp4|mov|avi|mkv)$/i)) return 'video';
        if (name.match(/\.(zip|rar)$/i)) return 'zip';
        if (name.match(/\.(mp3|wav)$/i)) return 'audio';
        return 'other';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف');
        if (!formData.fileUrl) return showToast.error('يرجى رفع ملف المنتج الأساسي');

        setSaving(true);
        const toastId = showToast.loading('جاري حفظ التعديلات...');
        try {
            const { pricingType, ...rest } = formData;
            const res = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...rest,
                    price: pricingType === 'free' ? 0 : parseFloat(formData.price || '0'),
                    isFree: pricingType === 'free',
                    minPrice: pricingType === 'pwyw' ? parseFloat(formData.minPrice || '0') : null,
                    suggestedPrice: pricingType === 'pwyw' && formData.suggestedPrice ? parseFloat(formData.suggestedPrice) : null,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم حفظ التعديلات بنجاح! ✅');
                router.push('/dashboard/products');
            } else {
                throw new Error('خطأ في الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء حفظ التعديلات');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-text-muted hover:text-action-blue text-sm mb-4 transition-colors">
                        <FiArrowRight /> العودة للمنتجات
                    </Link>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white">تعديل المنتج</h1>
                    <p className="text-sm text-text-muted mt-1">{formData.title}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {formData.isActive ? 'نشط ومرئي' : 'غير مدرج'}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <Section title="المعلومات الأساسية" icon={<FiPackage />}>
                    <div>
                        <label className="label">عنوان المنتج <span className="text-red-500">*</span></label>
                        <input
                            type="text" required className="input"
                            value={formData.title}
                            onChange={e => update('title', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label">وصف المنتج <span className="text-red-500">*</span></label>
                        <div className="mt-1">
                            <RichTextEditor
                                value={formData.description}
                                onChange={val => update('description', val)}
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">التصنيف</label>
                            <select className="input bg-white dark:bg-gray-800" value={formData.category} onChange={e => update('category', e.target.value)}>
                                <option value="">اختر التصنيف</option>
                                <option value="courses">دورات تدريبية</option>
                                <option value="ebooks">كتب إلكترونية</option>
                                <option value="templates">قوالب ومصادر</option>
                                <option value="software">برمجيات وأدوات</option>
                                <option value="graphics">جرافيك وتصاميم</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">الوسوم (Tags)</label>
                            <input
                                type="text" className="input"
                                placeholder="تصميم, فوتوشوب, جرافيك"
                                value={formData.tags}
                                onChange={e => update('tags', e.target.value)}
                            />
                        </div>
                    </div>
                </Section>

                {/* Pricing */}
                <Section title="التسعير" icon={<FiDollarSign />}>
                    <div>
                        <label className="label">نوع التسعير</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'fixed', label: 'سعر ثابت' },
                                { value: 'pwyw', label: 'ادفع ما تريد' },
                                { value: 'free', label: 'مجاني' },
                            ].map(opt => (
                                <button
                                    key={opt.value} type="button"
                                    onClick={() => update('pricingType', opt.value)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${formData.pricingType === opt.value
                                        ? 'border-action-blue bg-action-blue/10 text-action-blue'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-action-blue/50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {formData.pricingType !== 'free' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">السعر (ج.م) <span className="text-red-500">*</span></label>
                                <input
                                    type="number" required min="0" step="0.01" className="input"
                                    value={formData.price}
                                    onChange={e => update('price', e.target.value)}
                                />
                            </div>
                            {formData.pricingType === 'pwyw' && (
                                <div>
                                    <label className="label">الحد الأدنى (ج.م)</label>
                                    <input
                                        type="number" min="0" step="0.01" className="input"
                                        value={formData.minPrice}
                                        onChange={e => update('minPrice', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                {/* Cover Image */}
                <Section title="صورة الغلاف" icon={<FiImage />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">الصورة المصغرة التي ستظهر كغلاف للمنتج <span className="text-red-500">*</span></p>

                    {formData.image ? (
                        <div className="relative w-full max-w-xs">
                            <img src={formData.image} alt="غلاف" className="w-full aspect-video object-cover rounded-xl border border-gray-200" />
                            <button
                                type="button"
                                onClick={() => { update('image', ''); setShowCoverUploader(false); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ) : showCoverUploader ? (
                        <FileUploader
                            maxFiles={1}
                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                            onUploadSuccess={(urls) => { update('image', urls[0]); setShowCoverUploader(false); }}
                        />
                    ) : (
                        <button type="button" onClick={() => setShowCoverUploader(true)} className="btn btn-outline w-full sm:w-auto">
                            <FiUpload /> رفع/تغيير صورة الغلاف
                        </button>
                    )}
                </Section>

                {/* Trailer Video */}
                <Section title="فيديو تعريفي (اختياري)" icon={<FiFilm />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">مقطع قصير يحفز المشترين على الشراء</p>

                    {formData.trailerUrl ? (
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FiFilm className="text-action-blue text-xl" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]" dir="ltr">
                                    {formData.trailerUrl.split('/').pop()}
                                </span>
                            </div>
                            <button type="button" onClick={() => update('trailerUrl', '')} className="text-red-500 hover:text-red-700 p-1">
                                <FiX />
                            </button>
                        </div>
                    ) : showTrailerUploader ? (
                        <FileUploader
                            maxFiles={1}
                            accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] }}
                            onUploadSuccess={(urls) => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }}
                        />
                    ) : (
                        <button type="button" onClick={() => setShowTrailerUploader(true)} className="btn btn-outline w-full sm:w-auto">
                            <FiUpload /> رفع فيديو تعريفي
                        </button>
                    )}
                </Section>

                {/* Gallery */}
                <Section title="معرض صور إضافي (اختياري)" icon={<FiImage />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">أضف لقطات شاشة أو تفاصيل إضافية (متعدد)</p>

                    {formData.images?.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {formData.images.map((url, i) => (
                                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => update('images', formData.images.filter((_, idx) => idx !== i))}
                                        className="absolute top-1 left-1 bg-red-500/80 text-white w-5 h-5 rounded-full flex items-center justify-center"
                                    >
                                        <FiX size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {showGalleryUploader ? (
                        <FileUploader
                            maxFiles={5}
                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                            onUploadSuccess={(urls) => { update('images', [...(formData.images || []), ...urls]); setShowGalleryUploader(false); }}
                        />
                    ) : (
                        <button type="button" onClick={() => setShowGalleryUploader(true)} className="btn btn-outline w-full sm:w-auto">
                            <FiUpload /> إضافة صور للمعرض
                        </button>
                    )}
                </Section>

                {/* Main Product File */}
                <Section title="ملف المنتج الأساسي" icon={<FiUpload />} accent>
                    <p className="text-sm text-text-muted -mt-1 mb-3">
                        الملف الذي سيحصل عليه المشتري بعد الدفع <span className="text-red-500">*</span>
                    </p>

                    {formData.fileUrl ? (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <FiCheck className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">الملف موجود ومحمي</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]" dir="ltr">{formData.fileUrl.split('/').pop()}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => update('fileUrl', '')} className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-xs font-bold">
                                <FiX /> استبدال
                            </button>
                        </div>
                    ) : showFileUploader ? (
                        <FileUploader
                            maxFiles={1}
                            isPrivate={true}
                            onUploadSuccess={(urls, names) => {
                                update('fileUrl', urls[0]);
                                if (names?.[0]) update('fileType', getFileType(names[0]));
                                setShowFileUploader(false);
                            }}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowFileUploader(true)}
                            className="w-full py-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <FiUpload /> ارفع ملفاً جديداً
                        </button>
                    )}
                </Section>

                {/* Free Preview (Optional) */}
                <Section title="معاينة مجانية (اختياري)" icon={<FiEye />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">عينة مجانية تزيد من فرصة الشراء</p>

                    {formData.previewFileUrl ? (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FiEye className="text-gray-500 text-xl" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]" dir="ltr">
                                    {formData.previewFileUrl.split('/').pop()}
                                </span>
                            </div>
                            <button type="button" onClick={() => update('previewFileUrl', '')} className="text-red-500 hover:text-red-700 p-1">
                                <FiX />
                            </button>
                        </div>
                    ) : showPreviewUploader ? (
                        <FileUploader
                            maxFiles={1}
                            onUploadSuccess={(urls) => { update('previewFileUrl', urls[0]); setShowPreviewUploader(false); }}
                        />
                    ) : (
                        <button type="button" onClick={() => setShowPreviewUploader(true)} className="btn btn-outline w-full sm:w-auto">
                            <FiUpload /> رفع ملف معاينة
                        </button>
                    )}
                </Section>

                {/* Display Settings */}
                <Section title="إعدادات الظهور" icon={<FiPackage />}>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 rounded border-gray-300 text-action-blue focus:ring-action-blue"
                            checked={!formData.isActive}
                            onChange={(e) => update('isActive', !e.target.checked)}
                        />
                        <div>
                            <label htmlFor="isActive" className="font-bold cursor-pointer block text-primary-charcoal dark:text-white">
                                إخفاء المنتج من المتجر
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                إذا تم الإخفاء، يمكن الوصول للمنتج عبر الرابط المباشر فقط.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="label">ترتيب المنتج (رقم)</label>
                        <input
                            type="number" className="input" min="0"
                            value={formData.displayOrder}
                            onChange={e => update('displayOrder', parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-text-muted mt-1">الرقم الأصغر يظهر أولاً.</p>
                    </div>
                </Section>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Link href="/dashboard/products" className="btn btn-outline flex-1 justify-center">
                        إلغاء التعديلات
                    </Link>
                    <button
                        type="submit"
                        disabled={saving || !formData.image || !formData.fileUrl}
                        className="btn btn-primary flex-[2] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الحفظ...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <FiSave /> حفظ التعديلات
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Helper Section Comp
function Section({
    title, icon, children, accent = false
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div className={`rounded-2xl border p-5 space-y-4 ${accent
            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-card-white border-gray-100 dark:border-gray-800'
            }`}>
            <h2 className="font-bold text-base flex items-center gap-2 text-primary-charcoal dark:text-white">
                <span className="text-action-blue">{icon}</span>
                {title}
            </h2>
            {children}
        </div>
    );
}
