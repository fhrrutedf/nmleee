'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiX, FiImage, FiCheck, FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';
import StepProgress from '@/components/ui/StepProgress';

const steps = [
    { id: 1, label: 'أصل المنتج' },
    { id: 2, label: 'الهوية البصرية' },
    { id: 3, label: 'السعر والبيع' },
];

export default function NewProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Upload states
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showFileUploader, setShowFileUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        image: '',
        fileUrl: '',
        fileType: 'pdf',
        description: 'منتج رقمي رائع يستحق الاقتناء.', // Default description for new items
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
            if (!formData.fileUrl) return showToast.error('يرجى رفع الملف الرقمي أولاً');
            if (!formData.title) return showToast.error('يرجى كتابة اسم المنتج');
            if (!formData.category) return showToast.error('يرجى اختيار تصنيف للمنتج');
        }
        if (currentStep === 2) {
            if (!formData.image) return showToast.error('يرجى رفع صورة غلاف جذابة');
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
            if (!formData.price) return showToast.error('يرجى تحديد السعر');
            setShowConfirmModal(true);
        }
    };

    const handleSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);
        const toastId = showToast.loading('جاري تجهيز منتجك للنشر...');
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price || '0'),
                    isFree: parseFloat(formData.price || '0') === 0,
                    isActive: true, // Always active on initial create
                    tags: [], // Edit later
                }),
            });
            if (res.ok) {
                showToast.dismiss(toastId);
                showToast.success('رائع! تم نشر المنتج الأولي. يمكنك الآن إضافة التفاصيل المتقدمة من صفحة التعديل.');
                router.push('/dashboard/products');
            } else {
                throw new Error('فشل الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء حفظ المنتج. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 px-4 overflow-hidden">
            
            {/* Minimal Header */}
            <div className="mb-10 text-center">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">إضافة منتج جديد سريعة</h1>
                <p className="text-slate-500 font-medium mt-1">أدخل المعلومات الأساسية فقط، والتفاصيل المتقدمة ستجدها في التعديل</p>
            </div>

            <div className="mb-10">
                <StepProgress steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handlePreSubmit} autoComplete="off" className="relative space-y-8">
                <AnimatePresence mode="wait">
                    
                    {/* Step 1: The Product File */}
                    {currentStep === 1 && (
                        <motion.div key="st1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="ملف المنتج والبيانات الأساسية" icon={<FiPackage />}>
                                <div className="space-y-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center mb-6">
                                    {formData.fileUrl ? (
                                        <div className="flex items-center justify-between bg-primary-indigo-600 text-white p-6 rounded-3xl shadow-lg animate-fade-in">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <FiCheck />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold truncate max-w-[150px]">تم رفع الملف</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => update('fileUrl', '')} className="text-white/60 hover:text-white transition-colors">
                                                <FiX size={20} />
                                            </button>
                                        </div>
                                    ) : showFileUploader ? (
                                        <FileUploader
                                            isPrivate={true}
                                            onUploadSuccess={(urls, names) => {
                                                update('fileUrl', urls[0]);
                                                if (names?.[0]) {
                                                    update('fileType', getFileType(names[0]));
                                                    if (!formData.title) update('title', names[0].split('.').slice(0, -1).join('.'));
                                                }
                                                setShowFileUploader(false);
                                            }}
                                        />
                                    ) : (
                                        <div className="py-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-indigo-600 mx-auto mb-3">
                                                <FiUpload size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 mb-1">ارفع الملف أولاً</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowFileUploader(true)}
                                                className="px-8 py-3 bg-white text-primary-indigo-600 border border-primary-indigo-100 rounded-xl font-bold text-sm hover:bg-primary-indigo-50 transition-all shadow-sm"
                                            >
                                                اختر الملف (PDF, ZIP, الخ)
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label-modern">اسم المنتج</label>
                                        <input
                                            type="text" required className="input-modern"
                                            placeholder="ماذا تبيع اليوم؟"
                                            value={formData.title}
                                            onChange={e => update('title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-modern">التصنيف</label>
                                        <select className="input-modern bg-white" value={formData.category} onChange={e => update('category', e.target.value)}>
                                            <option value="">اختر التصنيف</option>
                                            <option value="courses">دورات</option>
                                            <option value="ebooks">كتب</option>
                                            <option value="templates">قوالب</option>
                                            <option value="software">برمجيات</option>
                                        </select>
                                    </div>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 2: Visuals */}
                    {currentStep === 2 && (
                        <motion.div key="st2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="الصورة التعريقية" icon={<FiImage />} description="هذه هي الصورة التي ستظهر للمشترين في المتجر">
                                <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    {formData.image ? (
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-white">
                                            <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => update('image', '')} className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform">&times;</button>
                                        </div>
                                    ) : showCoverUploader ? (
                                        <div className="bg-white p-4 rounded-3xl">
                                            <FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} />
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-bold flex flex-col items-center justify-center gap-3 hover:border-primary-indigo-300 hover:bg-primary-indigo-50/20 transition-all bg-white">
                                            <FiImage size={28} />
                                            <span className="text-sm">ارفع صورة الغلاف (16:9)</span>
                                        </button>
                                    )}
                                </div>
                                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-600 shrink-0">!</div>
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">تذكير: بعد النشر، يمكنك إضافة شرح مفصل لمنتجك، فيديو تعريفي، وصور إضافية من خلال زر التعديل.</p>
                                </div>
                            </Section>
                        </motion.div>
                    )}

                    {/* Step 3: Pricing */}
                    {currentStep === 3 && (
                        <motion.div key="st3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <Section title="تحديد السعر" icon={<FiDollarSign />} description="ادخل السعر الذي تريده لبيع هذا المنتج">
                                <div className="relative">
                                    <label className="label-modern opacity-60">السعر (بـ ج.م)</label>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01" className="input-modern pl-16 text-2xl font-black text-primary-indigo-600 text-center"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={e => update('price', e.target.value)}
                                        />
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">L.E</div>
                                    </div>
                                    {parseFloat(formData.price || '0') === 0 && (
                                        <p className="text-center text-emerald-500 font-bold text-xs mt-3 bg-emerald-50 py-2 rounded-xl border border-emerald-100">سيتم عرض المنتج كـ "مجاني"</p>
                                    )}
                                </div>
                            </Section>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Simplified Task-Focused Navigation */}
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
                            <Link href="/dashboard/products" className="text-slate-400 hover:text-red-500 font-bold text-sm px-4">إلغاء</Link>
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
                                {loading ? 'جاري التحضير...' : 'نشر المنتج'}
                                {!loading && <FiCheck />}
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Simple Confirm Modal */}
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
                                <h3 className="text-xl font-black text-slate-900 leading-tight">جاهز للبدء بجني الأرباح؟</h3>
                                <p className="text-sm text-slate-500 mt-2">سيتم نشر المنتج فوراً. تذكر أنك تستطيع إضافة تفاصيل أكثر لاحقاً.</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleSubmit} className="w-full py-4 bg-primary-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-primary-indigo-700 transition-all">نعم، أنشر الآن</button>
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
