'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiBookOpen,
    FiX, FiImage, FiCheck, FiArrowLeft, FiFilm, FiEye, FiLayers, FiPlus, FiClock, FiCheckSquare, FiVideo, FiLink
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

    // Upload Toggles
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);

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
        isActive: true,
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

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
                    sessions: formData.sessions ? parseInt(formData.sessions) : null
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('بداية رائعة! تم إنشاء الدورة بنجاح 🎓');
                router.push('/dashboard/courses');
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

    return (
        <div className="max-w-4xl mx-auto pb-32 px-4 overflow-hidden">
            
            {/* Header */}
            <div className="mb-10 text-right">
                <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-4 transition-colors">
                    <FiArrowRight /> العودة للدورات
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">إطلاق دورة تدريبية جديدة</h1>
                <p className="text-slate-500 font-medium mt-1">صمم تجربة تعلم فريدة لطلابك، وابدأ بعرض كافة التفاصيل الجذابة</p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-[3rem] p-8 shadow-premium border border-slate-50 mb-10 overflow-hidden">
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
                            </Section>

                            <Section title="واجهة الدورة البصرية" icon={<FiImage />}>
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div>
                                        <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block">غلاف الدورة (16:9) <span className="text-red-500">*</span></label>
                                        <div className="relative aspect-video rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group">
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => update('image', '')} className="absolute top-4 left-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-lg">&times;</button>
                                                </>
                                            ) : (
                                                <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                                    <FiImage size={40} />
                                                    <span className="text-xs font-black italic">ارفع غلاف الدورة</span>
                                                </button>
                                            )}
                                            {showCoverUploader && (
                                                <div className="absolute inset-0 bg-white p-6 overflow-auto text-right z-20"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-4 block">الفيديو التشويقي (Trailer)</label>
                                        {formData.trailerUrl ? (
                                            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-black">
                                                <video src={formData.trailerUrl} className="w-full h-full" />
                                                <button type="button" onClick={() => update('trailerUrl', '')} className="absolute top-4 left-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><FiX /></button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center text-slate-300 hover:text-primary-indigo-500 hover:bg-white transition-all">
                                                <FiFilm size={40} className="mb-2" />
                                                <span className="text-[10px] font-black italic uppercase">Add Promo Video</span>
                                            </button>
                                        )}
                                        {showTrailerUploader && (
                                            <div className="mt-4 p-4 bg-white border rounded-3xl shadow-2xl relative z-30 text-right"><FileUploader onUploadSuccess={urls => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }} /></div>
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

                                 <div className="pt-10 grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="label-modern text-xs">كلمات مفتاحية (Tags)</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="input-modern flex-1 text-xs" placeholder="أضف وسم..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                            <button type="button" onClick={addTag} className="w-10 h-10 bg-primary-indigo-600 text-white rounded-[1rem] flex items-center justify-center font-bold tracking-tighter"><FiPlus /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map(t => (
                                                <span key={t} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-100">{t} <FiX className="cursor-pointer hover:text-red-500" onClick={() => update('tags', formData.tags.filter(i => i !== t))} /></span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="label-modern text-xs">مميزات حصرية ينالها الطالب</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="input-modern flex-1 text-xs" placeholder="مثال: شهادة معتمدة" value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                                            <button type="button" onClick={addFeature} className="w-10 h-10 bg-emerald-500 text-white rounded-[1rem] flex items-center justify-center font-bold tracking-tighter"><FiPlus /></button>
                                        </div>
                                        <ul className="space-y-3">
                                            {formData.features.map(f => (
                                                <li key={f} className="text-[11px] font-black text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl flex items-center justify-between border-r-4 border-emerald-400">
                                                    {f}
                                                    <FiX className="cursor-pointer text-slate-300 hover:text-red-500" onClick={() => update('features', formData.features.filter(i => i !== f))} />
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
                            <Section title="تكلفة الاشتراك والاستحقاق" icon={<FiDollarSign />}>
                                <div className="max-w-xs mx-auto text-center space-y-4 py-8">
                                    <label className="label-modern italic tracking-widest uppercase opacity-40">السعر النقدي ($)</label>
                                    <input type="number" step="0.01" className="bg-transparent border-0 border-b-4 border-primary-indigo-100 focus:border-primary-indigo-500 text-center text-5xl font-black text-slate-900 w-full outline-none transition-all placeholder:opacity-10" placeholder="000.00" value={formData.price} onChange={e => update('price', e.target.value)} />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">هذا السعر الذي سيظهر للطلاب في المتجر</p>
                                </div>
                            </Section>

                            <Section title="روابط البث والدروس الحية" icon={<FiLink />}>
                                 <p className="text-[10px] text-slate-400 font-bold -mt-2 mb-6 text-right">أضف روابط الاجتماعات لتسهيل وصول طلابك فور الشراء</p>
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

                            <Section title="خيارات العرض فور الإنشاء" icon={<FiEye />}>
                                <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl transition-all cursor-pointer group" onClick={() => update('isActive', !formData.isActive)}>
                                    <div className="text-right">
                                        <h3 className="font-black text-white text-lg leading-tight uppercase group-hover:text-primary-indigo-300 transition-colors">نشر الدورة وإتاحتها للبيع</h3>
                                        <p className="text-xs text-white/40 mt-1 font-bold">{formData.isActive ? 'الدورة ستظهر في واجهة المتجر الرئيسية' : 'الدورة ستبقى مخفية (لليكون الوصول بالرابط فقط)'}</p>
                                    </div>
                                    <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all ${formData.isActive ? 'bg-primary-indigo-500' : 'bg-slate-700'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.isActive ? 'translate-x-7' : 'translate-x-0'} shadow-sm shadow-black/40`} />
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Footer Course */}
                <div className="mt-20 flex items-center justify-between pt-10 border-t border-slate-100">
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
                            <Link href="/dashboard/courses" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4 py-2">تراجع</Link>
                        )}
                    </div>
                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <button
                                type="button" onClick={nextStep}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-2xl active:scale-95"
                            >
                                المتابعة
                                <FiArrowLeft />
                            </button>
                        ) : (
                            <button
                                type="submit" disabled={loading}
                                className="px-12 py-4 bg-gradient-to-r from-primary-indigo-500 to-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                            >
                                {loading ? 'جاري الإنشاء...' : 'نشر وتثبيت الدورة'}
                                {!loading && <FiCheckSquare />}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center space-y-10 shadow-2xl border border-slate-50">
                             <div className="w-24 h-24 bg-primary-indigo-50 text-primary-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-sm"><FiCheckSquare /></div>
                             <div className="space-y-2">
                                 <h3 className="text-3xl font-black text-slate-900 leading-tight">جاهز للانطلاق!</h3>
                                 <p className="text-sm text-slate-400 font-black uppercase tracking-widest">سيتم نشر الدورة وتفعيل كافة المميزات فوراً</p>
                             </div>
                             <div className="flex flex-col gap-4">
                                <button onClick={handleSubmit} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-lg hover:bg-black transition-all">تأكيد ونشر الدورة</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-all">مراجعة المحتوى</button>
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
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-premium border border-slate-50 space-y-10 overflow-hidden relative">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <div className="h-1.5 w-12 bg-primary-indigo-100 rounded-full mt-2" />
                </div>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
