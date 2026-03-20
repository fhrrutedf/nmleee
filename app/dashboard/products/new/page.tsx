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
    { id: 1, label: 'هوية المنتج' },
    { id: 2, label: 'التسعير والبيع' },
    { id: 3, label: 'الملفات والوسائط' },
];

export default function NewProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
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
            if (!formData.title) return showToast.error('يرجى إدخال عنوان المنتج');
            if (formData.description.length < 20) return showToast.error('وصف المنتج قصير جداً');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف');
        }
        if (currentStep === 2) {
            if (formData.pricingType !== 'free' && !formData.price) return showToast.error('يرجى تحديد سعر المنتج');
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف');
        if (!formData.fileUrl) return showToast.error('يرجى رفع ملف المنتج الأساسي');

        setLoading(true);
        const toastId = showToast.loading('جاري الحفظ والتحقق من الملفات...');
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">إنشاء منتج رقمي جديد</h1>
                <p className="text-slate-500 font-medium mt-1">دعنا نُحوّل شغفك لمنتج حقيقي في 3 خطوات بسيطة</p>
            </div>

            {/* Steps Tracker */}
            <div className="bg-white rounded-3xl p-6 shadow-premium border border-slate-50 mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            {/* Multi-step Form Body */}
            <form onSubmit={handleSubmit} className="relative">
                <AnimatePresence mode="wait">
                    
                    {/* Step 1: Identity */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <Section 
                                title="هوية المنتج الأساسية" 
                                icon={<FiPackage />} 
                                description="هذا ما سيراه المستخدم أولاً في واجهة المتجر"
                            >
                                <div>
                                    <label className="label-modern">اسم المنتج <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" required className="input-modern"
                                        placeholder="مثال: التصميم الجرافيكي المتقدم — النسخة الكاملة"
                                        value={formData.title}
                                        onChange={e => update('title', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="label-modern">تحليل وتحرير المحتوى <span className="text-red-500">*</span></label>
                                    <div className="mt-1">
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={val => update('description', val)}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">الوصف المنسّق جيداً يزيد من مبيعاتك بنسبة 40%</p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="label-modern">تصنيف المنتج</label>
                                        <select className="input-modern bg-white" value={formData.category} onChange={e => update('category', e.target.value)}>
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
                                        <label className="label-modern">الكلمات الدلالية (الوسوم)</label>
                                        <input
                                            type="text" className="input-modern"
                                            placeholder="تصميم، بزنس، أدوات..."
                                            value={formData.tags}
                                            onChange={e => update('tags', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 2: Pricing */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <Section 
                                title="نموذج التسعير والتجارة" 
                                icon={<FiDollarSign />}
                                description="اختر الطريقة التي تفضل بيع منتجك بها"
                            >
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'fixed', label: 'سعر ثابت', desc: 'بيع بسعر محدد' },
                                        { value: 'pwyw', label: 'ادفع ما تريد', desc: 'دعم من جمهورك' },
                                        { value: 'free', label: 'مجاني', desc: 'نشر مجاني' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value} type="button"
                                            onClick={() => update('pricingType', opt.value)}
                                            className={`p-4 rounded-3xl text-sm font-black border-2 transition-all flex flex-col items-center gap-2 group ${formData.pricingType === opt.value
                                                ? 'border-primary-indigo-600 bg-primary-indigo-50 text-primary-indigo-600'
                                                : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-base">{opt.label}</span>
                                            <span className="text-[10px] opacity-60 font-medium">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                {formData.pricingType !== 'free' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-50 mt-4">
                                        <div>
                                            <label className="label-modern">السعر النهائي (ج.م) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <FiDollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="number" required min="0" step="0.01" className="input-modern pr-12"
                                                    placeholder="299"
                                                    value={formData.price}
                                                    onChange={e => update('price', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {formData.pricingType === 'pwyw' && (
                                            <div>
                                                <label className="label-modern">الحد الأدنى المدفوع</label>
                                                <input
                                                    type="number" min="0" step="0.01" className="input-modern"
                                                    placeholder="0"
                                                    value={formData.minPrice}
                                                    onChange={e => update('minPrice', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 3: Files & Assets */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <Section 
                                title="الأصول والمحتوى الرقمي" 
                                icon={<FiUpload />} 
                                description="ارفع صورتك الغلاف والملف الذي سيحصل عليه المشتري"
                            >
                                {/* Cover Image */}
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <label className="label-modern mb-4 block">صورة الغلاف (16:9) <span className="text-red-500">*</span></label>
                                    {formData.image ? (
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                                            <img src={formData.image} alt="غلاف" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { update('image', ''); setShowCoverUploader(false); }}
                                                className="absolute top-4 left-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        </div>
                                    ) : showCoverUploader ? (
                                        <FileUploader
                                            maxFiles={1}
                                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                            onUploadSuccess={(urls) => { update('image', urls[0]); setShowCoverUploader(false); }}
                                        />
                                    ) : (
                                        <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex flex-col items-center justify-center gap-4 hover:border-primary-indigo-400 hover:text-primary-indigo-600 transition-all bg-white">
                                            <FiImage size={32} />
                                            انقر لرفع صورة الغلاف
                                        </button>
                                    )}
                                </div>

                                {/* Main File Upload */}
                                <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                                    <label className="label-modern block font-black">الملف الرقمي الأساسي <span className="text-red-500">*</span></label>
                                    {formData.fileUrl ? (
                                        <div className="flex items-center justify-between bg-primary-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <FiCheck className="text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">تم تأمين ورفع الملف</p>
                                                    <p className="text-xs opacity-80">جاهز للتسليم الآمن للمشترين</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => update('fileUrl', '')} className="text-white/60 hover:text-white transition-colors">
                                                <FiX size={24} />
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
                                            className="w-full py-8 bg-primary-indigo-50 border-2 border-dashed border-primary-indigo-200 rounded-3xl text-primary-indigo-600 font-black flex items-center justify-center gap-4 hover:bg-primary-indigo-100 transition-all"
                                        >
                                            <FiUpload size={24} />
                                            ارفع الملف الآن (ZIP, PDF, MP4...)
                                        </button>
                                    )}
                                </div>

                                {/* Collapsible Optional Section */}
                                <div className="mt-8">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowGuide(!showGuide)}
                                        className="text-slate-400 font-black text-xs uppercase flex items-center gap-2 mb-4 hover:text-slate-600 transition-colors"
                                    >
                                        {showGuide ? <FiChevronUp /> : <FiChevronDown />}
                                        تعديلات إضافية (اختيارية)
                                    </button>
                                    
                                    {showGuide && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
                                            {/* Video Trailer */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 mb-2">فيديو ترويجي</p>
                                                <button type="button" onClick={() => setShowTrailerUploader(true)} className="text-xs font-black text-primary-indigo-600 flex items-center gap-2">
                                                    <FiFilm className="text-base" /> {formData.trailerUrl ? 'تغيير الفيديو' : 'إضافة فيديو'}
                                                </button>
                                            </div>
                                            {/* Preview File */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 mb-2">ملف معاينة مجاني</p>
                                                <button type="button" onClick={() => setShowPreviewUploader(true)} className="text-xs font-black text-primary-indigo-600 flex items-center gap-2">
                                                    <FiEye className="text-base" /> {formData.previewFileUrl ? 'تغيير المعاينة' : 'إضافة معاينة'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Sticky Action Footer */}
                <div className="mt-12 flex items-center justify-between gap-4 pt-10 border-t border-slate-100">
                    <div className="flex gap-4 items-center">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 transition-colors"
                            >
                                السابق
                            </button>
                        )}
                        <Link href="/dashboard/products" className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors">
                            إلغاء
                        </Link>
                    </div>

                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-10 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 transition-colors flex items-center gap-3"
                            >
                                الخطوة التالية
                                <FiArrowLeft />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || !formData.image || !formData.fileUrl}
                                className="px-12 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {loading ? 'جاري النشر...' : 'حفظ ونشر المنتج الآن'}
                                {!loading && <FiCheck />}
                            </button>
                        )}
                    </div>
                </div>
            </form>
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
