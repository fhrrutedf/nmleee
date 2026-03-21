'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiSave,
    FiArrowRight,
    FiSettings,
    FiBookOpen,
    FiCheckSquare,
    FiVideo,
    FiLink,
    FiImage,
    FiPackage,
    FiClock,
    FiX,
    FiUpload,
    FiPlus,
    FiCheck,
    FiLayers
} from 'react-icons/fi';
import showToast from '@/lib/toast';
import RichTextEditor from '@/components/ui/RichTextEditor';
import FileUploader from '@/components/ui/FileUploader';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Upload Toggles
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        duration: '',
        sessions: '',
        image: '',
        trailerUrl: '',
        tags: [] as string[],
        features: [] as string[],
        isActive: true,
        zoomLink: '',
        meetLink: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    category: data.category || '',
                    duration: data.duration || '',
                    sessions: data.sessions?.toString() || '',
                    image: data.image || '',
                    trailerUrl: data.trailerUrl || '',
                    tags: data.tags || [],
                    features: data.features || [],
                    isActive: data.isActive ?? true,
                    zoomLink: data.zoomLink || '',
                    meetLink: data.meetLink || '',
                });
            } else {
                showToast.error('فشل تحميل بيانات الدورة');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            showToast.error('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = showToast.loading('جاري حفظ التغييرات...');

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price || '0'),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null
                }),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم حفظ كافة التعديلات بنجاح! ✅');
            } else {
                const error = await response.json();
                showToast.dismiss(toastId);
                showToast.error(error.error || 'فشل الحفظ');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const addFeature = () => {
        if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto pb-32 px-4 overflow-hidden">
            
            {/* Premium Course Header */}
            <div className="mb-12 bg-white rounded-[3rem] p-10 shadow-premium border border-slate-50 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 max-w-2xl text-right">
                    <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-2 transition-colors">
                        <FiArrowRight /> العودة للدورات
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 break-words leading-tight">{formData.title}</h1>
                    <div className="flex flex-wrap gap-4">
                        <Link href={`/dashboard/courses/${courseId}/content`} className="flex items-center gap-2 text-xs font-black text-primary-indigo-600 bg-primary-indigo-50 px-4 py-2 rounded-xl hover:bg-primary-indigo-100 transition-all">
                            <FiBookOpen /> إدارة المنهاج
                        </Link>
                        <Link href={`/dashboard/courses/${courseId}/quizzes`} className="flex items-center gap-2 text-xs font-black text-slate-500 bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
                            <FiCheckSquare /> الاختبارات
                        </Link>
                    </div>
                </div>
                <div className="flex gap-4">
                     <div className={`px-5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 ${formData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {formData.isActive ? 'معروضة للطلاب' : 'مسودة مخفية'}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                
                <div className="grid lg:grid-cols-5 gap-10">
                    
                    {/* Left Column (Settings) */}
                    <div className="lg:col-span-3 space-y-10">
                        <Section title="إعدادات الدورة العامة" icon={<FiPackage />}>
                            <div className="space-y-6">
                                <div>
                                    <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-2">اسم الدورة</label>
                                    <input
                                        type="text" required className="input-modern"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-modern underline decoration-primary-indigo-100 underline-offset-4 mb-2">الوصف الشامل لطلابك</label>
                                    <div className="mt-2 min-h-[350px]">
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={(val) => setFormData({ ...formData, description: val })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="أدوات التعليم عن بعد" icon={<FiLink />}>
                            <p className="text-xs text-slate-400 font-medium -mt-2 mb-4">أضف روابط البث المباشر إن كانت دورتك تفاعلية</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiVideo className="text-blue-500" /> رابط Zoom</label>
                                    <input
                                        type="url" className="input-modern bg-slate-50/50"
                                        placeholder="https://zoom.us/j/..."
                                        value={formData.zoomLink}
                                        onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiVideo className="text-emerald-500" /> رابط Meet</label>
                                    <input
                                        type="url" className="input-modern bg-slate-50/50"
                                        placeholder="https://meet.google.com/..."
                                        value={formData.meetLink}
                                        onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                                    />
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Right Column (Visuals & Data) */}
                    <div className="lg:col-span-2 space-y-10">
                        <Section title="الهوية البصرية" icon={<FiImage />}>
                             <div className="space-y-6 text-right">
                                <div>
                                    <label className="label-modern italic">غلاف الدورة (16:9)</label>
                                    <div className="mt-3 relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50 group">
                                        {formData.image ? (
                                            <>
                                                <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><FiX /></button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold gap-2">
                                                <FiPlus size={30} /> رفع غلاف جديد
                                            </button>
                                        )}
                                        {showCoverUploader && (
                                            <div className="absolute inset-0 bg-white p-4 z-10 overflow-auto"><FileUploader onUploadSuccess={urls => { setFormData({ ...formData, image: urls[0] }); setShowCoverUploader(false); }} /></div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-modern italic">فيديو تعريفي (Trailer)</label>
                                    {formData.trailerUrl ? (
                                        <div className="mt-3 relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 group">
                                            <video src={formData.trailerUrl} className="w-full aspect-video bg-black" />
                                            <button type="button" onClick={() => setFormData({ ...formData, trailerUrl: '' })} className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:opacity-100 transition-opacity"><FiX /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full py-6 mt-3 text-slate-400 font-bold hover:text-primary-indigo-600 hover:bg-slate-50 transition-all rounded-3xl flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                                            <FiPlus /> إضافة فيديو تشويقي
                                        </button>
                                    )}
                                    {showTrailerUploader && (
                                         <div className="mt-4 bg-white p-4 rounded-3xl border shadow-xl"><FileUploader onUploadSuccess={urls => { setFormData({ ...formData, trailerUrl: urls[0] }); setShowTrailerUploader(false); }} /></div>
                                    )}
                                </div>
                             </div>
                        </Section>

                        <Section title="تخصيص الدعم والعرض" icon={<FiSettings />}>
                             <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">المدة الكلية</label>
                                        <div className="relative">
                                            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-indigo-300" />
                                            <input
                                                type="text" className="input-modern pr-10 text-xs"
                                                placeholder="مثال: 10 ساعات"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">عدد المحاضرات</label>
                                        <input
                                            type="number" className="input-modern text-xs"
                                            placeholder="12"
                                            value={formData.sessions}
                                            onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="label-modern italic">السعر الإجمالي ($)</label>
                                    <input
                                        type="number" className="input-modern text-center font-black text-xl text-primary-indigo-600 border-2 border-primary-indigo-50"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 space-y-3">
                                    <button
                                        type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`w-full py-4 rounded-[2rem] font-black text-xs flex items-center justify-center gap-3 transition-all ${formData.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                                    >
                                        <FiCheck className={formData.isActive ? 'opacity-100' : 'opacity-0'} />
                                        {formData.isActive ? 'الدورة منشورة حالياً' : 'مخفي (مسودة بالخلفية)'}
                                    </button>
                                </div>
                             </div>
                        </Section>

                        <Section title="الكلمات والمميزات" icon={<FiLayers />}>
                            <div className="space-y-6">
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-black text-slate-400">وسوم الدورة</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text" className="input-modern flex-1 text-xs" placeholder="أضف وسم..."
                                            value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        />
                                        <button type="button" onClick={addTag} className="w-10 h-10 bg-primary-indigo-600 text-white rounded-xl flex items-center justify-center"><FiPlus /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {formData.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-2">
                                                {tag}
                                                <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="text-slate-300 hover:text-red-500"><FiX /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>

                {/* Fixed Action Bar Course */}
                <div className="fixed bottom-8 z-[50] p-4 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-between shadow-2xl border border-white/10 animate-slide-up mx-4 left-0 right-0 max-w-4xl mx-auto">
                    <div className="flex-1 text-white pr-4 hidden sm:block">
                        <p className="text-xs opacity-60 font-medium">دورتك التدريبية في أيدٍ أمينة، اضغط حفظ للاستمرا</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard/courses" className="px-8 py-3.5 text-white/50 hover:text-white font-bold transition-all">إلغاء</Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Section({ title, icon, children, description }: any) {
    return (
        <div className="bg-white rounded-[3rem] p-8 lg:p-10 shadow-premium border border-slate-50 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6 -mx-2">
                <div className="w-12 h-12 bg-primary-indigo-50 text-primary-indigo-600 rounded-2xl flex items-center justify-center shadow-sm text-xl">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-black text-slate-900">{title}</h2>
                    {description && <p className="text-xs text-slate-400 font-medium mt-1">{description}</p>}
                </div>
            </div>
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
}
