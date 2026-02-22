'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiUpload, FiDollarSign, FiPackage, FiSave, FiX, FiFilm, FiLink, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // File upload states
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
        image: '',                     // صورة الغلاف الرئيسية
        images: [] as string[],        // معرض صور المنتج
        fileUrl: '',                   // رابط الملف الأساسي
        fileType: 'pdf',               // نوع الملف
        trailerUrl: '',                // فيديو تعريفي 
        previewFileUrl: '',            // معاينة مجانية (للملفات أو الفيديوهات المفتوحة)
        pricingType: 'fixed',          // 'fixed', 'free', 'pwyw'
        minPrice: '',
        suggestedPrice: '',
    });

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

        if (!formData.image) {
            return showToast.error('يرجى اختيار صورة الغلاف المنتج');
        }
        if (!formData.fileUrl) {
            return showToast.error('يرجى رفع ملف المنتج الرقمي الأساسي');
        }

        setLoading(true);

        const toastId = showToast.loading('جاري حفظ المنتج...');

        try {
            const { pricingType, ...dataToSend } = formData;
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...dataToSend,
                    price: formData.pricingType === 'free' ? 0 : parseFloat(formData.price || '0'),
                    minPrice: formData.pricingType === 'pwyw' ? parseFloat(formData.minPrice || '0') : null,
                    suggestedPrice: formData.pricingType === 'pwyw' && formData.suggestedPrice ? parseFloat(formData.suggestedPrice) : null,
                    isFree: formData.pricingType === 'free',
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
                <p className="text-text-muted mt-2">املأ التفاصيل وارفع ملفاتك بأي حجم للمنتج الرقمي</p>
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
                            <label className="label">وصف احترافي ومفصل للمنتج <span className="text-red-500">*</span></label>
                            <div className="mt-1">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) => setFormData({ ...formData, description: val })}
                                />
                            </div>
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
                            <label className="label">نوع التسعير <span className="text-red-500">*</span></label>
                            <select
                                className="input bg-white dark:bg-gray-800"
                                value={formData.pricingType}
                                onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                            >
                                <option value="fixed">سعر ثابت</option>
                                <option value="pwyw">تسعير مرن (ادفع ما تريد)</option>
                                <option value="free">مجاني بالكامل</option>
                            </select>
                        </div>

                        {formData.pricingType !== 'free' && (
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
                                        placeholder={formData.pricingType === 'pwyw' ? "مثلاً: 100" : "299"}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                {formData.pricingType === 'pwyw' && (
                                    <p className="text-xs text-text-muted mt-1">
                                        السعر الأساسي للمنتج. يمكن للعميل تعديله بناءً على رغبته (إذا قمت بإعداد تسعير مرن).
                                    </p>
                                )}
                            </div>
                        )}

                        {formData.pricingType === 'pwyw' && (
                            <>
                                <div>
                                    <label className="label">الحد الأدنى للسعر (ج.م)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input"
                                        placeholder="0 يعنى يمكنه الحصول عليه مجاناً"
                                        value={formData.minPrice}
                                        onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">السعر المقترح (ج.م) (اختياري)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input"
                                        placeholder="شجع العميل للدفع"
                                        value={formData.suggestedPrice}
                                        onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className={formData.pricingType === 'free' || formData.pricingType === 'pwyw' ? "md:col-span-1" : "md:col-span-1"}>
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

                {/* Media Presentation Section */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <FiFilm className="text-action-blue" /> العرض المرئي والمقاطع (المعرض)
                    </h2>

                    <div className="grid gap-6">
                        {/* صورة الغلاف الرئيسية */}
                        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl relative">
                            <h3 className="font-semibold text-lg mb-2">صورة المنتج الرئيسية <span className="text-red-500">*</span></h3>
                            <p className="text-sm text-gray-500 mb-4">الصورة المصغرة التي ستظهر كغلاف لمنتجك.</p>

                            {formData.image ? (
                                <div className="relative">
                                    <img src={formData.image} alt="Preview" className="w-full max-w-sm h-64 object-cover rounded-xl border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ) : showCoverUploader ? (
                                <FileUploader
                                    maxFiles={1}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                    onUploadSuccess={(urls: string[]) => {
                                        setFormData({ ...formData, image: urls[0] });
                                        setShowCoverUploader(false);
                                    }}
                                />
                            ) : (
                                <button type="button" onClick={() => setShowCoverUploader(true)} className="btn btn-outline text-sm py-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
                                    رفع صورة رئيسية
                                </button>
                            )}
                        </div>

                        {/* معرض الصور الإضافية */}
                        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl relative">
                            <h3 className="font-semibold text-lg mb-2">معرض الصور الإضافية (اختياري)</h3>
                            <p className="text-sm text-gray-500 mb-4">أضف لقطات شاشة أو تفاصيل إضافية للمنتج (متعدد).</p>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {formData.images.map((imgUrl, i) => (
                                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden border">
                                            <img src={imgUrl} className="w-full h-full object-cover" alt="gallery" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, images: formData.images.filter(x => x !== imgUrl) })}
                                                className="absolute top-1 left-1 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showGalleryUploader ? (
                                <FileUploader
                                    maxFiles={5}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                    onUploadSuccess={(urls: string[]) => {
                                        setFormData({ ...formData, images: [...formData.images, ...urls] });
                                        setShowGalleryUploader(false);
                                    }}
                                />
                            ) : (
                                <button type="button" onClick={() => setShowGalleryUploader(true)} className="btn btn-outline text-sm py-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
                                    إضافة صور للمعرض
                                </button>
                            )}
                        </div>

                        {/* فيديو ترويجي إعلاني */}
                        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl relative">
                            <h3 className="font-semibold text-lg mb-2">الفيديو التعريفي / التريلر (Trailer) (اختياري)</h3>
                            <p className="text-sm text-gray-500 mb-4">ارفع مقطعاً قصيراً يحفز المشترين.</p>

                            {formData.trailerUrl ? (
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-card-white border border-blue-200 dark:border-gray-700 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-action-blue/20 p-2 rounded-lg text-action-blue"><FiFilm size={24} /></div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-xs">{formData.trailerUrl.split('/').pop()}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFormData({ ...formData, trailerUrl: '' })} className="text-red-500 hover:text-red-700 p-2"><FiX /></button>
                                </div>
                            ) : showTrailerUploader ? (
                                <FileUploader
                                    maxFiles={1}
                                    accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] }}
                                    onUploadSuccess={(urls: string[]) => {
                                        setFormData({ ...formData, trailerUrl: urls[0] });
                                        setShowTrailerUploader(false);
                                    }}
                                />
                            ) : (
                                <button type="button" onClick={() => setShowTrailerUploader(true)} className="btn btn-outline text-sm py-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
                                    رفع فيديو تعريفي
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secure Files Upload Section */}
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <FiUpload className="text-action-blue" /> رفع ملفات المنتج (عقب الشراء)
                    </h2>

                    <div className="grid gap-6">

                        {/* الملف الأساسي المشفر */}
                        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-5 rounded-2xl relative">
                            <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">ملف المنتج الأساسي <span className="text-red-500">*</span></h3>
                            <p className="text-sm text-gray-500 mb-4">هذا هو الملف (أو المجلد المضغوط) الرئيسي الذي سيحصل عليه المشتري فقط بعد إتمام الدفع بنجاح. يتم تشفير الرابط وحمايته.</p>

                            {formData.fileUrl ? (
                                <div className="bg-white dark:bg-card-white p-4 rounded-xl border border-green-500 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><FiLink className="text-green-600 dark:text-green-300" /></div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">تم تأمين الملف وجاهز للتسليم للعملاء</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFormData({ ...formData, fileUrl: '' })} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"><FiX /></button>
                                </div>
                            ) : showFileUploader ? (
                                <FileUploader
                                    maxFiles={1}
                                    isPrivate={true}  // Concept property showing UX of secure upload
                                    onUploadSuccess={(urls: string[], names?: string[]) => {
                                        setFormData({
                                            ...formData,
                                            fileUrl: urls[0],
                                            // Extract simple mock type based on file extension
                                            fileType: names && names[0] ? getFileType(names[0]) : 'other'
                                        });
                                        setShowFileUploader(false);
                                    }}
                                />
                            ) : (
                                <button type="button" onClick={() => setShowFileUploader(true)} className="btn bg-green-600 text-white hover:bg-green-700 border-none text-sm py-3 px-6 shadow-sm hover:-translate-y-0.5 transition-all">
                                    اسحب وأفلت الملف الأساسي هنا (آمن)
                                </button>
                            )}
                        </div>

                        {/* ملف المعاينة المجانية */}
                        <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl relative">
                            <h3 className="font-semibold text-lg mb-2">ملف معاينة مجانية (اختياري)</h3>
                            <p className="text-sm text-gray-500 mb-4">تقديم عينة مجانية (Preview) يزيد من فرصة الشراء. ارفع جزء مصغر من المنتج (مثلاً، أول فصل من الكتاب بصيغة PDF).</p>

                            {formData.previewFileUrl ? (
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-card-white border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-300"><FiEye size={24} /></div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-xs">{formData.previewFileUrl.split('/').pop()}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFormData({ ...formData, previewFileUrl: '' })} className="text-red-500 hover:text-red-700 p-2"><FiX /></button>
                                </div>
                            ) : showPreviewUploader ? (
                                <FileUploader
                                    maxFiles={1}
                                    onUploadSuccess={(urls: string[]) => {
                                        setFormData({ ...formData, previewFileUrl: urls[0] });
                                        setShowPreviewUploader(false);
                                    }}
                                />
                            ) : (
                                <button type="button" onClick={() => setShowPreviewUploader(true)} className="btn btn-outline text-sm py-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
                                    رفع ملف معاينة
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 sticky bottom-6 bg-white/80 dark:bg-bg-light/80 p-4 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <Link href="/dashboard/products" className="btn btn-outline flex-1 text-center justify-center py-3">
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !formData.image || !formData.fileUrl}
                        className="btn btn-primary flex-[2] shadow-xl shadow-action-blue/20 hover:shadow-2xl hover:shadow-action-blue/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed py-3"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الحفظ والتشفير...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2 px-8">
                                <FiSave className="text-lg" /> حفظ ونشر المنتج للمشترين
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
