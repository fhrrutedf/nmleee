'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiX, FiImage, FiCheck, FiArrowLeft, FiFilm, FiEye, FiLayers, FiPlus, FiSave, FiLock, FiCheckSquare
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';

type PricingType = 'fixed' | 'free' | 'pwyw';

const steps = [
    { id: 1, label: 'أصول المنتج' },
    { id: 2, label: 'الهوية والتسويق' },
    { id: 3, label: 'التسعير والعرض' },
];

export default function NewProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Upload Toggles
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showGalleryUploader, setShowGalleryUploader] = useState(false);
    const [showPreviewUploader, setShowPreviewUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: '',
        price: '',
        image: '',
        images: [] as string[],
        fileUrl: '',
        fileType: 'pdf',
        trailerUrl: '',
        previewFileUrl: '',
        pricingType: 'fixed' as PricingType,
        minPrice: '',
        suggestedPrice: '',
        originalPrice: '',
        enablePPP: false,
        prerequisites: '',
        upsellProductId: '',
        upsellPrice: '',
        offerExpiresAt: '',
        isActive: true, // Default to show
    });

    // Load Draft
    useEffect(() => {
        const saved = localStorage.getItem('product_draft');
        if (saved) {
            try { setFormData(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    // Auto Save Draft
    useEffect(() => {
        const timer = setInterval(() => {
            if (formData.title || formData.description) {
                setIsSavingDraft(true);
                localStorage.setItem('product_draft', JSON.stringify(formData));
                setTimeout(() => setIsSavingDraft(false), 1000);
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [formData]);

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const getFileType = (name: string) => {
        if (name.includes('pdf')) return 'pdf';
        if (name.includes('video') || name.match(/\.(mp4|mov|avi|mkv)$/i)) return 'video';
        if (name.match(/\.(zip|rar)$/i)) return 'zip';
        if (name.match(/\.(mp3|wav)$/i)) return 'audio';
        return 'other';
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.fileUrl) return showToast.error('يرجى رفع الملف الرقمي الأساسي أولاً للمتابعة');
            if (!formData.title) return showToast.error('يرجى كتابة اسم المنتج للمتابعة');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف للمتابعة');
        }
        if (currentStep === 2) {
            if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف للمتابعة');
            if (!formData.description || formData.description.length < 10) return showToast.error('يرجى كتابة وصف موجز على الأقل للمتابعة');
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep === 3) {
            if (!formData.price && formData.pricingType !== 'free') return showToast.error('يرجى تحديد السعر');
            setShowConfirmModal(true);
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading('جاري نشر منتجك الجديد...');
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
                    prerequisites: formData.prerequisites.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تهانينا! تم نشر المنتج بنجاح 🚀');
                localStorage.removeItem('product_draft');
                router.push('/dashboard/products');
            } else {
                throw new Error('فشل الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء الحفظ. يرجى المحاولة لاحقاً.');
        } finally {
            setLoading(false);
        }
    };

    const netEarnings = formData.price ? (parseFloat(formData.price) * 0.9).toFixed(2) : '0.00';

    return (
        <div className="max-w-[1400px] mx-auto pb-32 px-4 lg:px-8 overflow-hidden flex flex-col lg:flex-row gap-10">
            
            {/* Form Column - Right Side */}
            <div className="flex-1 lg:max-w-3xl">
                {/* Header & Auto-Draft Indicator */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-6">
                    <div className="text-right">
                        <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs mb-4 transition-colors">
                            <FiArrowRight /> العودة للمنتجات
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">إضافة منتج رقمي متكامل</h1>
                        <p className="text-slate-500 font-medium mt-2">ابدأ بملء كافة التفاصيل لضمان أفضل تجربة تسويقية لمنتجك الرقمي</p>
                    </div>
                    {isSavingDraft && (
                        <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 animate-pulse">
                            <FiSave /> جاري الحفظ كمسودة...
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-[3rem] p-6 lg:p-8 shadow-premium border border-slate-50 mb-10 overflow-hidden">
                    <StepProgress steps={steps} currentStep={currentStep} />
                </div>

                <form onSubmit={handlePreSubmit} autoComplete="off" className="relative space-y-10">
                    <AnimatePresence mode="wait">
                        
                        {/* Step 1: Assets & Core Data */}
                        {currentStep === 1 && (
                            <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="مخزن أصول المنتج الرقمي" icon={<FiLayers />}>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Main File */}
                                        <div className="space-y-4 p-8 bg-emerald-50/50 border-2 border-dashed border-emerald-100 rounded-[2.5rem] text-center relative group">
                                            <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-100/50 p-2 rounded-full" title="ملفك محمي بتشفير قوي">
                                                <FiLock size={16} />
                                            </div>
                                            <label className="text-sm font-black text-emerald-600 mb-2 block">المنتج الرقمي الأساسي <span className="text-red-500">*</span></label>
                                            <p className="text-[10px] font-bold text-emerald-600/60 mb-4 px-4 line-clamp-2">هذا الملف سيتم تخزينه بأمان وتشفيره عبر الروابط الموقوتة بعد الشراء</p>
                                            
                                            {formData.fileUrl ? (
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FiCheck className="text-emerald-500 shrink-0" />
                                                        <span className="text-xs font-bold truncate max-w-[120px]" dir="ltr">{formData.fileUrl.split('/').pop()}</span>
                                                    </div>
                                                    <button type="button" onClick={() => update('fileUrl', '')} className="text-red-400 hover:text-red-600"><FiX /></button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setShowFileUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-emerald-600 transition-all bg-white rounded-3xl shadow-sm group-hover:shadow-md">
                                                    <FiUpload className="mx-auto mb-2 text-emerald-500" size={32} />
                                                    <span className="text-xs text-slate-500 block">اضغط وارفع (PDF, ZIP, Video, Audio)</span>
                                                </button>
                                            )}
                                            {showFileUploader && (
                                                <div className="mt-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl z-20 relative text-right flex flex-col justify-center"><FileUploader isPrivate={true} onUploadSuccess={(urls, names) => { update('fileUrl', urls[0]); if (names?.[0]) { update('fileType', getFileType(names[0])); if(!formData.title) update('title', names[0].split('.').slice(0, -1).join('.')); } setShowFileUploader(false); }} /></div>
                                            )}
                                        </div>

                                        {/* Trailer Video */}
                                        <div className="space-y-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center group">
                                            <label className="text-sm font-black text-slate-500 mb-2 block">فيديو تعريفي تشويقي للمنتج</label>
                                            {formData.trailerUrl ? (
                                                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FiFilm className="text-slate-500" />
                                                        <span className="text-[10px] font-bold text-slate-400">فيديو مسجل</span>
                                                    </div>
                                                    <button type="button" onClick={() => update('trailerUrl', '')} className="text-red-400"><FiX /></button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-emerald-600 transition-all bg-white rounded-3xl shadow-sm group-hover:shadow-md">
                                                    <FiFilm className="mx-auto mb-2 opacity-50 block" size={32} />
                                                    <span className="text-xs">رفع فيديو تعريفي إعلاني (اختياري)</span>
                                                </button>
                                            )}
                                            {showTrailerUploader && (
                                                <div className="mt-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl z-20 relative text-right"><FileUploader onUploadSuccess={urls => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>
                                </Section>

                                <Section title="المعلومات الأولية وتوجيه المنتج" icon={<FiPackage />}>
                                     <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-modern">الاسم التجاري للمنتج <span className="text-red-500">*</span></label>
                                            <input type="text" className="input-modern glow focus:ring-0" placeholder="مثال: حقيبة أدوات تحرير الفيديو الاحترافية" value={formData.title} onChange={e => update('title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-modern">التصنيف الرئيسي <span className="text-red-500">*</span></label>
                                            <select className="input-modern bg-white font-bold" value={formData.category} onChange={e => update('category', e.target.value)}>
                                                <option value="">اختر التصنيف العام لمنتجك</option>
                                                <option value="ebooks">كتب وملخصات إلكترونية</option>
                                                <option value="courses">دورات ومحاضرات مغلقة</option>
                                                <option value="templates">قوالب، تصاميم وحقائب</option>
                                                <option value="software">برمجيات، سكريبتات وأدوات</option>
                                            </select>
                                        </div>
                                     </div>
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 2: Marketing & Presentation */}
                        {currentStep === 2 && (
                            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="الهواية البصرية والجاليري" icon={<FiImage />}>
                                     <div className="grid md:grid-cols-5 gap-10">
                                        {/* Main Cover (Image) */}
                                        <div className="md:col-span-3">
                                            <label className="label-modern mb-4 block underline decoration-emerald-200 underline-offset-4">صورة الغلاف الرسمية للمتجر (16:9) <span className="text-red-500">*</span></label>
                                            <div className="relative aspect-video rounded-[3rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
                                                {formData.image ? (
                                                    <>
                                                        <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button type="button" onClick={() => update('image', '')} className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform"><FiX size={20}/></button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 hover:bg-white hover:text-emerald-500 transition-all">
                                                        <FiImage size={40} />
                                                        <span className="text-sm font-black italic">ارفع غلاف المنتج الاحترافي</span>
                                                    </button>
                                                )}
                                                {showCoverUploader && (
                                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md p-6 overflow-auto text-right flex flex-col justify-center"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mini Gallery (Images Only) */}
                                        <div className="md:col-span-2">
                                            <label className="label-modern mb-4 block underline decoration-emerald-200 underline-offset-4">معرض صور إضافي لبيئة المنتج (اختياري)</label>
                                            <div className="grid grid-cols-2 gap-3 relative">
                                                {formData.images.map((img, i) => (
                                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-2 border-white group">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => update('images', formData.images.filter((_, idx) => idx !== i))} className="absolute top-2 left-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><FiX size={12}/></button>
                                                    </div>
                                                ))}
                                                {formData.images.length < 4 && (
                                                    <button type="button" onClick={() => setShowGalleryUploader(true)} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-emerald-500 hover:bg-white transition-all">
                                                        <FiPlus size={24}/>
                                                    </button>
                                                )}
                                            </div>
                                            {showGalleryUploader && (
                                                <div className="mt-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl border shadow-2xl absolute z-30 max-w-[200px] text-right left-0"><FileUploader maxFiles={3} onUploadSuccess={urls => { update('images', [...formData.images, ...urls]); setShowGalleryUploader(false); }} /></div>
                                            )}
                                        </div>
                                     </div>
                                </Section>

                                <Section title="الوصف البياني" icon={<FiPackage />}>
                                     <label className="label-modern mb-4 block font-black">اكتب وصفاً جذاباً وصادقاً لمنتجك (يعمل كمقنع للمشتري) <span className="text-red-500">*</span></label>
                                     <div className="min-h-[400px]">
                                        <RichTextEditor value={formData.description} onChange={val => update('description', val)} />
                                     </div>
                                     <div className="mt-8 grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="label-modern mb-2 block">الوسوم التسويقية (SEO Tags)</label>
                                            <input type="text" className="input-modern" placeholder="مثال: تصميم, تكنولوجيا, ملفات_جاهزة" value={formData.tags} onChange={e => update('tags', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label-modern mb-2 block">متطلبات المشتري المسبقة (Prerequisites)</label>
                                            <input type="text" className="input-modern" placeholder="مثال: لاب توب, اشتراك فوتوشوب" value={formData.prerequisites} onChange={e => update('prerequisites', e.target.value)} />
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold">افصل بفاصلة لعرضها كنقاط منظمة</p>
                                        </div>
                                     </div>
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 3: Logistics & Pricing */}
                        {currentStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="استراتيجية التسعير وهامش الربح" icon={<FiDollarSign />}>
                                    <h4 className="text-center font-black text-slate-800 mb-6">هل هذا المنتج مجاني أم مدفوع؟ اختر النمط الأنسب لك:</h4>
                                    <div className="grid grid-cols-3 gap-4 p-2 bg-slate-100 rounded-[2.5rem] mb-12">
                                        {['fixed', 'pwyw', 'free'].map(vt => (
                                            <button
                                                key={vt} type="button"
                                                onClick={() => update('pricingType', vt)}
                                                className={`py-6 rounded-[2rem] text-sm font-black transition-all flex flex-col items-center justify-center gap-2 ${formData.pricingType === vt ? 'bg-white text-emerald-600 shadow-xl scale-[1.02] translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {vt === 'fixed' ? 'سعر ثابت' : vt === 'pwyw' ? 'ادفع ما تريد' : 'منتج مجاني بالكامل'}
                                                <span className="text-[10px] opacity-50 font-bold hidden sm:block">{vt === 'fixed' ? 'سعر محدد مسبقاً لا يتغير' : vt === 'pwyw' ? 'دعم اختياري ومفتوح القيمة' : 'هدية للمجتمع وبلوغ أكبر انتشار'}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-10">
                                        {formData.pricingType !== 'free' && (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-8 items-end max-w-2xl mx-auto">
                                                    <div className="space-y-2">
                                                        <label className="label-modern text-center block text-emerald-600">السعر النهائي بعد الخصم ($) <span className="text-red-500">*</span></label>
                                                        <input type="number" step="0.01" className="bg-transparent border-0 border-b-4 border-emerald-500 text-center text-5xl font-black text-emerald-600 w-full outline-none transition-all placeholder:text-emerald-100" placeholder="00.00" value={formData.price} onChange={e => update('price', e.target.value)} />
                                                    </div>
                                                    {formData.pricingType === 'pwyw' ? (
                                                        <div className="space-y-2">
                                                            <label className="label-modern opacity-60 text-center block">أقل مبلغ لقبوله ($)</label>
                                                            <input type="number" step="0.01" className="bg-transparent border-0 border-b-4 border-slate-200 focus:border-slate-500 text-center text-4xl font-black text-slate-400 w-full outline-none transition-all placeholder:text-slate-100" placeholder="0.00" value={formData.minPrice} onChange={e => update('minPrice', e.target.value)} />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                                            <label className="label-modern text-center block text-red-500">السعر الأصلي للخصم الوهمي ($)</label>
                                                            <input type="number" step="0.01" className="bg-transparent border-0 border-b-4 border-slate-200 focus:border-red-400 text-center text-3xl font-black text-slate-400 line-through w-full outline-none transition-all placeholder:text-slate-200" placeholder="00.00" value={formData.originalPrice} onChange={e => update('originalPrice', e.target.value)} />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="max-w-2xl mx-auto pt-6 text-center space-y-4">
                                                    <div className="flex flex-col items-center gap-2 mb-4">
                                                        <label className="label-modern">عداد ندرة العرض (تاريخ الانتهاء)</label>
                                                        <input type="datetime-local" className="input-modern text-center max-w-[250px] bg-slate-50 border-slate-200 text-xs font-bold" value={formData.offerExpiresAt} onChange={e => update('offerExpiresAt', e.target.value)} />
                                                    </div>
                                                </div>
                                                
                                                {/* Auto-Currency Net Earnings Box */}
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex items-center justify-between shadow-inner relative overflow-hidden mx-auto max-w-2xl">
                                                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-emerald-400" />
                                                    <div>
                                                        <h4 className="text-lg font-black text-emerald-800">الربح الصافي الخاص بك لكل مبيعة</h4>
                                                        <p className="text-[11px] text-emerald-600/70 font-bold mt-1">المبلغ المضمون في حسابك بعد خصم 10% صيانة تشغيلية</p>
                                                    </div>
                                                    <div className="text-left font-black text-4xl text-emerald-600 tracking-tighter" dir="ltr">
                                                        <span className="text-xl text-emerald-400 mr-1">$</span>{netEarnings}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Free Preview Toggle (Mini Upload) */}
                                        <div className="pt-10 border-t border-slate-100">
                                            <label className="label-modern mb-4 block underline decoration-slate-200 underline-offset-4">عينة أو معاينة مجانية من المنتج (لإقناع المشترين بقيمته)</label>
                                            {formData.previewFileUrl ? (
                                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200 shadow-sm transition-all">
                                                    <span className="text-xs font-black text-slate-600 italic flex items-center gap-2"><FiCheck className="text-emerald-500"/> تم إرفاق ملف العينة بنجاح، وستكون قابلة للتحميل مجاناً في صفحة المنتج</span>
                                                    <button type="button" onClick={() => update('previewFileUrl', '')} className="text-red-500 hover:bg-red-50 p-3 rounded-full transition-colors font-bold flex gap-2 items-center text-xs"><FiX /> حذف العينة</button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setShowPreviewUploader(true)} className="flex items-center justify-center gap-3 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-all border-2 border-dashed border-slate-200 py-8 rounded-[2rem] w-full hover:bg-slate-50 hover:border-emerald-200">
                                                    <FiPlus size={24}/> إضافة ملف فري بي (Freebie) كعينة مجانية مبسطة 
                                                </button>
                                            )}
                                            {showPreviewUploader && (
                                                <div className="mt-4 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border shadow-2xl text-right max-w-md mx-auto relative"><FileUploader onUploadSuccess={urls => { update('previewFileUrl', urls[0]); setShowPreviewUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>
                                </Section>

                                <Section title="خيارات الطرح والنشر في المتجر" icon={<FiEye />}>
                                    <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] border border-white/10 shadow-xl transition-all cursor-pointer hover:bg-slate-800 group" onClick={() => update('isActive', !formData.isActive)}>
                                        <div className="text-right">
                                            <h3 className="font-black text-white text-xl leading-tight transition-colors group-hover:text-emerald-400">حالة ظهور المنتج في المتجر</h3>
                                        </div>
                                        <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all outline outline-offset-2 ${formData.isActive ? 'bg-emerald-500 outline-emerald-500/30' : 'bg-slate-700 outline-slate-800'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.isActive ? 'translate-x-[26px]' : 'translate-x-0'} shadow-sm shadow-black/40`} />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-8 bg-blue-900 rounded-[3rem] border border-blue-800 shadow-lg transition-all cursor-pointer hover:bg-blue-800 group" onClick={() => update('enablePPP', !formData.enablePPP)}>
                                        <div className="text-right">
                                            <h3 className="font-black text-white text-xl leading-tight transition-colors group-hover:text-amber-400">تفعيل التسعير العادل (PPP Pricing) 🌍</h3>
                                            <p className="text-xs text-blue-200 mt-1 max-w-lg leading-relaxed">تخفيض السعر تلقائياً للزوار من الدول النامية حسب القوة الشرائية، لضمان أعلى نسبة مبيعات للجميع دون حرمان أحد.</p>
                                        </div>
                                        <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all outline outline-offset-2 ${formData.enablePPP ? 'bg-amber-500 outline-amber-500/30' : 'bg-blue-950 outline-blue-900'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.enablePPP ? 'translate-x-[26px]' : 'translate-x-0'} shadow-sm shadow-black/40`} />
                                        </div>
                                    </div>
                                </Section>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Navigation Footer */}
                    <div className="mt-20 flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100 gap-6 pb-12">
                        <div className="w-full md:w-auto">
                            {currentStep > 1 ? (
                                <button
                                    type="button" onClick={prevStep}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 border border-slate-200 rounded-2xl transition-all px-8 py-4 group hover:bg-slate-50"
                                >
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    خطوة تراجع
                                </button>
                            ) : (
                                <Link href="/dashboard/products" className="w-full md:w-auto block text-center text-slate-400 hover:text-red-500 font-bold border border-transparent hover:bg-red-50 rounded-2xl px-8 py-4 transition-all">إلغاء تماماً والعودة</Link>
                            )}
                        </div>

                        <div className="w-full md:w-auto">
                            {currentStep < 3 ? (
                                <button
                                    key="btn-next" type="button" onClick={nextStep}
                                    className="w-full md:w-auto px-12 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 text-lg"
                                >
                                    حفظ والانتقال للخطوة التالية
                                    <FiArrowLeft />
                                </button>
                            ) : (
                                <button
                                    key="btn-submit" type="submit" disabled={loading}
                                    className="w-full md:w-auto px-12 py-4 bg-gradient-to-l from-emerald-500 to-teal-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-teal-200 disabled:opacity-50 active:scale-95 text-lg"
                                >
                                    {loading ? 'جاري التحضير النهائي...' : 'إطلاق ونشر المنتج للبيع'}
                                    {!loading && <FiCheckSquare />}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Live Preview Sidepanel - Left Side (Sticky) */}
            <div className="hidden lg:block w-[420px] shrink-0 border-r border-slate-100 pr-10">
                <div className="sticky top-10 space-y-6">
                    <div className="flex items-center gap-2 text-emerald-600 mb-6">
                        <FiEye size={20} />
                        <h3 className="font-black text-sm uppercase tracking-widest">معاينة الزبون المباشرة (Live)</h3>
                    </div>

                    {/* Miniature Product Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 block">
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300">
                            {formData.image ? 
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> 
                            : <span className="font-bold text-xs flex flex-col items-center"><FiImage size={32} className="opacity-50 mb-2"/> أضف الغلاف</span>}
                            
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 font-black text-[10px] text-slate-800 rounded-xl">
                                {formData.category || 'تصنيف المنتج'}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h4 className="font-black text-lg text-slate-900 line-clamp-2 leading-tight min-h-[50px]">
                                {formData.title || 'اسم المنتج الرائع الخاص بك ومحتواه سيبدو هنا بشكل متميز...'}
                            </h4>
                            
                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">السعر النهائي</p>
                                    <div className="text-2xl font-black text-emerald-600" dir="ltr">
                                        {formData.pricingType === 'free' ? 'مجاني' : (
                                            <><span className="text-sm text-emerald-400 mr-1">$</span>{formData.price || '0.00'}</>
                                        )}
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                    <FiPackage /> {formData.fileType.toUpperCase()}
                                </div>
                            </div>
                            
                            <button className="w-full mt-6 py-4 bg-emerald-500 text-white font-black rounded-2xl text-sm transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2" disabled>
                                إتمام الشراء والتنزيل المباشر
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl animate-fade-in">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center space-y-10 shadow-2xl">
                             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl"><FiCheckSquare /></div>
                             <div className="space-y-2">
                                 <h3 className="text-3xl font-black text-slate-900 leading-tight">جاهز للانطلاق!</h3>
                                 <p className="text-sm text-slate-400 font-medium tracking-wide">سيتم عرض المنتج في متجرك الخاص وتفعيل كافة خيارات الشراء فور النشر.</p>
                             </div>
                             <div className="flex flex-col gap-4">
                                <button onClick={handleSubmit} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-lg hover:bg-emerald-700 transition-all text-lg">نعم، أطلق المنتج فوراً للعلن</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-2 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs">مراجعة أخيرة للبيانات المدخلة</button>
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ title, icon, description, children }: any) {
    return (
        <div className="bg-white rounded-[3.5rem] p-8 lg:p-14 shadow-premium border border-slate-50 space-y-10 overflow-hidden relative">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm shrink-0">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                    {description && <p className="text-xs text-slate-400 font-medium mt-2 uppercase tracking-wider">{description}</p>}
                    <div className="h-1 w-12 bg-emerald-100 rounded-full mt-3" />
                </div>
            </div>
            <div className="space-y-8 relative z-10">
                {children}
            </div>
        </div>
    );
}
