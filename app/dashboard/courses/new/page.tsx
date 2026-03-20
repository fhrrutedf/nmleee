'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiDollarSign, FiPackage,
    FiX, FiImage, FiCheck, FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';

const steps = [
    { id: 1, label: 'اسم الدورة' },
    { id: 2, label: 'الغلاف البصري' },
    { id: 3, label: 'التسعير' },
];

export default function NewCoursePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Upload states
    const [showCoverUploader, setShowCoverUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        image: '',
        description: 'هذه الدورة ستحول مسارك المهني.',
    });

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title) return showToast.error('يرجى كتابة اسم الدورة التدريبية');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف مناسب');
        }
        if (currentStep === 2) {
            if (!formData.image) return showToast.error('يرجى رفع صورة غلاف جذابة للدورة');
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
        const toastId = showToast.loading('جاري إنشاء دورتك الجديدة...');
        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price || '0'),
                    isActive: true,
                    status: 'PUBLISHED',
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم إنشاء الدورة بنجاح! يمكنك الآن إضافة المحتوى والدروس من صفحة التعديل.');
                router.push('/dashboard/courses');
            } else {
                throw new Error('فشل الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء حفظ الدورة. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 px-4 overflow-hidden">
            
            <div className="mb-10 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">إضافة دورة تدريبية</h1>
                <p className="text-slate-500 font-medium mt-1">ابدأ بـ 3 خطوات بسيطة ثم أضف الدروس لاحقاً بكل أريحية</p>
            </div>

            <div className="mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handlePreSubmit} autoComplete="off" className="relative space-y-8">
                <AnimatePresence mode="wait">
                    
                    {/* Step 1: Course Identity */}
                    {currentStep === 1 && (
                        <motion.div key="st1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="المعلومات الأساسية" icon={<FiPackage />}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-modern">اسم الدورة <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" required className="input-modern"
                                            placeholder="مثال: التصميم الجرافيكي المتقدم"
                                            value={formData.title}
                                            onChange={e => update('title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-modern">التصنيف <span className="text-red-500">*</span></label>
                                        <select className="input-modern bg-white" value={formData.category} onChange={e => update('category', e.target.value)}>
                                            <option value="">اختر التصنيف</option>
                                            <option value="marketing">تسويق</option>
                                            <option value="tech">برمجة وتقنية</option>
                                            <option value="art">فنون وتصميم</option>
                                            <option value="business">ريادة أعمال</option>
                                        </select>
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 2: Visuals */}
                    {currentStep === 2 && (
                        <motion.div key="st2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="هوية الدورة البصرية" icon={<FiImage />} description="هذه الصورة هي أول ما سيراه طلابك">
                                <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    {formData.image ? (
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                                            <img src={formData.image} alt="Course Cover" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => update('image', '')} className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform">&times;</button>
                                        </div>
                                    ) : showCoverUploader ? (
                                        <div className="bg-white p-4 rounded-3xl">
                                            <FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} />
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full py-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-bold flex flex-col items-center justify-center gap-3 hover:border-primary-indigo-300 hover:bg-primary-indigo-50/10 transition-all bg-white">
                                            <FiImage size={28} />
                                            <span className="text-sm">ارفع صورة الغلاف (16:9)</span>
                                        </button>
                                    )}
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 3: Pricing */}
                    {currentStep === 3 && (
                        <motion.div key="st3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="تحديد سعر الدورة" icon={<FiDollarSign />} description="حدد قيمة استثمار الطلاب في هذه الدورة">
                                <div className="relative">
                                    <label className="label-modern opacity-60">السعر (بـ ج.م)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01" className="input-modern pl-16 text-3xl font-black text-primary-indigo-600 text-center"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={e => update('price', e.target.value)}
                                        />
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">L.E</div>
                                    </div>
                                    {parseFloat(formData.price || '0') === 0 && (
                                        <p className="text-center text-emerald-500 font-bold text-xs mt-3 bg-emerald-50 py-2 rounded-xl border border-emerald-100 italic">هذه الدورة ستكون مجانية للجميع</p>
                                    )}
                                </div>
                                <div className="mt-8 p-4 bg-primary-indigo-50 rounded-2xl border border-primary-indigo-100 flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-primary-indigo-200 flex items-center justify-center text-primary-indigo-600 shrink-0">!</div>
                                    <p className="text-xs text-primary-indigo-800 font-medium leading-relaxed">بعد الحفظ، ستنتقل للوحة التحكم حيث يمكنك بناء المنهج التعليمي، إضافة الدروس والملفات، وتحديد مستوى الدورة بدقة من صفحة التعديل.</p>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Simplified Nav Footer */}
                <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
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
                            <Link href="/dashboard/courses" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4">إلغاء</Link>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <button
                                key="btn-next" type="button" onClick={nextStep}
                                className="px-8 py-3.5 bg-primary-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                الخطوة التالية
                                <FiArrowLeft />
                            </button>
                        ) : (
                            <button
                                key="btn-submit" type="submit" disabled={loading}
                                className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                            >
                                {loading ? 'جاري التحضير...' : 'إنشاء الدورة'}
                                {!loading && <FiCheck />}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                                <FiCheck />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">جاهز لإطلاق دورتك؟</h3>
                                <p className="text-sm text-slate-500 mt-2">سيتم إنشاء الدورة الآن، وستتمكن من بناء محتوى الدروس في الخطوة التالية.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleSubmit} className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-primary-indigo-700 transition-all">نعم، لنبدأ الإطلاق</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">مراجعة سريعة</button>
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
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-premium border border-slate-50 space-y-6 overflow-hidden">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-indigo-50 text-primary-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-black text-slate-900 leading-none">{title}</h2>
                    {description && <p className="text-xs text-slate-400 font-medium mt-1">{description}</p>}
                </div>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
