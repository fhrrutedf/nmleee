'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiSave, FiX, FiFilm, FiEye, FiImage, FiCheck,
    FiAlertCircle, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';

type PricingType = 'fixed' | 'free' | 'pwyw';

export default function NewProductPage() {
    const router = useRouter();
    const [showGuide, setShowGuide] = useState(true);
    const [loading, setLoading] = useState(false);

    // حالات رفع الملفات
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
    });

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

        setLoading(true);
        const toastId = showToast.loading('جاري الحفظ...');
        try {
            const { pricingType, ...rest } = formData;
            const res = await fetch('/api/products', {
                method: 'POST',
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
                showToast.success('تم نشر المنتج بنجاح!');
                router.push('/dashboard/products');
            } else {
                throw new Error('خطأ في الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">

            {/* رأس الصفحة */}
            <div className="mb-6">
                <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-text-muted hover:text-action-blue text-sm mb-4 transition-colors">
                    <FiArrowRight /> العودة للمنتجات
                </Link>
                <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white">إضافة منتج رقمي جديد</h1>
                <p className="text-sm text-text-muted mt-1">املأ التفاصيل وارفع ملفاتك</p>
            </div>

            {/* ═══ لوحة إرشادات جودة المنتج ═══ */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-900/20 overflow-hidden mb-5">
                <button
                    type="button"
                    onClick={() => setShowGuide(g => !g)}
                    className="w-full flex items-center justify-between p-4 text-amber-800 dark:text-amber-300 font-bold text-sm"
                >
                    <span className="flex items-center gap-2">
                        <FiAlertCircle className="text-amber-500 text-lg flex-shrink-0" />
                        📋 قواعد إنشاء منتج احترافي — التزم بها لزيادة مبيعاتك
                    </span>
                    {showGuide ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {showGuide && (
                    <div className="px-4 pb-4 space-y-3 border-t border-amber-200 dark:border-amber-800/40 pt-3">
                        {[
                            {
                                num: '١',
                                title: 'عنوان واضح ووصفي',
                                desc: 'اكتب عنواناً دقيقاً يشرح المنتج مباشرة. مثال: ✅ "دورة تصميم الجرافيك من الصفر" ❌ "دورة رائعة"',
                                color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
                            },
                            {
                                num: '٢',
                                title: 'وصف منسّق ومفصّل (لا تترك الحقل فارغاً)',
                                desc: 'استخدم المحرر لتنسيق الوصف: أضف عناوين، نقاط، صور، وأقسام واضحة. الوصف الجيد = مبيعات أكثر.',
                                color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
                            },
                            {
                                num: '٣',
                                title: 'صورة غلاف عالية الجودة (إلزامي)',
                                desc: 'ارفع صورة واضحة بأبعاد 16:9 أو 1:1. تجنّب الصور المشوّهة أو الصغيرة أو التي تحتوي نصاً كثيراً.',
                                color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
                            },
                            {
                                num: '٤',
                                title: 'ملف المنتج الأساسي (إلزامي)',
                                desc: 'تأكد أن الملف يعمل بشكل صحيح قبل الرفع. للدورات: ارفع ZIP به جميع الملفات. للكتب: PDF واضح ومرتّب.',
                                color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
                            },
                            {
                                num: '٥',
                                title: 'سعر مناسب وواضح',
                                desc: 'حدد سعراً عادلاً بناءً على قيمة المحتوى. لا تترك السعر صفراً إذا كان المنتج مدفوعاً.',
                                color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
                            },
                        ].map(rule => (
                            <div key={rule.num} className="flex gap-3 items-start">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${rule.color}`}>
                                    {rule.num}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{rule.title}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{rule.desc}</p>
                                </div>
                            </div>
                        ))}

                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl">
                            <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                                ⚠️ تحذير: المنتجات التي لا تلتزم بهذه المعايير قد يتم إخفاؤها أو حذفها من المنصة.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* ═══ المعلومات الأساسية ═══ */}
                <Section title="المعلومات الأساسية" icon={<FiPackage />}>
                    <div>
                        <label className="label">عنوان المنتج <span className="text-red-500">*</span></label>
                        <input
                            type="text" required className="input"
                            placeholder="مثال: حقيبة المصمم المحترف 2024"
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

                {/* ═══ التسعير ═══ */}
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
                                    placeholder="299"
                                    value={formData.price}
                                    onChange={e => update('price', e.target.value)}
                                />
                            </div>
                            {formData.pricingType === 'pwyw' && (
                                <div>
                                    <label className="label">الحد الأدنى (ج.م)</label>
                                    <input
                                        type="number" min="0" step="0.01" className="input"
                                        placeholder="0"
                                        value={formData.minPrice}
                                        onChange={e => update('minPrice', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                {/* ═══ صورة الغلاف ═══ */}
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
                            <FiUpload /> رفع صورة الغلاف
                        </button>
                    )}
                </Section>

                {/* ═══ الفيديو التعريفي (اختياري) ═══ */}
                <Section title="فيديو تعريفي (اختياري)" icon={<FiFilm />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">مقطع قصير يحفز المشترين على الشراء</p>

                    {formData.trailerUrl ? (
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FiFilm className="text-action-blue text-xl" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
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
                            <FiFilm /> رفع فيديو تعريفي
                        </button>
                    )}
                </Section>

                {/* ═══ معرض الصور (اختياري) ═══ */}
                <Section title="معرض صور إضافي (اختياري)" icon={<FiImage />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">أضف لقطات شاشة أو تفاصيل إضافية (متعدد)</p>

                    {formData.images.length > 0 && (
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
                            onUploadSuccess={(urls) => { update('images', [...formData.images, ...urls]); setShowGalleryUploader(false); }}
                        />
                    ) : (
                        <button type="button" onClick={() => setShowGalleryUploader(true)} className="btn btn-outline w-full sm:w-auto">
                            <FiUpload /> إضافة صور للمعرض
                        </button>
                    )}
                </Section>

                {/* ═══ ملف المنتج الأساسي ═══ */}
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
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">تم رفع الملف بنجاح</p>
                                    <p className="text-xs text-gray-500">محمي ومشفّر</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => update('fileUrl', '')} className="text-red-500 hover:text-red-700 p-1">
                                <FiX />
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
                            <FiUpload /> اسحب الملف هنا أو انقر للرفع
                        </button>
                    )}
                </Section>

                {/* ═══ ملف معاينة مجانية (اختياري) ═══ */}
                <Section title="معاينة مجانية (اختياري)" icon={<FiEye />}>
                    <p className="text-sm text-text-muted -mt-1 mb-3">عينة مجانية تزيد من فرصة الشراء</p>

                    {formData.previewFileUrl ? (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FiEye className="text-gray-500 text-xl" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
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
                            <FiEye /> رفع ملف معاينة
                        </button>
                    )}
                </Section>

                {/* ═══ أزرار الحفظ ═══ */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Link href="/dashboard/products" className="btn btn-outline flex-1 justify-center">
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !formData.image || !formData.fileUrl}
                        className="btn btn-primary flex-[2] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                جاري الحفظ...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <FiSave /> حفظ ونشر المنتج
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// مكوّن القسم المساعد
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
