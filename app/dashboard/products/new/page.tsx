'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiX, FiImage, FiCheck, FiArrowLeft, FiFilm, FiEye, FiLayers, FiPlus
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
        isActive: true, // Default to show
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
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تهانينا! تم نشر المنتج بنجاح 🚀');
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

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 overflow-hidden">
            
            {/* Header */}
            <div className="mb-10 text-right">
                <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-4 transition-colors">
                    <FiArrowRight /> العودة للمنتجات
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">إضافة منتج رقمي متكامل</h1>
                <p className="text-slate-500 font-medium mt-1">ابدأ بملء كافة التفاصيل لضمان أفضل تجربة تسويقية لمنتجك</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-3xl p-6 shadow-premium border border-slate-50 mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handlePreSubmit} autoComplete="off" className="relative space-y-10">
                <AnimatePresence mode="wait">
                    
                    {/* Step 1: Assets & Core Data */}
                    {currentStep === 1 && (
                        <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <Section title="ملفات المنتج الأساسية" icon={<FiLayers />}>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Main File */}
                                    <div className="space-y-4 p-8 bg-primary-indigo-50/50 border-2 border-dashed border-primary-indigo-100 rounded-[2.5rem] text-center">
                                        <label className="text-sm font-black text-primary-indigo-600 mb-2 block">المنتج الرقمي (PDF, ZIP...) <span className="text-red-500">*</span></label>
                                        {formData.fileUrl ? (
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary-indigo-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FiCheck className="text-emerald-500 shrink-0" />
                                                    <span className="text-xs font-bold truncate max-w-[120px]" dir="ltr">{formData.fileUrl.split('/').pop()}</span>
                                                </div>
                                                <button type="button" onClick={() => update('fileUrl', '')} className="text-red-400"><FiX /></button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowFileUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-primary-indigo-600 transition-all">
                                                <FiUpload className="mx-auto mb-2" size={24} />
                                                <span className="text-xs">ارفع الملف الأساسي</span>
                                            </button>
                                        )}
                                        {showFileUploader && (
                                            <div className="mt-4 bg-white p-4 rounded-2xl shadow-xl z-20 relative text-right"><FileUploader isPrivate={true} onUploadSuccess={(urls, names) => { update('fileUrl', urls[0]); if (names?.[0]) { update('fileType', getFileType(names[0])); if(!formData.title) update('title', names[0].split('.').slice(0, -1).join('.')); } setShowFileUploader(false); }} /></div>
                                        )}
                                    </div>

                                    {/* Trailer Video */}
                                    <div className="space-y-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                                        <label className="text-sm font-black text-slate-500 mb-2 block">فيديو تعريفي تشويقي (Trailer)</label>
                                        {formData.trailerUrl ? (
                                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FiFilm className="text-primary-indigo-500" />
                                                    <span className="text-[10px] font-bold text-slate-400">فيديو مسجل</span>
                                                </div>
                                                <button type="button" onClick={() => update('trailerUrl', '')} className="text-red-400"><FiX /></button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-primary-indigo-600 transition-all">
                                                <FiFilm className="mx-auto mb-2" size={24} />
                                                <span className="text-xs">رفع فيديو تعريفي</span>
                                            </button>
                                        )}
                                        {showTrailerUploader && (
                                            <div className="mt-4 bg-white p-4 rounded-2xl shadow-xl z-20 relative text-right"><FileUploader onUploadSuccess={urls => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }} /></div>
                                        )}
                                    </div>
                                </div>
                            </Section>

                            <Section title="المعلومات الأولية" icon={<FiPackage />}>
                                 <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="label-modern">اسم المنتج <span className="text-red-500">*</span></label>
                                        <input type="text" className="input-modern" placeholder="مثال: كتاب التصميم الفاخر" value={formData.title} onChange={e => update('title', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="label-modern">التصنيف الرئيسي <span className="text-red-500">*</span></label>
                                        <select className="input-modern bg-white font-bold" value={formData.category} onChange={e => update('category', e.target.value)}>
                                            <option value="">اختر التصنيف</option>
                                            <option value="ebooks">كتب إلكترونية</option>
                                            <option value="courses">دورات تعليمية</option>
                                            <option value="templates">قوالب وتصاميم</option>
                                            <option value="software">برمجيات وأدوات</option>
                                        </select>
                                    </div>
                                 </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 2: Marketing & Presentation */}
                    {currentStep === 2 && (
                        <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <Section title="الهواية البصرية" icon={<FiImage />}>
                                 <div className="grid md:grid-cols-5 gap-10">
                                    {/* Main Cover (Image) */}
                                    <div className="md:col-span-3">
                                        <label className="label-modern mb-4 block">صورة الغلاف الرسمية للمتجر (16:9) <span className="text-red-500">*</span></label>
                                        <div className="relative aspect-video rounded-[3rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => update('image', '')} className="absolute top-4 left-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-lg hover:scale-110 transition-transform">&times;</button>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                                    <FiImage size={40} />
                                                    <span className="text-sm font-black">ارفع غلاف المنتج</span>
                                                </button>
                                            )}
                                            {showCoverUploader && (
                                                <div className="absolute inset-0 bg-white p-6 overflow-auto text-right"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mini Gallery (Images Only) */}
                                    <div className="md:col-span-2">
                                        <label className="label-modern mb-4 block">معرض صور إضافي (اختياري)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.images.map((img, i) => (
                                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => update('images', formData.images.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px]"><FiX /></button>
                                                </div>
                                            ))}
                                            {formData.images.length < 4 && (
                                                <button type="button" onClick={() => setShowGalleryUploader(true)} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 hover:border-primary-indigo-200 transition-all">
                                                    <FiPlus />
                                                </button>
                                            )}
                                        </div>
                                        {showGalleryUploader && (
                                            <div className="mt-4 p-4 bg-white rounded-2xl border shadow-premium absolute z-30 max-w-[200px] text-right"><FileUploader maxFiles={3} onUploadSuccess={urls => { update('images', [...formData.images, ...urls]); setShowGalleryUploader(false); }} /></div>
                                        )}
                                    </div>
                                 </div>
                            </Section>

                            <Section title="الوصف البياني" icon={<FiPackage />}>
                                 <label className="label-modern mb-4 block font-black">اكتب وصفاً جذاباً وصادقاً لمنتجك <span className="text-red-500">*</span></label>
                                 <div className="min-h-[400px]">
                                    <RichTextEditor value={formData.description} onChange={val => update('description', val)} />
                                 </div>
                                 <div className="mt-8">
                                    <label className="label-modern mb-2 block">الوسوم (Tag) - افصل بينها بفاصلة</label>
                                    <input type="text" className="input-modern" placeholder="مثال: تصميم, تكنولوجيا, فوتوشوب" value={formData.tags} onChange={e => update('tags', e.target.value)} />
                                 </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 3: Logistics & Pricing */}
                    {currentStep === 3 && (
                        <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <Section title="التسعير وإعدادات الربح" icon={<FiDollarSign />}>
                                <div className="grid grid-cols-3 gap-4 p-1 bg-slate-100 rounded-3xl mb-10">
                                    {['fixed', 'pwyw', 'free'].map(vt => (
                                        <button
                                            key={vt} type="button"
                                            onClick={() => update('pricingType', vt)}
                                            className={`py-4 rounded-[1.5rem] text-xs font-black transition-all flex flex-col items-center gap-1 ${formData.pricingType === vt ? 'bg-white text-primary-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {vt === 'fixed' ? 'سعر ثابت' : vt === 'pwyw' ? 'ادفع ما تريد' : 'منتج مجاني'}
                                            <span className="text-[8px] opacity-40">{vt === 'fixed' ? 'سعر محدد مسبقاً' : vt === 'pwyw' ? 'دعم اختياري' : 'هدية للطلاب'}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {formData.pricingType !== 'free' && (
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="label-modern">السعر النهائي ($) <span className="text-red-500">*</span></label>
                                                <input type="number" step="0.01" className="input-modern text-center font-black text-2xl" placeholder="299" value={formData.price} onChange={e => update('price', e.target.value)} />
                                            </div>
                                            {formData.pricingType === 'pwyw' && (
                                                <div className="space-y-2">
                                                    <label className="label-modern opacity-60">أقل مبلغ للقبول</label>
                                                    <input type="number" step="0.01" className="input-modern text-center opacity-70" placeholder="10.00" value={formData.minPrice} onChange={e => update('minPrice', e.target.value)} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Free Preview Toggle (Mini Upload) */}
                                    <div className="pt-8 border-t border-slate-50">
                                        <label className="label-modern mb-2 block">معاينة مجانية (اختياري)</label>
                                        {formData.previewFileUrl ? (
                                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <span className="text-[10px] font-black text-emerald-600 italic">تم إرفاق ملف المعاينة بنجاح</span>
                                                <button type="button" onClick={() => update('previewFileUrl', '')} className="text-red-500"><FiX /></button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowPreviewUploader(true)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-indigo-600 transition-all">
                                                <FiPlus /> إضافة فصل أو عينة مجانية للمشاهدة قبل الشراء
                                            </button>
                                        )}
                                        {showPreviewUploader && (
                                            <div className="mt-4 bg-white p-4 rounded-3xl border shadow-xl text-right"><FileUploader onUploadSuccess={urls => { update('previewFileUrl', urls[0]); setShowPreviewUploader(false); }} /></div>
                                        )}
                                    </div>
                                </div>
                            </Section>

                            <Section title="خيارات العرض والظهور" icon={<FiEye />}>
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer" onClick={() => update('isActive', !formData.isActive)}>
                                    <div className="text-right">
                                        <h3 className="font-black text-slate-900 leading-tight">حالة ظهور المنتج في المتجر</h3>
                                        <p className="text-xs text-slate-400 mt-1">{formData.isActive ? 'عرض المنتج فوراً للجميع' : 'إخفاء المنتج (بيعه عبر الرابط المباشر فقط)'}</p>
                                    </div>
                                    <div className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${formData.isActive ? 'bg-primary-indigo-600' : 'bg-slate-300'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'} shadow-sm`} />
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Navigation Footer */}
                <div className="mt-16 flex items-center justify-between pt-8 border-t border-slate-100 px-4">
                    <div className="flex-1">
                        {currentStep > 1 && (
                            <button
                                type="button" onClick={prevStep}
                                className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-all px-4 py-2 group"
                            >
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                السابق
                            </button>
                        )}
                        {currentStep === 1 && (
                            <Link href="/dashboard/products" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4 py-2">إلغاء تماماً</Link>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <button
                                key="btn-next" type="button" onClick={nextStep}
                                className="px-10 py-3.5 bg-primary-indigo-600 text-white rounded-[1.5rem] font-black flex items-center gap-2 hover:bg-primary-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                            >
                                الخطوة التالية
                                <FiArrowLeft />
                            </button>
                        ) : (
                            <button
                                key="btn-submit" type="submit" disabled={loading}
                                className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[1.5rem] font-black flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? 'جاري التحضير...' : 'إطلاق ونشر المنتج'}
                                {!loading && <FiCheck />}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Confirm Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center space-y-8 shadow-2xl">
                             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl"><FiCheck /></div>
                             <div className="space-y-2">
                                 <h3 className="text-2xl font-black text-slate-900 leading-tight">ممتاز! منتجك الجديد جاهز للبيع</h3>
                                 <p className="text-sm text-slate-400 font-medium">سيتم عرض المنتج في المتجر وتفعيل كافة الخيارات المختارة فور النشر.</p>
                             </div>
                             <div className="flex flex-col gap-3">
                                <button onClick={handleSubmit} className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-primary-indigo-700 transition-all">نعم، أطلق المنتج الآن</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">مراجعة أخيرة للبيانات</button>
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
        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-premium border border-slate-50 space-y-8 overflow-hidden">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-indigo-50 text-primary-indigo-600 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-sm">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    {description && <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{description}</p>}
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
