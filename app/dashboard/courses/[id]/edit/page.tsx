'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiSave, FiArrowRight, FiSettings, FiBookOpen, FiCheckSquare, FiVideo,
    FiLink, FiImage, FiPackage, FiClock, FiX, FiPlus, FiCheck, FiLayers,
    FiUsers, FiBarChart2, FiEye, FiEdit2, FiTrash2, FiEyeOff, FiFileText
} from 'react-icons/fi';
import showToast from '@/lib/toast';
import RichTextEditor from '@/components/ui/RichTextEditor';
import FileUploader from '@/components/ui/FileUploader';
import BunnyUpload from '@/components/instructor/BunnyUpload';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [activeTab, setActiveTab] = useState<'basics' | 'curriculum' | 'students'>('basics');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modules, setModules] = useState<any[]>([]);

    // Upload Toggles
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        currency: 'USD',
        category: '',
        level: 'beginner',
        format: 'recorded',
        duration: '',
        sessions: '',
        image: '',
        trailerUrl: '',
        tags: [] as string[],
        features: [] as string[],
        isActive: true,
        zoomLink: '',
        meetLink: '',
        slug: '',
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        fetchCourse();
        fetchModules();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    ...data,
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    originalPrice: data.originalPrice?.toString() || '',
                    currency: data.currency || 'USD',
                    category: data.category || '',
                    level: data.level || 'beginner',
                    format: data.format || 'recorded',
                    duration: data.duration || '',
                    sessions: data.sessions?.toString() || '',
                    image: data.image || '',
                    trailerUrl: data.trailerUrl || '',
                    tags: data.tags || [],
                    features: data.features || [],
                    isActive: data.isActive ?? true,
                    zoomLink: data.zoomLink || '',
                    meetLink: data.meetLink || '',
                    slug: data.slug || '',
                });
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModules = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/modules`);
            if (response.ok) {
                const data = await response.json();
                setModules(data);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        const toastId = showToast.loading('جاري حفظ التغييرات...');

        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price || '0'),
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                    sessions: formData.sessions ? parseInt(formData.sessions) : null
                }),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم الحفظ بنجاح! ✅');
            } else {
                showToast.dismiss(toastId);
                showToast.error('فشل في الحفظ');
            }
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('خطأ في الاتصال');
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-indigo-600/20 border-t-primary-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-40 px-4 text-right" dir="rtl">
            
            {/* --- TOP HUB HEADER --- */}
            <div className="mb-8 bg-white rounded-xl p-8 shadow-lg border border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                    <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-indigo-600 font-bold text-xs mb-1 transition-colors">
                        <FiArrowRight /> العودة للدورات
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                            <img src={formData.image || '/placeholder-course.png'} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight line-clamp-1">{formData.title}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${formData.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {formData.isActive ? 'منشور للطلاب' : 'مسودة مخفية'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">• {modules.length} فصول</span>
                                <span className="text-[10px] text-slate-400 font-bold">• {formData.category}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.open(`/courses/${formData.slug || courseId}`, '_blank')}
                        className="flex-1 lg:flex-none px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all"
                    >
                        <FiEye /> معاينة الكورس
                    </button>
                    <button 
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex-1 lg:flex-none px-8 py-3.5 bg-primary-indigo-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary-indigo-100 hover:bg-primary-indigo-700 transition-all disabled:opacity-50"
                    >
                        <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>

            {/* --- HUB NAVIGATION TABS --- */}
            <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] mb-10 w-full lg:w-fit overflow-x-auto no-scrollbar">
                {[
                    { id: 'basics', label: 'البيانات الأساسية', icon: <FiSettings /> },
                    { id: 'curriculum', label: 'المنهاج والدروس', icon: <FiBookOpen /> },
                    { id: 'students', label: 'الطلاب والإحصائيات', icon: <FiUsers /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-primary-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'basics' && (
                        <div className="grid lg:grid-cols-5 gap-10">
                            {/* Left: Content */}
                            <div className="lg:col-span-3 space-y-10">
                                <HubSection title="بيانات الدورة والمعلومات" icon={<FiPackage />}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">عنوان الدورة</label>
                                            <input
                                                type="text" className="input-modern"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">وصف الدورة التدريبية</label>
                                            <div className="min-h-[400px]">
                                                <RichTextEditor
                                                    value={formData.description}
                                                    onChange={(val) => setFormData({ ...formData, description: val })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </HubSection>
                            </div>

                            {/* Right: Pricing & Visuals */}
                            <div className="lg:col-span-2 space-y-10">
                                <HubSection title="إعدادات السعر والعملة" icon={<FiBarChart2 />}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block text-center">العملة المختارة</label>
                                            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                                                <button 
                                                    type="button" onClick={() => setFormData({ ...formData, currency: 'USD' })}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.currency === 'USD' ? 'bg-primary-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                                                >
                                                    دولار (USD)
                                                </button>
                                                <button 
                                                    type="button" onClick={() => setFormData({ ...formData, currency: 'SYP' })}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.currency === 'SYP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                                                >
                                                    ليرة سورية (SYP)
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 mb-1 block">السعر النهائي</label>
                                                <input
                                                    type="number" className="input-modern text-center font-bold text-lg border-2 border-primary-indigo-50 text-primary-indigo-600"
                                                    value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 mb-1 block italic">السعر السابق</label>
                                                <input
                                                    type="number" className="input-modern text-center font-bold text-lg border-2 border-slate-50 text-slate-400 line-through"
                                                    value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </HubSection>

                                <HubSection title="صورة الغلاف" icon={<FiImage />}>
                                    <div className="space-y-6">
                                        <div className="aspect-video relative rounded-xl overflow-hidden border-4 border-white shadow-xl bg-slate-50 group">
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} className="w-full h-full object-cover" alt="" />
                                                    <button onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"><FiX /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold gap-2">
                                                    <FiPlus size={24} /> إضافة غلاف
                                                </button>
                                            )}
                                            {showCoverUploader && (
                                                <div className="absolute inset-0 bg-white p-4 z-10 overflow-auto"><FileUploader onUploadSuccess={urls => { setFormData({ ...formData, image: urls[0] }); setShowCoverUploader(false); }} /></div>
                                            )}
                                        </div>
                                    </div>
                                </HubSection>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-8">
                             <div className="flex justify-between items-center bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 pr-4 border-r-4 border-primary-indigo-600 leading-none">محتويات الدورة</h2>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2 pr-4">قم ببناء الفصول وإضافة الدروس والفيديوهات</p>
                                </div>
                                <button 
                                    onClick={() => router.push(`/dashboard/courses/${courseId}/content`)}
                                    className="px-6 py-3 bg-primary-indigo-50 text-primary-indigo-600 rounded-2xl font-bold text-xs hover:bg-primary-indigo-100 transition-all flex items-center gap-2 border border-primary-indigo-100 shadow-sm"
                                >
                                    <FiPlus /> إدارة الفصول والدروس
                                </button>
                             </div>

                             {modules.length === 0 ? (
                                 <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-6">
                                     <FiLayers size={48} className="mx-auto text-slate-100 mb-4" />
                                     <p className="text-slate-300 font-bold">المنهج فارغ حالياً</p>
                                     <button onClick={() => router.push(`/dashboard/courses/${courseId}/content`)} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold">ابدأ الآن</button>
                                 </div>
                             ) : (
                                 <div className="grid gap-6">
                                     {modules.map((m: any, idx: number) => (
                                         <div key={m.id} className="bg-white rounded-xl border border-slate-50 shadow-lg overflow-hidden group">
                                             <div className="p-6 bg-slate-50/30 border-b border-slate-50 flex items-center justify-between">
                                                 <div className="flex items-center gap-4">
                                                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm">{idx + 1}</div>
                                                     <div>
                                                         <h3 className="font-bold text-slate-800 text-sm">{m.title}</h3>
                                                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.lessons?.length || 0} درساً</span>
                                                     </div>
                                                 </div>
                                                 <button 
                                                    onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${m.id}/lessons/new`)}
                                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all"
                                                 >
                                                    <FiPlus size={14} />
                                                 </button>
                                             </div>
                                             <div className="divide-y divide-slate-50">
                                                 {(m.lessons || []).map((l: any, lIdx: number) => (
                                                     <div key={l.id} className="p-4 px-8 flex items-center justify-between hover:bg-slate-50/20 transition-colors">
                                                         <div className="flex items-center gap-4 min-w-0">
                                                             <span className="text-[10px] font-bold text-slate-300">{lIdx + 1}</span>
                                                             <div className="truncate">
                                                                 <h4 className="text-xs font-bold text-slate-700 truncate">{l.title}</h4>
                                                                 <div className="flex items-center gap-2 mt-1 opacity-60">
                                                                    {l.isFree && <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold italic">معاينة</span>}
                                                                    {l.bunnyVideoId ? <FiVideo size={10} className="text-primary-indigo-400" /> : <FiFileText size={10} />}
                                                                    {l.isPublished ? <FiEye className="text-blue-500" size={10} /> : <FiEyeOff size={10} />}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                         <button 
                                                            onClick={() => router.push(`/dashboard/lessons/${l.id}/edit`)}
                                                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-primary-indigo-600 hover:bg-primary-indigo-50 transition-all flex items-center justify-center"
                                                         >
                                                            <FiEdit2 size={12} />
                                                         </button>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-100 shadow-sm">
                             <div className="w-20 h-20 bg-primary-indigo-50 text-primary-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <FiUsers size={32} />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 mb-2">إدارة الطلاب والمشتركين</h3>
                             <p className="text-slate-400 font-bold max-w-sm mx-auto text-sm leading-relaxed">قريباً ستتمكن من رؤية قائمة بأسماء الطلاب الذين اشتروا هذا الكورس ومتابعة مستوى تقدمهم في كل فصل.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* --- FIXED HUB BOTTOM BAR --- */}
            <div className="fixed bottom-8 left-0 right-0 z-50 px-4">
                <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex items-center justify-between">
                    <div className="pr-6 hidden sm:block">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] leading-tight">اسم الكورس المختار</p>
                        <p className="text-xs text-white font-bold italic mt-1 truncate max-w-[200px]">{formData.title || 'بدون عنوان'}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard/courses" className="px-8 py-3.5 text-white/50 hover:text-white font-bold text-xs transition-all">إلغاء</Link>
                        <button 
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-12 py-3.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

function HubSection({ title, icon, children }: any) {
    return (
        <div className="bg-white rounded-xl p-8 lg:p-10 shadow-lg border border-slate-50 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6 -mx-2">
                <div className="w-12 h-12 bg-primary-indigo-50 text-primary-indigo-600 rounded-2xl flex items-center justify-center shadow-sm text-xl shrink-0">
                    {icon}
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-bold text-slate-900 leading-none">{title}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">إدارة المحتوى</p>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
