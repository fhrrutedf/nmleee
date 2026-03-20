'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiX, FiFilm, FiEye, FiImage, FiCheck,
    FiChevronDown, FiChevronUp, FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';

type PricingType = 'fixed' | 'free' | 'pwyw';

const steps = [
    { id: 1, label: 'الأصل الرقمي' },
    { id: 2, label: 'هوية المنتج' },
    { id: 3, label: 'التسعير والبيع' },
];

export default function NewProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const [loading, setLoading] = useState(false);

    // حالات رفع الملفات
    const [showCoverUploader, setShowCoverUploader] = useState(false);
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

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.fileUrl) return showToast.error('يرجى رفع الملف الرقمي الأساسي أولاً');
            if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف للمنتج');
        }
        if (currentStep === 2) {
            if (!formData.title) return showToast.error('يرجى إدخال عنوان المنتج');
            if (formData.description.length < 20) return showToast.error('وصف المنتج قصير جداً');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف');
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
        // Only show if we are on the final step
        if (currentStep === 3) {
            setShowConfirmModal(true);
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading('جاري حفظ المنتج...');
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
                showToast.success('تهانينا! تم نشر منتجك بنجاح');
                router.push('/dashboard/products');
            } else {
                throw new Error('خطأ في الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ غير متوقع أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-24 px-4">
            
            {/* Header Redesign */}
            <div className="mb-10 text-right">
                <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-4 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                    <FiArrowRight /> العودة للوحة التحكم
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">إضافة منتج رقمي</h1>
                <p className="text-slate-500 font-medium mt-1">ابدأ برفع الملف الرقمي أولاً لنسهل عليك البقية</p>
            </div>

            {/* Steps Tracker */}
            <div className="bg-white rounded-3xl p-6 shadow-premium border border-slate-50 mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handlePreSubmit} autoComplete="off" className="relative">
                <AnimatePresence mode="wait">
                    
                    {/* Step 1: Assets (REVERSED FLOW - LEAD WITH UPLOAD) */}
                    {currentStep === 1 && (
                        <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <Section title="الملف والأصول الرقمية" icon={<FiUpload />} description="ارفع المنتج الذي سيحصل عليه المشتري">
                                
                                {/* Main File Upload */}
                                <div className="space-y-4 p-8 bg-primary-indigo-50 border-2 border-dashed border-primary-indigo-200 rounded-[2.5rem] text-center">
                                    {formData.fileUrl ? (
                                        <div className="flex items-center justify-between bg-primary-indigo-600 text-white p-6 rounded-3xl shadow-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <FiCheck className="text-2xl" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black">تم رفع الملف بنجاح</p>
                                                    <p className="text-xs opacity-80">جاهز للبيع الآمن</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => update('fileUrl', '')} className="text-white/60 hover:text-white transition-colors">
                                                <FiX size={24} />
                                            </button>
                                        </div>
                                    ) : showFileUploader ? (
                                        <FileUploader
                                            isPrivate={true}
                                            onUploadSuccess={(urls, names) => {
                                                update('fileUrl', urls[0]);
                                                if (names?.[0]) {
                                                    update('fileType', getFileType(names[0]));
                                                    // Auto-populating title from filename
                                                    if (!formData.title) update('title', names[0].split('.').slice(0, -1).join('.'));
                                                }
                                                setShowFileUploader(false);
                                            }}
                                        />
                                    ) : (
                                        <div className="py-6">
                                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-primary-indigo-100 flex items-center justify-center text-primary-indigo-600 mx-auto mb-4">
                                                <FiUpload size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2">ماذا ستبيع اليوم؟</h3>
                                            <p className="text-sm text-slate-500 mb-6 font-medium">ارفع ملف الـ ZIP أو الـ PDF أو الكورس الآن</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowFileUploader(true)}
                                                className="px-10 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 transition-all font-sans"
                                            >
                                                اختر الملف للبدء
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cover Image */}
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <label className="label-modern mb-4 block">صورة الغلاف (16:9) <span className="text-red-500">*</span></label>
                                    {formData.image ? (
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                                            <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => update('image', '')} className="absolute top-4 left-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center">&times;</button>
                                        </div>
                                    ) : showCoverUploader ? (
                                        <FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} />
                                    ) : (
                                        <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex flex-col items-center justify-center gap-4 hover:border-primary-indigo-400 bg-white">
                                            <FiImage size={32} />
                                            ارفع صورة الغلاف بصيغة عرض مميزة
                                        </button>
                                    )}
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 2: Identity (NOW SECOND) */}
                    {currentStep === 2 && (
                        <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <Section title="هوية المنتج" icon={<FiPackage />} description="تفاصيل المنتج التي ستجذب المشترين">
                                <div>
                                    <label className="label-modern">اسم المنتج <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" required className="input-modern"
                                        placeholder="مثال: التصميم الجرافيكي المتقدم"
                                        value={formData.title}
                                        onChange={e => update('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label-modern">وصف المنتج <span className="text-red-500">*</span></label>
                                    <RichTextEditor
                                        value={formData.description}
                                        onChange={val => update('description', val)}
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label-modern">تصنيف المنتج</label>
                                        <select className="input-modern bg-white" value={formData.category} onChange={e => update('category', e.target.value)}>
                                            <option value="">اختر التصنيف</option>
                                            <option value="courses">دورات</option>
                                            <option value="ebooks">كتب</option>
                                            <option value="templates">قوالب</option>
                                            <option value="software">برمجيات</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-modern">وسوم (Tags)</label>
                                        <input type="text" className="input-modern" placeholder="وسم1, وسم2..." value={formData.tags} onChange={e => update('tags', e.target.value)} />
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 3: Pricing */}
                    {currentStep === 3 && (
                        <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <Section title="التسعير والبيع" icon={<FiDollarSign />} description="حدد قيمة منتجك الذي رفعته للتو">
                                <div className="grid grid-cols-3 gap-3">
                                    {['fixed', 'pwyw', 'free'].map(vt => (
                                        <button
                                            key={vt} type="button"
                                            onClick={() => update('pricingType', vt)}
                                            className={`p-4 rounded-3xl text-sm font-black border-2 transition-all flex flex-col items-center gap-2 ${formData.pricingType === vt ? 'border-primary-indigo-600 bg-primary-indigo-50 text-primary-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            {vt === 'fixed' ? 'سعر ثابت' : vt === 'pwyw' ? 'ادفع ما تريد' : 'مجاني'}
                                            <span className="text-[10px] opacity-60">
                                                {vt === 'fixed' ? 'سعر محدد مسبقاً' : vt === 'pwyw' ? 'دعم اختياري' : 'هديـة للمبدعين'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {formData.pricingType !== 'free' && (
                                    <div className="pt-6 mt-6 border-t border-slate-50">
                                        <label className="label-modern">السعر النهائي (ج.م) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number" step="0.01" className="input-modern"
                                            placeholder="299"
                                            value={formData.price}
                                            onChange={e => update('price', e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                        />
                                    </div>
                                )}
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Footer Buttons */}
                <div className="mt-12 flex items-center justify-between pt-10 border-t border-slate-100">
                    <div className="flex gap-4 items-center">
                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200">
                                السابق
                            </button>
                        )}
                        <Link href="/dashboard/products" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4 py-4">إلغاء</Link>
                    </div>

                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <button
                                key="btn-next"
                                type="button"
                                onClick={nextStep}
                                className="px-8 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-primary-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                الخطوة التالية
                                <FiArrowLeft />
                            </button>
                        ) : (
                            <button
                                key="btn-submit"
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                            >
                                {loading ? 'جاري النشر...' : 'حفظ ونشر المنتج'}
                                {!loading && <FiCheck />}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl space-y-8 text-center"
                        >
                            <div className="w-20 h-20 bg-primary-indigo-50 text-primary-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl">
                                <FiCheck />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">هل أنت مستعد للنشر؟</h3>
                                <p className="text-sm text-slate-500 font-medium">سيتم عرض منتجك "{formData.title}" في المتجر فور تأكيدك.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 transition-all"
                                >
                                    نعم، أنشر المنتج الآن
                                </button>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all font-sans"
                                >
                                    مراجعة البيانات مرة أخرى
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Reusable Layout Section
function Section({
    title, icon, description, children
}: {
    title: string;
    icon: React.ReactNode;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`rounded-[3rem] p-8 lg:p-10 space-y-8 bg-white shadow-premium border border-slate-50`}>
            <div>
                <h2 className="font-black text-2xl flex items-center gap-4 text-slate-900">
                    <span className="w-12 h-12 bg-primary-indigo-50 text-primary-indigo-600 rounded-2xl flex items-center justify-center">
                        {icon}
                    </span>
                    {title}
                </h2>
                {description && <p className="mt-2 text-slate-400 font-medium text-sm mr-16">{description}</p>}
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
