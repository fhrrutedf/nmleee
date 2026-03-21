'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiBookOpen,
    FiX, FiImage, FiCheck, FiArrowLeft, FiFilm, FiEye, FiLayers, FiPlus, FiClock, FiCheckSquare, FiVideo, FiLink, FiSave
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';

const steps = [
    { id: 1, label: 'هوية الدورة' },
    { id: 2, label: 'مواصفات المحتوى' },
    { id: 3, label: 'التسعير ووسائل البث' },
];

export default function NewCoursePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // Upload Toggles
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);
    const [showAttachmentsUploader, setShowAttachmentsUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: '',
        trailerUrl: '',
        duration: '',
        sessions: '',
        tags: [] as string[],
        features: [] as string[],
        attachments: [] as string[],
        format: 'recorded',
        originalPrice: '',
        enablePPP: false,
        prerequisites: '',
        upsellCourseId: '',
        upsellPrice: '',
        offerExpiresAt: '',
        isActive: true,
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    // Load Draft
    useEffect(() => {
        const saved = localStorage.getItem('course_draft');
        if (saved) {
            try { setFormData(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    // Auto Save Draft
    useEffect(() => {
        const timer = setInterval(() => {
            if (formData.title || formData.description) {
                setIsSavingDraft(true);
                localStorage.setItem('course_draft', JSON.stringify(formData));
                setTimeout(() => setIsSavingDraft(false), 1000);
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [formData]);

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title) return showToast.error('يرجى كتابة عنوان الدورة للمتابعة');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف للمتابعة');
            if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف للمتابعة');
        }
        if (currentStep === 2) {
            if (!formData.description || formData.description.length < 20) return showToast.error('يرجى كتابة وصف تفصيلي للدورة للمتابعة');
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
            if (!formData.price) return showToast.error('يرجى تحديد سعر الدورة');
            setShowConfirmModal(true);
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading('جاري إنشاء دورتك التدريبية...');
        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price || '0'),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null,
                    prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(t => t.trim()).filter(Boolean) : [],
                }),
            });
            if (res.ok) {
                const data = await res.json();
                showToast.dismiss(toastId);
                showToast.success('بداية رائعة! تم إنشاء الدورة بنجاح 🎓');
                localStorage.removeItem('course_draft');
                router.push(`/dashboard/courses/${data.id}/content`);
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

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            update('tags', [...formData.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            update('features', [...formData.features, featureInput.trim()]);
            setFeatureInput('');
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
                        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-4 transition-colors">
                            <FiArrowRight /> العودة للدورات
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">بناء أكاديمية جديدة</h1>
                        <p className="text-slate-500 font-medium mt-2">صمم تجربة تعلم فريدة لطلابك، وابدأ بعرض كافة التفاصيل الجذابة</p>
                    </div>
                    {isSavingDraft && (
                        <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 animate-pulse">
                            <FiSave /> جاري الحفظ تلقائياً...
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-[3rem] p-6 lg:p-8 shadow-premium border border-slate-50 mb-10 overflow-hidden">
                    <StepProgress steps={steps} currentStep={currentStep} />
                </div>

                <form onSubmit={handlePreSubmit} autoComplete="off" className="space-y-10">
                    <AnimatePresence mode="wait">
                        
                        {/* Step 1: Branding */}
                        {currentStep === 1 && (
                            <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="عنوان وتصنيف الدورة" icon={<FiBookOpen />}>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="label-modern italic">اسم الدورة بالكامل <span className="text-red-500">*</span></label>
                                            <input type="text" className="input-modern" placeholder="مثال: دبلوم التصميم المعماري الشامل" value={formData.title} onChange={e => update('title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="label-modern italic">التصنيف الأكاديمي <span className="text-red-500">*</span></label>
                                            <select className="input-modern bg-white font-bold" value={formData.category} onChange={e => update('category', e.target.value)}>
                                                <option value="">اختر التصنيف</option>
                                                <option value="برمجة">برمجة وتطوير</option>
                                                <option value="تصميم">تصميم وجرافيك</option>
                                                <option value="لغات">لغات وترجمة</option>
                                                <option value="أعمال">إدارة وأعمال</option>
                                                <option value="تسويق">تسويق إلكتروني</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-10 border-t border-slate-50">
                                        <label className="label-modern italic mb-4 block underline decoration-primary-indigo-100 underline-offset-8">نوع الدورة التدريبية وأسلوب التقديم <span className="text-red-500">*</span></label>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <button type="button" onClick={() => update('format', 'recorded')} className={`p-6 rounded-[2rem] border-2 text-right transition-all flex items-start gap-4 ${formData.format === 'recorded' ? 'border-primary-indigo-500 bg-primary-indigo-50 shadow-lg shadow-primary-indigo-100 scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                                <div className={`p-3 rounded-2xl ${formData.format === 'recorded' ? 'bg-primary-indigo-100 text-primary-indigo-600' : 'bg-slate-50 text-slate-400'}`}><FiVideo size={28}/></div>
                                                <div>
                                                    <h4 className={`font-black mb-1 text-lg ${formData.format === 'recorded' ? 'text-primary-indigo-700' : 'text-slate-700'}`}>دورة مسجلة (Asynchronous)</h4>
                                                    <p className={`text-xs font-bold ${formData.format === 'recorded' ? 'text-primary-indigo-600/70' : 'text-slate-400 opacity-80'}`}>محتوى مسجل بالكامل، يتعلمه الطالب بالسرعة التي تناسبه.</p>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => update('format', 'online')} className={`p-6 rounded-[2rem] border-2 text-right transition-all flex items-start gap-4 ${formData.format === 'online' ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100 scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                                <div className={`p-3 rounded-2xl ${formData.format === 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}><FiClock size={28}/></div>
                                                <div>
                                                    <h4 className={`font-black mb-1 text-lg ${formData.format === 'online' ? 'text-emerald-700' : 'text-slate-700'}`}>دورة حية (Live / Online)</h4>
                                                    <p className={`text-xs font-bold ${formData.format === 'online' ? 'text-emerald-600/70' : 'text-slate-400 opacity-80'}`}>بث مباشر عبر Zoom / Meet ومقابلات في أوقات محددة.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="تحديث المركز الإعلامي البصري" icon={<FiImage />}>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div>
                                            <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block">غلاف الدورة الأساسي (16:9) <span className="text-red-500">*</span></label>
                                            <div className="relative aspect-video rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
                                                {formData.image ? (
                                                    <>
                                                        <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                           <button type="button" onClick={() => update('image', '')} className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform"><FiX size={20}/></button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 hover:bg-white hover:text-primary-indigo-500 transition-all">
                                                        <FiImage size={40} />
                                                        <span className="text-xs font-black italic">أفلت صورة الغلاف هنا للرفع</span>
                                                    </button>
                                                )}
                                                {showCoverUploader && (
                                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md p-6 overflow-auto text-right z-20 flex flex-col justify-center"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-bold mt-3 flex items-center gap-1"><FiCheckSquare/> يتم تشفير مسار ملفاتك بشكل آمن لحظياً</p>
                                        </div>

                                        <div>
                                            <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block">الفيديو التشويقي (Trailer)</label>
                                            {formData.trailerUrl ? (
                                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-black group">
                                                    <video src={formData.trailerUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                       <button type="button" onClick={() => update('trailerUrl', '')} className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform"><FiX size={20} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center text-slate-300 hover:text-primary-indigo-500 hover:bg-white transition-all hover:shadow-lg">
                                                    <FiFilm size={40} className="mb-2" />
                                                    <span className="text-[10px] font-black italic uppercase">Add Promo Video</span>
                                                </button>
                                            )}
                                            {showTrailerUploader && (
                                                <div className="mt-4 p-4 bg-white/90 backdrop-blur-md border rounded-3xl shadow-2xl relative z-30 text-right"><FileUploader onUploadSuccess={urls => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 2: Content Specs */}
                        {currentStep === 2 && (
                            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="الوصف التفصيلي" icon={<FiLayers />}>
                                    <label className="label-modern mb-4 block font-black underline decoration-primary-indigo-200 underline-offset-8">ماذا سيتعلم الطالب؟ اكتب بوضوح <span className="text-red-500">*</span></label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor value={formData.description} onChange={val => update('description', val)} />
                                    </div>
                                </Section>

                                <Section title="المواصفات التقنية" icon={<FiClock />}>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 italic">المدة الزمنية التقديرية (Duration)</label>
                                            <input type="text" className="input-modern" placeholder="مثال: 12 ساعة تدريبية" value={formData.duration} onChange={e => update('duration', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 italic">إجمالي عدد الدروس (Sessions)</label>
                                            <input type="number" className="input-modern" placeholder="مثال: 24" value={formData.sessions} onChange={e => update('sessions', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-slate-50">
                                        <label className="label-modern mb-4 block underline decoration-primary-indigo-100 underline-offset-4">ملحقات الدورة (اختياري)</label>
                                        <div className="space-y-3">
                                            {formData.attachments.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FiCheckSquare className="text-primary-indigo-500 shrink-0" />
                                                        <span className="text-xs font-bold truncate max-w-[200px]" dir="ltr">{file.split('/').pop()}</span>
                                                    </div>
                                                    <button type="button" onClick={() => update('attachments', formData.attachments.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><FiX /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setShowAttachmentsUploader(true)} className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-indigo-600 transition-all border-2 border-dashed border-slate-200 py-6 rounded-[1.5rem] w-full hover:bg-slate-50">
                                                <FiUpload /> رفع ملفات اضافية مساعدة (PDF, ZIP...)
                                            </button>
                                            {showAttachmentsUploader && (
                                                <div className="mt-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border shadow-xl relative"><FileUploader onUploadSuccess={urls => { update('attachments', [...formData.attachments, ...urls]); setShowAttachmentsUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-10 grid md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <div className="mb-6">
                                                <label className="label-modern text-xs">متطلبات المشتري المسبقة (Prerequisites)</label>
                                                <input type="text" className="input-modern text-xs" placeholder="مثال: لابتوب، معرفة بالبرمجة" value={formData.prerequisites} onChange={e => update('prerequisites', e.target.value)} />
                                                <p className="text-[10px] text-slate-400 mt-2 font-bold">افصل بفاصلة لعرضها كنقاط منظمة</p>
                                            </div>
                                            <label className="label-modern text-xs">كلمات مفتاحية (Tags)</label>
                                            <div className="flex gap-2">
                                                <input type="text" className="input-modern flex-1 text-xs" placeholder="أضف وسم..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                                <button type="button" onClick={addTag} className="w-10 h-10 bg-primary-indigo-600 text-white rounded-[1rem] flex items-center justify-center font-bold tracking-tighter hover:bg-primary-indigo-700 transition-colors"><FiPlus /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags.map(t => (
                                                    <span key={t} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-100 hover:bg-red-50 transition-colors group">{t} <FiX className="cursor-pointer text-slate-300 group-hover:text-red-500" onClick={() => update('tags', formData.tags.filter(i => i !== t))} /></span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="label-modern text-xs">مميزات حصرية ينالها الطالب</label>
                                            <div className="flex gap-2">
                                                <input type="text" className="input-modern flex-1 text-xs" placeholder="مثال: شهادة معتمدة" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                                <button type="button" onClick={addFeature} className="w-10 h-10 bg-emerald-500 text-white rounded-[1rem] flex items-center justify-center font-bold tracking-tighter hover:bg-emerald-600 transition-colors"><FiPlus /></button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.features.map(f => (
                                                    <li key={f} className="text-[11px] font-black text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl flex items-center justify-between border-r-4 border-emerald-400 group">
                                                        {f}
                                                        <FiX className="cursor-pointer text-slate-300 group-hover:text-red-500" onClick={() => update('features', formData.features.filter(i => i !== f))} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 3: Sales & Real-World */}
                        {currentStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="التسعير والحاسبة الذكية" icon={<FiDollarSign />}>
                                    <div className="max-w-md mx-auto space-y-8 py-8">
                                        <div className="text-center space-y-4 relative">
                                            <label className="label-modern italic tracking-widest uppercase text-primary-indigo-500">السعر النهائي بعد الخصم ($)</label>
                                            <input type="number" step="0.01" className="bg-transparent border-0 border-b-4 border-slate-200 focus:border-primary-indigo-500 text-center text-6xl font-black text-primary-indigo-600 w-full outline-none transition-all placeholder:text-slate-200 glow focus:ring-0" placeholder="00.00" value={formData.price} onChange={e => update('price', e.target.value)} />
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">هذا السعر الذي سيظهر للطلاب في المتجر لتفعيل الشراء</p>
                                            <div className="absolute -top-4 -right-12 opacity-60 hover:opacity-100 transition-opacity w-32">
                                                <label className="text-[9px] font-black text-red-400 mb-1 block">السعر الأصلي الوهمي</label>
                                                <input type="number" step="0.01" className="bg-transparent border-0 border-b-2 border-red-200 focus:border-red-400 text-center text-xl font-black text-slate-400 line-through w-full outline-none transition-all placeholder:text-slate-200" placeholder="00.00" value={formData.originalPrice} onChange={e => update('originalPrice', e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-4 border-t border-slate-100 pt-6">
                                            <label className="label-modern">عداد الاستعجال والندرة (تاريخ الانتهاء)</label>
                                            <input type="datetime-local" className="input-modern text-center max-w-[250px] mx-auto bg-slate-50 border-slate-200 text-xs font-bold" value={formData.offerExpiresAt} onChange={e => update('offerExpiresAt', e.target.value)} />
                                        </div>

                                        {/* Earnings Calculator */}
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-400" />
                                            <div>
                                                <h4 className="text-sm font-black text-emerald-800">الربح الصافي الخاص بك لليوم</h4>
                                                <p className="text-[10px] text-emerald-600/70 font-bold mt-1">بعد خصم 10% رسوم صيانة وتطوير المنصة</p>
                                            </div>
                                            <div className="text-left font-black text-3xl text-emerald-600 tracking-tighter" dir="ltr">
                                                <span className="text-sm text-emerald-400 mr-1">$</span>{netEarnings}
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                {formData.format === 'online' && (
                                    <Section title="روابط البث والدروس الحية" icon={<FiLink />}>
                                        <p className="text-[10px] text-slate-400 font-bold -mt-2 mb-6 text-right">أضف روابط الاجتماعات لتسهيل وصول طلابك فور الشراء للمحاضرات الحية المرافقة (اختياري)</p>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 flex items-center gap-2"><FiVideo className="text-blue-500" /> Zoom Meeting Link</label>
                                                <input type="url" className="input-modern bg-slate-50/50" placeholder="https://zoom.us/j/..." value={formData.zoomLink} onChange={e => update('zoomLink', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 flex items-center gap-2"><FiVideo className="text-emerald-500" /> Google Meet Link</label>
                                                <input type="url" className="input-modern bg-slate-50/50" placeholder="https://meet.google.com/..." value={formData.meetLink} onChange={e => update('meetLink', e.target.value)} />
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                <Section title="خيارات العرض فور الإنشاء" icon={<FiEye />}>
                                    <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl transition-all cursor-pointer group hover:bg-slate-800" onClick={() => update('isActive', !formData.isActive)}>
                                        <div className="text-right">
                                            <h3 className="font-black text-white text-xl leading-tight uppercase group-hover:text-primary-indigo-300 transition-colors">إطلاق وعرض الدورة للبيع</h3>
                                            <p className="text-xs text-white/40 mt-1 font-bold">{formData.isActive ? 'الدورة ستظهر في واجهة المتجر الرئيسية للجميع' : 'الدورة ستبقى مخفية (وسيكون الوصول بالرابط السري فقط)'}</p>
                                        </div>
                                        <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all outline outline-offset-2 ${formData.isActive ? 'bg-primary-indigo-500 outline-primary-indigo-500/30' : 'bg-slate-700 outline-slate-800'}`}>
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

                    {/* Footer Built Actions */}
                    <div className="mt-20 flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100 gap-6 pb-12">
                        <div className="w-full md:w-auto">
                            {currentStep > 1 ? (
                                <button
                                    type="button" onClick={prevStep}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-600 border border-slate-200 rounded-2xl transition-all px-8 py-4 group hover:bg-slate-50"
                                >
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    خطوة للخلف
                                </button>
                            ) : (
                                <Link href="/dashboard/courses" className="w-full md:w-auto block text-center text-slate-400 hover:text-red-500 font-bold border border-transparent hover:bg-red-50 rounded-2xl px-8 py-4 transition-all">
                                    تراجع وألغي كل شيء
                                </Link>
                            )}
                        </div>
                        <div className="w-full md:w-auto">
                            {currentStep < 3 ? (
                                <button
                                    type="button" onClick={nextStep}
                                    className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-2xl active:scale-95 text-lg"
                                >
                                    المتابعة واختيار الإعدادات
                                    <FiArrowLeft />
                                </button>
                            ) : (
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full md:w-auto px-12 py-4 bg-gradient-to-l from-primary-indigo-600 to-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-indigo-200 active:scale-95 text-lg"
                                >
                                    {loading ? 'جاري التدشين...' : 'بناء و إطلاق الأكاديمية'}
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
                    <div className="flex items-center gap-2 text-primary-indigo-600 mb-6">
                        <FiEye size={20} />
                        <h3 className="font-black text-sm uppercase tracking-widest">معاينة الطالب المباشرة</h3>
                    </div>

                    {/* Miniature Course Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300">
                            {formData.image ? 
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> 
                            : <span className="font-bold text-xs"><FiImage size={32} className="mx-auto opacity-50 mb-2"/> سيظهر الغلاف هنا</span>}
                            
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 font-black text-[10px] text-slate-800 rounded-xl">
                                {formData.category || 'تصنيف الدورة'}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h4 className="font-black text-lg text-slate-900 line-clamp-2 leading-tight min-h-[50px]">
                                {formData.title || 'اسم الدورة التدريبية سيظهر هنا، اكتب عنواناً قوياً لجذب الانتباه...'}
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                {formData.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[9px] bg-primary-indigo-50 text-primary-indigo-600 px-2 py-1 rounded-md font-bold">{tag}</span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                                <div className="text-xl font-black text-slate-900" dir="ltr">
                                    <span className="text-sm text-slate-400 mr-1">$</span>
                                    {formData.price || '0.00'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold flex flex-col items-end">
                                    <span>{formData.duration ? formData.duration : '...ساعة تدريبية'}</span>
                                    <span>{formData.sessions ? `${formData.sessions} درس` : '...درس'}</span>
                                </div>
                            </div>
                            
                            <button className="w-full mt-4 py-3 bg-slate-50 text-slate-400 font-black rounded-2xl text-xs" disabled>
                                اشتراك وإضافة للسلة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center space-y-10 shadow-2xl border border-slate-50">
                             <div className="w-24 h-24 bg-primary-indigo-50 text-primary-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-sm"><FiCheckSquare /></div>
                             <div className="space-y-2">
                                 <h3 className="text-3xl font-black text-slate-900 leading-tight">جاهز للانطلاق!</h3>
                                 <p className="text-sm text-slate-400 font-black uppercase tracking-widest">سيتم نشر الأكاديمية وتفعيل القبول التلقائي</p>
                             </div>
                             <div className="flex flex-col gap-4">
                                <button onClick={handleSubmit} className="w-full py-5 bg-gradient-to-l from-primary-indigo-600 to-emerald-500 text-white rounded-3xl font-black shadow-lg hover:opacity-90 transition-all text-lg">تأكيد ونشر الأكاديمية الآن</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-all">مراجعة المحتوى التفصيلي</button>
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ title, icon, children }: any) {
    return (
        <div className="bg-white rounded-[3.5rem] p-8 lg:p-14 shadow-premium border border-slate-50 space-y-10 overflow-hidden relative">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <div className="h-1.5 w-12 bg-primary-indigo-100 rounded-full mt-2" />
                </div>
            </div>
            <div className="relative z-10 space-y-8">
                {children}
            </div>
        </div>
    );
}
