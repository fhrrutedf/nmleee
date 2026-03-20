'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FiSave, FiArrowRight, FiBookOpen, FiImage, 
    FiEye, FiTrendingUp, FiZap, FiCheck, FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import CourseBuilder from '@/components/dashboard/CourseBuilder';
import StepProgress from '@/components/ui/StepProgress';

const steps = [
    { id: 1, label: 'هوية الدورة' },
    { id: 2, label: 'بناء المنهج التعليمي' },
    { id: 3, label: 'التسعير والنشر' },
];

export default function NewCoursePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showImageUploader, setShowImageUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: '',
        trailerUrl: '',
        isActive: true,
        duration: 0,
        sessions: 0,
        tags: [] as string[],
        structure: [] as any[],
        pricingType: 'fixed' as 'fixed' | 'free' | 'pwyw',
    });

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const handleBuilderUpdate = (data: { sessions: number; totalDuration: number; structure: any[] }) => {
        setFormData(prev => ({
            ...prev,
            sessions: data.sessions,
            duration: data.totalDuration,
            structure: data.structure
        }));
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title) return showToast.error('يرجى إدخال عنوان الدورة');
            if (formData.description.length < 20) return showToast.error('وصف الدورة قصير جداً');
        }
        if (currentStep === 2 && formData.sessions === 0) {
            return showToast.error('يرجى إضافة درس واحد على الأقل للمنهج');
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
        setShowConfirmModal(true);
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading('جاري بناء الدورة ونشرها...');

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: formData.pricingType === 'free' ? 0 : parseFloat(formData.price || '0'),
                    duration: formData.duration.toString(), // API Expects string based on previous schema
                    sessions: formData.sessions,
                })
            });

            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تهانينا! دورتك التدريبية أصبحت جاهزة للطلاب');
                router.push('/dashboard/courses');
            } else {
                throw new Error('خطأ في الانشاء');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ غير متوقع أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4">
            
            {/* Header Redesign */}
            <div className="mb-10 text-right flex justify-between items-end">
                <div>
                    <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-4 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                        <FiArrowRight /> العودة للدورات
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">إطلاق دورة تدريبية</h1>
                    <p className="text-slate-500 font-medium mt-1">ابنِ منهجك التعليمي وشارك خبرتك مع العالم</p>
                </div>
                
                <button 
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-primary-indigo-600 font-black text-sm bg-indigo-50 px-5 py-3 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm"
                >
                    <FiEye /> {showPreview ? 'إغلاق المعاينة' : 'معاينة كطالب'}
                </button>
            </div>

            {/* Steps Tracker */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-premium border border-slate-50 mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            {showPreview ? (
                <div className="bg-slate-50 rounded-[3rem] p-8 lg:p-12 border-2 border-dashed border-slate-200">
                    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                        {/* Main Content Preview */}
                        <div className="flex-1 space-y-6">
                            <div className="aspect-video bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <FiZap className="text-white text-6xl relative z-10 animate-pulse" />
                                <div className="absolute bottom-6 right-6 left-6 flex justify-between items-center z-10">
                                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-primary-indigo-500" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight">
                                {formData.title || 'عنوان الدورة المستهدف هنا'}
                            </h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {formData.description || 'هنا سيظهر وصف الدورة الشامل الذي يشرح للطلاب ما سيتعلمونه وكيف ستتغير حياتهم المهنية بعد إكمال هذا المنهج الشامل...'}
                            </p>
                        </div>

                        {/* Sidebar Preview */}
                        <div className="w-full lg:w-80 space-y-4">
                            <div className="bg-white p-6 rounded-[2rem] shadow-premium border border-slate-100">
                                <div className="text-3xl font-black text-slate-900 mb-2">
                                    {formData.pricingType === 'free' ? 'مجاناً' : `${formData.price || '0'} ج.م`}
                                </div>
                                <button type="button" className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-black shadow-glow mb-4">اشترك الآن</button>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                        <span>مدة المحتوى</span>
                                        <span className="text-slate-900">{formData.duration} دقيقة</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                        <span>عدد الدروس</span>
                                        <span className="text-slate-900">{formData.sessions} درس</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 mr-2">منهج الدورة</p>
                                {formData.structure.length > 0 ? (
                                    formData.structure.map((s: any) => (
                                        <div key={s.id} className="mb-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-black text-slate-700 flex justify-between">
                                            <span>{s.title}</span>
                                            <span className="opacity-40">{s.lessons.length} دروس</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-slate-300 mr-2 italic">لم يتم إضافة أقسام بعد</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 text-center">
                        <button type="button" onClick={() => setShowPreview(false)} className="text-primary-indigo-600 font-black flex items-center gap-2 mx-auto">
                            <FiArrowRight /> العودة لوضع التعديل
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handlePreSubmit} autoComplete="off" className="relative">
                    <AnimatePresence mode="wait">
                        
                        {/* Step 1: Course Identity */}
                        {currentStep === 1 && (
                            <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <SectionBuilder title="هوية الدورة" icon={<FiBookOpen />} description="المعلومات التي ستظهر في صفحة الهبوط الخاصة بالدورة">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="label-modern">اسم الدورة <span className="text-red-500">*</span></label>
                                            <input
                                                type="text" required className="input-modern"
                                                placeholder="مثال: من الصفر إلى الإحتراف في علم البيانات"
                                                value={formData.title}
                                                onChange={e => update('title', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="label-modern">وصف الدورة <span className="text-red-500">*</span></label>
                                            <textarea
                                                className="input-modern min-h-[150px] py-4"
                                                placeholder="اشرح للطلاب ماذا سيتعلمون وكيف سيستفيدون..."
                                                value={formData.description}
                                                onChange={e => update('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <label className="label-modern mb-4 block">صورة غلاف الدورة</label>
                                            {formData.image ? (
                                                <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                                                    <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => update('image', '')} className="absolute top-4 left-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-xl">&times;</button>
                                                </div>
                                            ) : showImageUploader ? (
                                                <FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowImageUploader(false); }} />
                                            ) : (
                                                <button type="button" onClick={() => setShowImageUploader(true)} className="w-full py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex flex-col items-center justify-center gap-4 hover:border-primary-indigo-400 hover:text-primary-indigo-600 transition-all bg-white">
                                                    <FiImage size={32} />
                                                    ارفع صورة الغلاف
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </SectionBuilder>
                            </motion.div>
                        )}

                        {/* Step 2: Builders Hub */}
                        {currentStep === 2 && (
                            <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="mb-6 p-6 bg-primary-indigo-600 text-white rounded-[2.5rem] shadow-glow flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black">بناء المنهج التعليمي</h2>
                                        <p className="text-xs text-white/70 font-bold">يتم حساب المدة الإجمالية وعدد الدروس آلياً</p>
                                    </div>
                                    <FiTrendingUp size={32} />
                                </div>
                                <CourseBuilder onUpdate={handleBuilderUpdate} />
                            </motion.div>
                        )}

                        {/* Step 3: Pricing & Finalize */}
                        {currentStep === 3 && (
                            <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <SectionBuilder title="التسعير والنشر" icon={<FiZap />} description="كيف ستحصل على أرباحك من هذه الدورة؟">
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {[
                                            { id: 'fixed', label: 'سعر محدد', d: 'سعر ثابت للجميع' },
                                            { id: 'pwyw', label: 'ادفع ما تشاء', d: 'دعم من الطلاب' },
                                            { id: 'free', label: 'دورة مجانية', d: 'وصول عام' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id} type="button"
                                                onClick={() => update('pricingType', opt.id)}
                                                className={`p-4 rounded-3xl text-sm font-black border-2 transition-all flex flex-col items-center gap-2 ${formData.pricingType === opt.id ? 'border-primary-indigo-600 bg-primary-indigo-50 text-primary-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <span>{opt.label}</span>
                                                <span className="text-[10px] opacity-60">{opt.d}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {formData.pricingType !== 'free' && (
                                        <div className="space-y-4">
                                            <label className="label-modern">سعر الدورة (ج.م)</label>
                                            <input
                                                type="number" step="0.01" className="input-modern"
                                                placeholder="مثال: 499"
                                                value={formData.price}
                                                onChange={e => update('price', e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                            />
                                        </div>
                                    )}
                                </SectionBuilder>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Action Footer */}
                    <div className="mt-12 flex items-center justify-between pt-10 border-t border-slate-100">
                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200">
                                    السابق
                                </button>
                            )}
                            <Link href="/dashboard/courses" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4 py-4">إلغاء</Link>
                        </div>
                        <div className="flex gap-4">
                            {currentStep < 3 ? (
                                <button type="button" onClick={nextStep} className="px-10 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 flex items-center gap-3">
                                    الخطوة التالية
                                    <FiArrowLeft />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="px-12 py-4 bg-primary-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 flex items-center gap-3">
                                    {loading ? 'جاري النشر...' : 'حفظ ونشر المنهج'}
                                    {!loading && <FiCheck />}
                                </button>
                            )}
                        </div>
                    </div>
            </form>
            )}

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
                                <h3 className="text-2xl font-black text-slate-900 mb-2">أطلق دورتك العلمية؟</h3>
                                <p className="text-sm text-slate-500 font-medium">سيتم توفير دورة "{formData.title}" لطلابك فور تأكيدك.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleSubmit}
                                    className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-primary-indigo-700 transition-all font-sans"
                                >
                                    نعم، أنشر المنهج الآن
                                </button>
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all font-sans"
                                >
                                    مراجعة المنهج مرة أخرى
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionBuilder({ title, icon, description, children }: any) {
    return (
        <div className="bg-white rounded-[3rem] p-8 lg:p-10 shadow-premium border border-slate-50 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-indigo-50 text-primary-indigo-600 rounded-[1.5rem] flex items-center justify-center text-xl shadow-sm">
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-400 font-medium">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
