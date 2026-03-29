'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiBookOpen,
    FiX, FiImage, FiCheck, FiArrowLeft, FiFilm, FiEye, FiLayers, FiPlus, FiClock, FiCheckSquare, FiVideo, FiLink, FiSave, FiAlertCircle, FiEdit2
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import BunnyUpload from '@/components/instructor/BunnyUpload';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';
import CourseContentBuilder from '@/components/instructor/CourseContentBuilder';

// Steps moved inside component to be dynamic

export default function NewCoursePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [lessonCount, setLessonCount] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [finalCourseId, setFinalCourseId] = useState<string | null>(null);
    const [finalSlug, setFinalSlug] = useState<string | null>(null);
    const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

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
        startTime: '', // New field for live sessions
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    const dynamicSteps = [
        { id: 1, label: 'هوية الأكاديمية' },
        { id: 2, label: 'مواصفات المحتوى' },
        ...(formData.format === 'recorded' ? [{ id: 3, label: 'بناء المنهج' }] : []),
        { id: 4, label: 'التسعير ووسائل البث' },
    ];

    // Load Draft
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            localStorage.removeItem('course_draft');
            localStorage.removeItem('course_draft_id');
            localStorage.removeItem('course_draft_step');
            return;
        }

        const saved = localStorage.getItem('course_draft');
        if (saved) {
            try { setFormData(JSON.parse(saved)); } catch (e) {}
        }
        const savedDraftId = localStorage.getItem('course_draft_id');
        if (savedDraftId) setDraftId(savedDraftId);

        const savedStep = localStorage.getItem('course_draft_step');
        if (savedStep) setCurrentStep(parseInt(savedStep));
    }, [searchParams]);

    // Auto Save Draft
    useEffect(() => {
        if (!formData.title && !formData.description) return;

        const timer = setTimeout(() => {
            setIsSavingDraft(true);
            localStorage.setItem('course_draft', JSON.stringify(formData));
            localStorage.setItem('course_draft_step', currentStep.toString());
            if (draftId) localStorage.setItem('course_draft_id', draftId);
            setTimeout(() => setIsSavingDraft(false), 1000);
        }, 1000); // Debounce save by 1 second

        return () => clearTimeout(timer);
    }, [formData, currentStep, draftId]);

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const nextStep = async () => {
        if (currentStep === 1) {
            if (!formData.title) return showToast.error('يرجى كتابة عنوان الدورة للمتابعة');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف للمتابعة');
            if (!formData.image) return showToast.error('يرجى رفع صورة الغلاف للمتابعة');
        }
        if (currentStep === 2) {
            if (!formData.description || formData.description.length < 20) return showToast.error('يرجى كتابة وصف تفصيلي للدورة للمتابعة');
            
            // Auto draft creation if moving past Step 2
            if (!draftId) {
                const toastId = showToast.loading('جاري تحضير بيئة المنهج الذكية...');
                try {
                    const res = await fetch('/api/courses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            price: 0,
                            isActive: false, // Create as invisible draft
                        }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setDraftId(data.id);
                        showToast.dismiss(toastId);
                    } else {
                        showToast.dismiss(toastId);
                        showToast.error('فشل تحضير المنهج');
                        return; // Prevent advancing if failing
                    }
                } catch (e) {
                    showToast.dismiss(toastId);
                    showToast.error('خطأ في الاتصال بالخادم');
                    return;
                }
            }
        }

        if (currentStep === 3) {
            // Validation for Recorded courses - must have at least one lesson
            if (formData.format === 'recorded' && lessonCount === 0) {
                return showToast.error('خطوة أخيرة هامة: يرجى إضافة "درس واحد" على الأقل لنتمكن من المتابعة لتسعير دورتك 🎓');
            }
        }
        
        let targetStep = currentStep + 1;
        if (currentStep === 2 && formData.format === 'online') {
            targetStep = 4;
        }
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        let targetStep = currentStep - 1;
        if (currentStep === 4 && formData.format === 'online') {
            targetStep = 2;
        }
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep === 4) {
            if (!formData.price) return showToast.error('يرجى تحديد سعر الدورة');
            setShowConfirmModal(true);
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading(draftId ? 'جاري إطلاق الأكاديمية ونشر البيانات...' : 'جاري إنشاء دورتك التدريبية...');
        try {
            const method = draftId ? 'PUT' : 'POST';
            const endpoint = draftId ? `/api/courses/${draftId}` : '/api/courses';
            const res = await fetch(endpoint, {
                method,
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
                localStorage.removeItem('course_draft_id');
                localStorage.removeItem('course_draft_step');
                setFinalCourseId(data.id);
                setFinalSlug(data.slug);
                setCreatorUsername(data.user?.username || null);
                setShowSuccessModal(true);
                // Notification: We stay here and show a success modal instead of immediate push
                // router.push(`/dashboard/courses/${data.id}/content`);
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
                        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-accent font-black text-[10px] uppercase tracking-widest mb-4 transition-all">
                            <FiArrowRight /> BACK TO ACADEMY
                        </Link>
                        <h1 className="text-4xl font-black text-ink tracking-tighter">Architect New Program</h1>
                        <p className="text-gray-400 font-bold mt-2">Design a premium learning experience for your audience.</p>
                    </div>
                    {isSavingDraft && (
                        <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 animate-pulse">
                            <FiSave /> جاري الحفظ تلقائياً...
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-slate-50 mb-10 overflow-hidden">
                    <StepProgress steps={dynamicSteps} currentStep={currentStep} />
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 block border-b border-gray-100 pb-3">Program Delivery Model <span className="text-red-500">*</span></label>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <button type="button" onClick={() => update('format', 'recorded')} className={`p-8 rounded-[2rem] border-2 text-right transition-all flex items-start gap-5 ${formData.format === 'recorded' ? 'border-accent bg-accent/[0.03] shadow-xl shadow-accent/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${formData.format === 'recorded' ? 'bg-accent text-white' : 'bg-gray-50 text-gray-400'}`}><FiVideo size={24}/></div>
                                                <div>
                                                    <h4 className={`font-black mb-1 text-lg tracking-tight ${formData.format === 'recorded' ? 'text-ink' : 'text-gray-400'}`}>Recorded Assets</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider opacity-60">High-leverage asynchronous learning.</p>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => update('format', 'online')} className={`p-8 rounded-[2rem] border-2 text-right transition-all flex items-start gap-5 ${formData.format === 'online' ? 'border-accent bg-accent/[0.03] shadow-xl shadow-accent/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all ${formData.format === 'online' ? 'bg-accent text-white' : 'bg-gray-50 text-gray-400'}`}><FiClock size={24}/></div>
                                                <div>
                                                    <h4 className={`font-black mb-1 text-lg tracking-tight ${formData.format === 'online' ? 'text-ink' : 'text-gray-400'}`}>Institutional Live</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider opacity-60">Synchronous coaching & live streaming.</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="تحديث المركز الإعلامي البصري" icon={<FiImage />}>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div>
                                            <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block">غلاف الدورة الأساسي (16:9) <span className="text-red-500">*</span></label>
                                            <div className="relative aspect-video rounded-xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
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
                                                        <span className="text-xs font-bold italic">أفلت صورة الغلاف هنا للرفع</span>
                                                    </button>
                                                )}
                                                {showCoverUploader && (
                                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md p-6 overflow-auto text-right z-20 flex flex-col justify-center"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-blue-600 font-bold mt-3 flex items-center gap-1"><FiCheckSquare/> يتم تشفير مسار ملفاتك بشكل آمن لحظياً</p>
                                        </div>

                                        <div>
                                            <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block text-slate-700">الفيديو التشويقي (Trailer) 🔥</label>
                                            <div className="relative aspect-video rounded-xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
                                                {formData.trailerUrl ? (
                                                    <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
                                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                                                            <FiFilm size={40} />
                                                        </div>
                                                        <p className="font-bold text-slate-800 text-sm">تم رفع فيديو ترويجي بنجاح</p>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => update('trailerUrl', '')} 
                                                            className="mt-4 px-6 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            حذف واستبدال الفيديو
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 sm:p-8 w-full h-full flex flex-col justify-center">
                                                        <p className="text-[10px] font-bold text-slate-400 mb-6 text-center uppercase tracking-widest leading-relaxed">ارفع فيديو تعريفي لا يتجاوز دقيقتين لجذب انتباه الطلاب واقناعهم بالدورة</p>
                                                        <BunnyUpload 
                                                            onComplete={(data) => {
                                                                if (data) {
                                                                    const embedUrl = `https://iframe.mediadelivery.net/embed/${data.libraryId}/${data.videoId}`;
                                                                    update('trailerUrl', embedUrl);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-indigo-400 font-bold mt-3 flex items-center gap-1 leading-relaxed"><FiAlertCircle /> ملاحظة: فيديوهات Bunny Stream مشفرة ولا يمكن تحميلها بشكل غير قانوني</p>
                                        </div>
                                    </div>
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 2: Content Specs */}
                        {currentStep === 2 && (
                            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section 
                                    title={formData.format === 'online' ? "تفاصيل ومحتوى الجلسة الحية" : "الوصف التفصيلي للمنهج"} 
                                    icon={<FiLayers />}
                                >
                                    <label className="label-modern mb-4 block font-bold underline decoration-primary-indigo-200 underline-offset-8">
                                        {formData.format === 'online' ? "ماذا سيتناول الطلاب في هذه الجلسة الحية؟" : "ماذا سيتعلم الطالب؟ اكتب بوضوح"} 
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="min-h-[400px]">
                                        <RichTextEditor value={formData.description} onChange={val => update('description', val)} />
                                    </div>
                                </Section>

                                <Section title="المواصفات والوقت" icon={<FiClock />}>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 italic">المدة الزمنية للجلسة / الدورة</label>
                                            <input type="text" className="input-modern" placeholder={formData.format === 'online' ? "مثال: 90 دقيقة" : "مثال: 12 ساعة تدريبية"} value={formData.duration} onChange={e => update('duration', e.target.value)} />
                                        </div>
                                        {formData.format === 'online' ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-blue-600 italic">موعد البث (بتوقيتك المحلي)</label>
                                                <input type="datetime-local" className="input-modern border-blue-100 bg-blue-50/30" value={formData.startTime} onChange={e => update('startTime', e.target.value)} />
                                                <p className="text-[9px] text-slate-400 font-bold">سيتم عرض الموعد للطالب حسب توقيته المحلي تلقائياً</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 italic">إجمالي عدد الدروس (Sessions)</label>
                                                <input type="number" className="input-modern" placeholder="مثال: 24" value={formData.sessions} onChange={e => update('sessions', e.target.value)} />
                                            </div>
                                        )}
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
                                                <button type="button" onClick={addFeature} className="w-10 h-10 bg-blue-500 text-white rounded-[1rem] flex items-center justify-center font-bold tracking-tighter hover:bg-blue-600 transition-colors"><FiPlus /></button>
                                            </div>
                                            <ul className="space-y-3">
                                                {formData.features.map(f => (
                                                    <li key={f} className="text-[11px] font-bold text-slate-600 bg-blue-50/50 p-2.5 rounded-xl flex items-center justify-between border-r-4 border-blue-400 group">
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

                        {/* Step 3: Curriculum Builder */}
                        {currentStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="ورشة بناء المحتوى المتقدم" icon={<FiLayers />}>
                                    <div className="bg-slate-50/50 -mx-6 -mt-6 sm:-mx-10 sm:-mt-10 p-6 sm:p-10 rounded-t-[3rem] border-b border-slate-100">
                                        <div className="max-w-xl">
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">منهج الدورة الاحترافي</h3>
                                            <p className="text-sm font-bold text-slate-500">تم حفظ بياناتك المبدئية بنجاح! الآن قم بترتيب الوحدات وإضافة مقاطع الفيديو، الاختباء، والمواد (جميع التعديلات هنا تحفظ تلقائياً دون الحاجة لضغط حفظ).</p>
                                        </div>
                                    </div>
                                    {draftId ? (
                                        <div className="pt-8">
                                            <CourseContentBuilder courseId={draftId} onLessonsChange={setLessonCount} />
                                        </div>
                                    ) : (
                                        <div className="text-center p-10 text-red-500 font-bold bg-red-50 rounded-2xl border-2 border-red-100 italic">حدث خطأ. لم يتم التعرف على الدورة المؤقتة. الرجاء العودة والتأكد من البيانات.</div>
                                    )}
                                </Section>
                            </motion.div>
                        )}

                        {/* Step 4: Sales & Real-World */}
                        {currentStep === 4 && (
                            <motion.div key="st4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <Section title="التسعير والتسويق " icon={<FiDollarSign />}>
                                    <div className="grid md:grid-cols-2 gap-10 pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="label-modern underline decoration-blue-200 underline-offset-8">سعر البيع النهائي ($)</label>
                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">السعر المعتمد</span>
                                            </div>
                                            <div className="relative group/price">
                                                <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center bg-blue-50 text-blue-600 rounded-r-2xl border-l border-blue-100 transition-colors group-focus-within/price:bg-blue-600 group-focus-within/price:text-white">
                                                    <FiDollarSign size={24}/>
                                                </div>
                                                <input type="number" required className="input-modern pr-20 text-4xl font-bold text-slate-800 focus:bg-white transition-all text-center tracking-tighter" placeholder="0.00" value={formData.price} onChange={e => update('price', e.target.value)} />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mt-4">
                                                <span className="text-[11px] font-bold text-slate-400 italic">صافي أرباحك التقريبي (بعد عمولة المنصة 10%):</span>
                                                <span className="text-lg font-bold text-blue-700">{netEarnings} $</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="label-modern underline decoration-red-200 underline-offset-8">السعر الوهمي / السابق ($)</label>
                                                <span className="text-[10px] font-bold bg-red-50 text-red-500 px-3 py-1 rounded-full uppercase tracking-tighter">للخصم فقط</span>
                                            </div>
                                            <div className="relative group/price-old">
                                                <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center bg-slate-50 text-slate-400 rounded-r-2xl border-l border-slate-100 transition-colors group-focus-within/price-old:bg-red-500 group-focus-within/price-old:text-white">
                                                    <FiX size={24}/>
                                                </div>
                                                <input type="number" className="input-modern pr-20 text-3xl font-bold text-slate-400 line-through focus:bg-white transition-all text-center" placeholder="99.00" value={formData.originalPrice} onChange={e => update('originalPrice', e.target.value)} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed pr-2 italic">سيظهر هذا السعر مشطوباً لإغراء الطالب بعرض "لفترة محدودة" وفرصة لا تعوض.</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-slate-50">
                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="label-modern text-xs">تاريخ انتهاء عرض الخصم (اختياري)</label>
                                                <input type="datetime-local" className="input-modern bg-blue-50/30 border-blue-100" value={formData.offerExpiresAt} onChange={e => update('offerExpiresAt', e.target.value)} />
                                                <p className="text-[10px] text-blue-600 font-bold">سيظهر عداد تنازلي (Urgency) في صفحة البيع لتحفيز الشراء الفوري.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="label-modern text-xs">كورس إضافي لعرضه في الدفع (Order Bump)</label>
                                                <select className="input-modern bg-slate-50 text-xs font-bold" value={formData.upsellCourseId} onChange={e => update('upsellCourseId', e.target.value)}>
                                                    <option value="">لا يوجد عرض إضافي</option>
                                                    {/* We could fetch other courses here, for now it's static or empty */}
                                                </select>
                                                <p className="text-[10px] text-slate-400 font-bold italic">ارفع قيمة سلة الشراء عبر عرض كورس مكمل بخصم خاص.</p>
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                {formData.format === 'online' && (
                                    <Section title="روابط البث والدروس الحية" icon={<FiLink />}>
                                        <p className="text-[10px] text-slate-400 font-bold -mt-2 mb-6 text-right">أضف روابط الاجتماعات لتسهيل وصول طلابك فور الشراء للمحاضرات الحية المرافقة (اختياري)</p>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiVideo className="text-blue-500" /> Zoom Meeting Link</label>
                                                <input type="url" className="input-modern bg-slate-50/50" placeholder="https://zoom.us/j/..." value={formData.zoomLink} onChange={e => update('zoomLink', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiVideo className="text-blue-500" /> Google Meet Link</label>
                                                <input type="url" className="input-modern bg-slate-50/50" placeholder="https://meet.google.com/..." value={formData.meetLink} onChange={e => update('meetLink', e.target.value)} />
                                            </div>
                                        </div>
                                    </Section>
                                )}

                                <Section title="خيارات العرض فور الإنشاء" icon={<FiEye />}>
                                    <div className={`flex items-center justify-between p-8 rounded-2xl border transition-all cursor-pointer group hover:opacity-95 ${formData.isActive ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100'}`} onClick={() => update('isActive', !formData.isActive)}>
                                        <div className="text-right">
                                            <h3 className={`font-bold text-xl leading-tight transition-colors ${formData.isActive ? 'text-white' : 'text-slate-800'}`}>إطلاق وعرض الدورة للبيع</h3>
                                            <p className={`text-xs mt-1 font-bold ${formData.isActive ? 'text-white/40' : 'text-slate-400'}`}>{formData.isActive ? 'الدورة ستظهر في واجهة المتجر الرئيسية للجميع' : 'الدورة ستبقى مخفية (وسيكون الوصول بالرابط السري فقط)'}</p>
                                        </div>
                                        <div className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${formData.isActive ? 'bg-primary-indigo-500' : 'bg-slate-100'}`}>
                                            <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData.isActive ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-8 bg-blue-900 rounded-2xl border border-blue-800 shadow-lg transition-all cursor-pointer hover:bg-blue-800 group" onClick={() => update('enablePPP', !formData.enablePPP)}>
                                        <div className="text-right">
                                            <h3 className="font-bold text-white text-xl leading-tight transition-colors group-hover:text-blue-400">تفعيل التسعير العادل (PPP Pricing) 🌍</h3>
                                            <p className="text-xs text-blue-200 mt-1 max-w-lg leading-relaxed">تخفيض السعر تلقائياً للزوار من الدول النامية حسب القوة الشرائية، لضمان أعلى نسبة مبيعات للجميع دون حرمان أحد.</p>
                                        </div>
                                        <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all outline outline-offset-2 ${formData.enablePPP ? 'bg-blue-500 outline-blue-500/30' : 'bg-blue-950 outline-blue-900'}`}>
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
                            {currentStep < 4 ? (
                                <button
                                    type="button" onClick={nextStep}
                                    className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-2xl active:scale-95 text-lg"
                                >
                                    {currentStep === 3 || (currentStep === 2 && formData.format === 'online') ? 'التالي لتسعير الدورة' : 'المتابعة واختيار الإعدادات'}
                                    <FiArrowLeft />
                                </button>
                            ) : (
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full md:w-auto px-12 py-5 bg-ink text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl shadow-ink/20 active:scale-95 group"
                                >
                                    {loading ? 'Processing Protocol...' : 'Deploy Program Architecture'}
                                    {!loading && <FiCheck className="text-xl group-hover:scale-125 transition-transform text-accent" />}
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
                        <h3 className="font-bold text-sm uppercase tracking-widest">معاينة الطالب المباشرة</h3>
                    </div>

                    {/* Miniature Course Card */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300">
                            {formData.image ? 
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> 
                            : <span className="font-bold text-xs"><FiImage size={32} className="mx-auto opacity-50 mb-2"/> سيظهر الغلاف هنا</span>}
                            
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 font-bold text-[10px] text-slate-800 rounded-xl">
                                {formData.category || 'تصنيف الدورة'}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h4 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight min-h-[50px]">
                                {formData.title || 'اسم الدورة التدريبية سيظهر هنا، اكتب عنواناً قوياً لجذب الانتباه...'}
                            </h4>
                            
                            <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                {formData.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[9px] bg-primary-indigo-50 text-primary-indigo-600 px-2 py-1 rounded-md font-bold">{tag}</span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                                <div className="text-xl font-bold text-slate-900" dir="ltr">
                                    <span className="text-sm text-slate-400 mr-1">$</span>
                                    {formData.price || '0.00'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold flex flex-col items-end">
                                    <span>{formData.duration ? formData.duration : '...ساعة تدريبية'}</span>
                                    <span>{formData.sessions ? `${formData.sessions} درس` : '...درس'}</span>
                                </div>
                            </div>
                            
                            <button className="w-full mt-4 py-3 bg-slate-50 text-slate-400 font-bold rounded-2xl text-xs" disabled>
                                اشتراك وإضافة للسلة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-12 max-w-sm w-full text-center space-y-10 shadow-2xl border border-slate-50">
                             <div className="w-24 h-24 bg-primary-indigo-50 text-primary-indigo-600 rounded-xl flex items-center justify-center mx-auto text-5xl shadow-sm"><FiCheckSquare /></div>
                             <div className="space-y-2">
                                 <h3 className="text-3xl font-bold text-slate-900 leading-tight">جاهز للانطلاق!</h3>
                                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">سيتم نشر الأكاديمية وتفعيل القبول التلقائي</p>
                             </div>
                             <div className="flex flex-col gap-4">
                                <button onClick={handleSubmit} className="w-full py-5 bg-gradient-to-l from-primary-indigo-600 to-blue-500 text-white rounded-3xl font-bold shadow-lg hover:opacity-90 transition-all text-lg">تأكيد ونشر الأكاديمية الآن</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-all">مراجعة المحتوى التفصيلي</button>
                             </div>
                        </motion.div>
                    </div>
                )}

                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[4rem] p-12 max-w-xl w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-indigo-500 via-blue-500 to-primary-indigo-500 animate-gradient-x" />
                            
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-10 text-4xl shadow-lg ring-8 ring-blue-50">🎓</div>
                            
                            <div className="space-y-4 mb-12">
                                <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">تهانينا! دورتك جاهزة ✨</h2>
                                <p className="text-slate-500 font-bold text-lg leading-relaxed">تم إطلاق الأكاديمية بنجاح الآن. يمكنك البدء باستقبال الطلاب أو الاستمرار في تحسين المنهج.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.push(`/dashboard/courses/${finalCourseId}/content`)}
                                    className="w-full py-5 bg-primary-indigo-600 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-primary-indigo-700 transition-all shadow-xl active:scale-95"
                                >
                                    إدارة الدروس <FiLayers />
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/courses/${finalCourseId}/edit`)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    تعديل التفاصيل <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/courses')}
                                    className="w-full py-5 bg-slate-100 text-slate-600 rounded-3xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    لوحة التحكم <FiArrowLeft />
                                </button>
                                <Link
                                    href={creatorUsername && finalSlug ? `/${creatorUsername}/products/${finalSlug}` : `/dashboard/courses/${finalCourseId}/content`}
                                    target="_blank"
                                    className="w-full py-5 bg-blue-100 text-blue-700 rounded-3xl font-bold hover:bg-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                                >
                                    لمحة عن المتجر <FiEye />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ title, icon, children }: any) {
    return (
        <div className="bg-white rounded-3xl p-8 lg:p-14 shadow-lg border border-slate-50 space-y-10 overflow-hidden relative">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    <div className="h-1.5 w-12 bg-primary-indigo-100 rounded-full mt-2" />
                </div>
            </div>
            <div className="relative z-10 space-y-8">
                {children}
            </div>
        </div>
    );
}
