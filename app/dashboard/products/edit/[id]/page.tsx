'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiSave, FiX, FiFilm, FiEye, FiImage, FiCheck, FiLayers, FiCheckSquare, FiPlus, FiStar
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';

type PricingType = 'fixed' | 'free' | 'pwyw';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Upload states
    const [showCoverUploader, setShowCoverUploader] = useState(false);
    const [showGalleryUploader, setShowGalleryUploader] = useState(false);
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [showTrailerUploader, setShowTrailerUploader] = useState(false);
    const [showPreviewUploader, setShowPreviewUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        tags: '',
        prerequisites: '',
        image: '',
        images: [] as string[],
        fileUrl: '',
        fileType: 'pdf',
        trailerUrl: '',
        previewFileUrl: '',
        pricingType: 'fixed' as PricingType,
        minPrice: '',
        suggestedPrice: '',
        originalPrice: '',
        enablePPP: false,
        features: [] as string[],
        offerExpiresAt: '',
        stockLimit: '',
        seoTitle: '',
        seoDesc: '',
        isActive: true,
        displayOrder: 0,
        faqs: [] as { question: string; answer: string }[],
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const data = await apiGet(`/api/products/${params.id}`);

            let pType: PricingType = 'fixed';
            if (data.isFree || data.price === 0) pType = 'free';
            else if (data.minPrice !== null && data.minPrice !== undefined) pType = 'pwyw';

            setFormData({
                title: data.title || '',
                description: data.description || '',
                price: data.price ? data.price.toString() : '',
                category: data.category || '',
                tags: data.tags ? data.tags.join(', ') : '',
                prerequisites: data.prerequisites ? data.prerequisites.join(', ') : '',
                image: data.image || '',
                images: data.images || [],
                fileUrl: data.fileUrl || '',
                fileType: data.fileType || 'pdf',
                trailerUrl: data.trailerUrl || '',
                previewFileUrl: data.previewFileUrl || '',
                pricingType: pType,
                minPrice: data.minPrice ? data.minPrice.toString() : '',
                suggestedPrice: data.suggestedPrice ? data.suggestedPrice.toString() : '',
                originalPrice: data.originalPrice ? data.originalPrice.toString() : '',
                enablePPP: data.enablePPP || false,
                features: data.features || [],
                offerExpiresAt: data.offerExpiresAt ? new Date(data.offerExpiresAt).toISOString().slice(0, 16) : '',
                stockLimit: data.stockLimit ? data.stockLimit.toString() : '',
                seoTitle: data.seoTitle || '',
                seoDesc: data.seoDesc || '',
                isActive: data.isActive ?? true,
                displayOrder: data.displayOrder || 0,
                faqs: Array.isArray(data.faqs) ? data.faqs : [],
            });
        } catch (error) {
            console.error('Error fetching product:', handleApiError(error));
            showToast.error('حدث خطأ أثناء جلب البيانات');
            router.push('/dashboard/products');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, value: any) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = showToast.loading('جاري حفظ التعديلات...');
        try {
            const { pricingType, ...rest } = formData;
            await apiPut(`/api/products/${params.id}`, {
                ...rest,
                price: pricingType === 'free' ? 0 : parseFloat(formData.price || '0'),
                isFree: pricingType === 'free',
                minPrice: pricingType === 'pwyw' ? parseFloat(formData.minPrice || '0') : null,
                suggestedPrice: pricingType === 'pwyw' && formData.suggestedPrice ? parseFloat(formData.suggestedPrice) : null,
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stockLimit: formData.stockLimit ? parseInt(formData.stockLimit) : null,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                prerequisites: formData.prerequisites.split(',').map(t => t.trim()).filter(Boolean),
                features: formData.features.filter(f => f.trim() !== ''),
                faqs: formData.faqs.filter(f => f.question.trim() !== '' && f.answer.trim() !== ''),
            });
            showToast.dismiss(toastId);
            showToast.success('تم التحديث بنجاح! 🎉');
            router.push('/dashboard/products');
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error(handleApiError(error) || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 overflow-hidden">
            
            {/* Elegant Header */}
            <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#0A0A0A] p-6 md:p-10 rounded-xl border border-white/10 shadow-lg shadow-[#10B981]/20">
                <div className="space-y-2 max-w-xl">
                    <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs mb-2 transition-colors">
                        <FiArrowRight /> العودة للمنتجات
                    </Link>
                    <h1 className="text-3xl font-bold text-white break-words leading-tight">{formData.title}</h1>
                    <p className="text-slate-400 font-medium">تعديل التفاصيل المتقدمة وخيارات العرض</p>
                </div>
                <div className="flex gap-4">
                     <div className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${formData.isActive ? 'bg-emerald-700 text-white-50 text-[#10B981]-600' : 'bg-emerald-800 text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-xl ${formData.isActive ? 'bg-emerald-700 text-white-500 ' : 'bg-slate-300'}`} />
                        {formData.isActive ? 'معروض للبيع' : 'مخفي من المتجر'}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                
                <div className="grid lg:grid-cols-5 gap-10">
                    
                    {/* Main Settings Column */}
                    <div className="lg:col-span-3 space-y-10">
                        <Section title="بيانات المنتج الرئيسية" icon={<FiPackage />}>
                            <div className="space-y-6">
                                <div>
                                    <label className="label-modern">اسم المنتج <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" required className="input-modern"
                                        value={formData.title}
                                        onChange={e => update('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label-modern">التصنيف الرئيسي <span className="text-red-500">*</span></label>
                                    <select className="input-modern bg-[#0A0A0A] font-bold" value={formData.category} onChange={e => update('category', e.target.value)}>
                                        <option value="">اختر التصنيف العام لمنتجك</option>
                                        <option value="ebooks">📚 كتب وملخصات إلكترونية</option>
                                        <option value="courses">🎓 دورات ومحاضرات مغلقة</option>
                                        <option value="templates">🎨 قوالب، تصاميم وحقائب</option>
                                        <option value="software">💻 برمجيات، سكريبتات وأدوات</option>
                                        <option value="services">🛠️ خدمات استشارية / جلسات</option>
                                        <option value="audio">🎙️ بودكاست وملفات صوتية</option>
                                        <option value="spreadsheets">📊 جداول بيانات وتقارير</option>
                                        <option value="code">👨‍💻 ملفات برمجية وسكريبتات</option>
                                        <option value="compressed">📦 ملفات مضغوطة وحزم</option>
                                        <option value="data">🗄️ قواعد بيانات وبيانات JSON</option>
                                        <option value="other">🔗 منتج رقمي متنوع آخر</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-modern">وصف المنتج الكامل <span className="text-red-500">*</span></label>
                                    <div className="mt-2 min-h-[300px]">
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={val => update('description', val)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 grid md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="label-modern mb-2 block">الوسوم التسويقية (SEO Tags)</label>
                                        <input type="text" className="input-modern" placeholder="مثال: تصميم, تكنولوجيا, ملفات_جاهزة" value={formData.tags} onChange={e => update('tags', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label-modern mb-2 block">متطلبات المشتري المسبقة (Prerequisites)</label>
                                        <input type="text" className="input-modern" placeholder="مثال: لاب توب, اشتراك فوتوشوب" value={formData.prerequisites} onChange={e => update('prerequisites', e.target.value)} />
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold">افصل بفاصلة لعرضها كنقاط منظمة</p>
                                    </div>
                                </div>

                                {/* Product Features Section */}
                                <div className="mt-8 p-6 bg-[#111111] border border-slate-200 rounded-xl">
                                    <label className="label-modern mb-4 flex items-center gap-2">
                                        المميزات الرئيسية
                                    </label>
                                    <div className="space-y-3">
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                                <input
                                                    type="text"
                                                    className="flex-1 input-modern py-2"
                                                    placeholder={`الميزة ${index + 1}`}
                                                    value={feature}
                                                    onChange={e => {
                                                        const newFeatures = [...formData.features];
                                                        newFeatures[index] = e.target.value;
                                                        update('features', newFeatures);
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newFeatures = formData.features.filter((_, i) => i !== index);
                                                        update('features', newFeatures);
                                                    }}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.features.length < 8 && (
                                            <button
                                                type="button"
                                                onClick={() => update('features', [...formData.features, ''])}
                                                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FiPlus size={16} />
                                                إضافة ميزة جديدة ({formData.features.length}/8)
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-8 p-6 bg-[#111111] border border-slate-200 rounded-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <FiStar className="text-9xl text-emerald-500" />
                                     </div>
                                     <label className="label-modern mb-2 flex items-center gap-2">
                                         <FiCheckSquare className="text-emerald-500" />
                                         الأسئلة الشائعة (SEO Boost) 🚀
                                     </label>
                                     <p className="text-xs text-slate-400 mb-6 font-bold">تسهل الأسئلة المكتوبة بطريقة (كيف، متى، هل) من ظهور منتجك في محركات بحث الذكاء الاصطناعي مثل ChatGPT بشكل مضاعف!</p>
                                     <div className="space-y-4">
                                         {formData.faqs.map((faq, index) => (
                                             <div key={index} className="flex flex-col gap-2 p-4 bg-[#0A0A0A] rounded-xl border border-white/5 relative group">
                                                 <button
                                                     type="button"
                                                     onClick={() => {
                                                         const newFaqs = formData.faqs.filter((_, i) => i !== index);
                                                         update('faqs', newFaqs);
                                                     }}
                                                     className="absolute top-2 left-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                     title="حذف السؤال"
                                                 >
                                                     <FiX size={16} />
                                                 </button>
                                                 <input
                                                     type="text"
                                                     className="input-modern py-2 text-emerald-100 placeholder:text-slate-600 font-bold"
                                                     placeholder={`مثال للأسئلة المكررة: هل الدورة مناسبة للمبتدئين تماماً؟`}
                                                     value={faq.question}
                                                     onChange={e => {
                                                         const newFaqs = [...formData.faqs];
                                                         newFaqs[index].question = e.target.value;
                                                         update('faqs', newFaqs);
                                                     }}
                                                 />
                                                 <textarea
                                                     className="input-modern py-2 h-20 resize-none text-sm placeholder:text-slate-600 text-slate-300"
                                                     placeholder={`مثال للجواب المُقنع للاقتباس: نعم، الدورة تبدأ من الصفر ولا تتطلب أي خبرة برمجية سابقة وتوفر دعماً فنياً كاملاً.`}
                                                     value={faq.answer}
                                                     onChange={e => {
                                                         const newFaqs = [...formData.faqs];
                                                         newFaqs[index].answer = e.target.value;
                                                         update('faqs', newFaqs);
                                                     }}
                                                 />
                                             </div>
                                         ))}
                                         {formData.faqs.length < 5 && (
                                             <button
                                                 type="button"
                                                 onClick={() => update('faqs', [...formData.faqs, { question: '', answer: '' }])}
                                                 className="w-full py-4 bg-emerald-900/20 text-emerald-500 rounded-xl font-bold hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
                                             >
                                                 <FiPlus size={16} />
                                                 إضافة سؤال جديد ({formData.faqs.length}/5)
                                             </button>
                                         )}
                                     </div>
                                 </div>

                                 {/* SEO Optimization Section */}
                                 <div className="mt-12 pt-10 border-t border-emerald-500/20">
                                     <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                         <FiEye className="text-[#10B981]-500" /> تحسين محركات البحث والظهور (SEO) 🔍
                                     </h4>
                                     <div className="grid grid-cols-1 gap-8">
                                         <div className="group">
                                             <label className="text-sm font-bold text-gray-300 mb-3 block">عنوان البحث المخصص (SEO Title)</label>
                                             <input 
                                                 type="text" 
                                                 className="input-modern h-14 hover:border-blue-400 focus:border-emerald-600-500 transition-colors" 
                                                 placeholder="اتركه فارغاً ليقوم النظام بإنشائه تلقائياً" 
                                                 value={formData.seoTitle} 
                                                 onChange={e => update('seoTitle', e.target.value)} 
                                             />
                                         </div>
                                         <div className="group">
                                             <label className="text-sm font-bold text-gray-300 mb-3 block">وصف البحث المخصص (SEO Description)</label>
                                             <textarea 
                                                 className="input-modern h-32 resize-none py-5 hover:border-indigo-400 focus:border-ink transition-colors" 
                                                 placeholder="اكتب وصفاً مختصراً يظهر تحت اسم منتجك في نتائج البحث." 
                                                 value={formData.seoDesc} 
                                                 onChange={e => update('seoDesc', e.target.value)} 
                                             />
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        </Section>

                        <Section title="الأصول والملفات" icon={<FiLayers />}>
                            <div className="space-y-8">
                                {/* Digital File */}
                                <div className="p-6 bg-[#0A0A0A]/30 rounded-xl border-2 border-dashed border-primary-indigo-100">
                                    <label className="label-modern mb-3 block">ملف التسليم (الذي سيحمله المشتري) <span className="text-red-500">*</span></label>
                                    {formData.fileUrl ? (
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl shadow-lg shadow-[#10B981]/20 border border-primary-indigo-100 ">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                                                    <FiCheck />
                                                </div>
                                                <div className="text-right overflow-hidden">
                                                    <p className="text-xs font-bold text-gray-400 truncate max-w-[150px]" dir="ltr">{formData.fileUrl.split('/').pop()}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => update('fileUrl', '')} className="text-red-400 hover:text-red-600 p-2"><FiX /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowFileUploader(true)} className="w-full py-8 text-primary-ink font-bold hover:bg-[#0A0A0A]/50 transition-all rounded-xl flex flex-col items-center gap-2">
                                            <FiUpload /> رفع نسخة جديدة
                                        </button>
                                    )}
                                    {showFileUploader && (
                                        <div className="mt-4 bg-[#0A0A0A] p-4 rounded-xl"><FileUploader isPrivate={true} onUploadSuccess={urls => { update('fileUrl', urls[0]); setShowFileUploader(false); }} /></div>
                                    )}
                                </div>

                                {/* Trailer */}
                                <div className="p-6 bg-[#111111] rounded-xl border border-emerald-500/20">
                                    <label className="label-modern mb-3 block">فيديو تعريفي (Trailer)</label>
                                    {formData.trailerUrl ? (
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-3 text-gray-400 font-bold text-xs"><FiFilm className="text-primary-ink" /> فيديو مسجل</div>
                                            <button type="button" onClick={() => update('trailerUrl', '')} className="text-red-400"><FiX /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowTrailerUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-white hover:bg-[#0A0A0A] transition-all rounded-xl flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                                            <FiUpload /> ربط فيديو تعريفي
                                        </button>
                                    )}
                                    {showTrailerUploader && (
                                         <div className="mt-4 bg-[#0A0A0A] p-4 rounded-xl"><FileUploader onUploadSuccess={urls => { update('trailerUrl', urls[0]); setShowTrailerUploader(false); }} /></div>
                                    )}
                                </div>

                                {/* Free Preview */}
                                <div className="p-6 bg-[#111111] rounded-xl border border-emerald-500/20">
                                    <label className="label-modern mb-3 block">عينة أو معاينة مجانية (Freebie)</label>
                                    {formData.previewFileUrl ? (
                                        <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-3 text-gray-400 font-bold text-xs"><FiCheck className="text-emerald-500" /> تم إرفاق العينة</div>
                                            <button type="button" onClick={() => update('previewFileUrl', '')} className="text-red-400"><FiX /></button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setShowPreviewUploader(true)} className="w-full py-6 text-slate-400 font-bold hover:text-white hover:bg-[#0A0A0A] transition-all rounded-xl flex items-center justify-center gap-2 border border-slate-200 border-dashed">
                                            <FiUpload /> إضافة عينة مجانية
                                        </button>
                                    )}
                                    {showPreviewUploader && (
                                         <div className="mt-4 bg-[#0A0A0A] p-4 rounded-xl"><FileUploader onUploadSuccess={urls => { update('previewFileUrl', urls[0]); setShowPreviewUploader(false); }} /></div>
                                    )}
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Visuals & Pricing Sidebar */}
                    <div className="lg:col-span-2 space-y-10">
                        <Section title="الواجهة البصرية" icon={<FiImage />}>
                             <div className="space-y-6">
                                <div>
                                    <label className="label-modern">صورة الغلاف الرسمية</label>
                                    <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border-4 border-white shadow-lg shadow-[#10B981]/20 bg-[#111111]">
                                        {formData.image ? (
                                            <>
                                                <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => update('image', '')} className="absolute top-3 left-3 bg-red-500/100/100 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20"><FiX /></button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => setShowCoverUploader(true)} className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold gap-2">
                                                <FiUpload size={30} /> رفع غلاف
                                            </button>
                                        )}
                                        {showCoverUploader && (
                                            <div className="absolute inset-0 bg-[#0A0A0A] p-4 z-10 overflow-auto"><FileUploader onUploadSuccess={urls => { update('image', urls[0]); setShowCoverUploader(false); }} /></div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-modern">معرض الصور الإضافي</label>
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {formData.images.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-lg shadow-[#10B981]/20">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => update('images', formData.images.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 bg-red-500/100/100 text-white w-5 h-5 rounded-xl flex items-center justify-center text-[8px]"><FiX /></button>
                                            </div>
                                        ))}
                                        {formData.images.length < 5 && (
                                            <button type="button" onClick={() => setShowGalleryUploader(true)} className="aspect-square bg-[#111111] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-primary-indigo-300 hover:text-primary-indigo-400 transition-all">
                                                <FiUpload />
                                            </button>
                                        )}
                                    </div>
                                    {showGalleryUploader && (
                                        <div className="mt-2 p-4 bg-[#0A0A0A] rounded-xl border border-emerald-500/20 shadow-lg shadow-[#10B981]/20 absolute z-20 max-w-[200px]"><FileUploader maxFiles={3} onUploadSuccess={urls => { update('images', [...formData.images, ...urls]); setShowGalleryUploader(false); }} /></div>
                                    )}
                                </div>
                             </div>
                        </Section>

                        <Section title="التسعير والعرض" icon={<FiDollarSign />}>
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-emerald-800 rounded-xl">
                                    {['fixed', 'pwyw', 'free'].map(type => (
                                        <button
                                            key={type} type="button"
                                            onClick={() => update('pricingType', type)}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${formData.pricingType === type ? 'bg-[#0A0A0A] text-primary-ink shadow-lg shadow-[#10B981]/20' : 'text-slate-400 hover:text-gray-400'}`}
                                        >
                                            {type === 'fixed' ? 'سعر محدد' : type === 'pwyw' ? 'دعم اختياري' : 'مجاني'}
                                        </button>
                                    ))}
                                </div>

                                {formData.pricingType !== 'free' && (
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label-modern">السعر النهائي ($) <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number" step="0.01" className="input-modern text-center font-bold"
                                                    value={formData.price}
                                                    onChange={e => update('price', e.target.value)}
                                                />
                                            </div>
                                            {formData.pricingType === 'pwyw' ? (
                                                <div>
                                                    <label className="label-modern">أقل مبلغ لقبوله ($)</label>
                                                    <input
                                                        type="number" step="0.01" className="input-modern text-center font-bold text-slate-400"
                                                        value={formData.minPrice}
                                                        onChange={e => update('minPrice', e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="label-modern text-red-500">السعر الأصلي للخصم الوهمي ($)</label>
                                                    <input
                                                        type="number" step="0.01" className="input-modern text-center font-bold text-slate-400 line-through"
                                                        value={formData.originalPrice}
                                                        onChange={e => update('originalPrice', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label-modern">تاريخ الانتهاء للعرض (اختياري)</label>
                                            <input type="datetime-local" className="input-modern text-center bg-[#111111] text-xs font-bold" value={formData.offerExpiresAt} onChange={e => update('offerExpiresAt', e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <div className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer border ${formData.enablePPP ? 'bg-blue-900/40 border-blue-500/30' : 'bg-[#111111] border-transparent hover:bg-emerald-800'}`} onClick={() => update('enablePPP', !formData.enablePPP)}>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${formData.enablePPP ? 'text-white' : 'text-gray-300'}`}>تفعيل التسعير العادل (PPP Pricing) 🌍</p>
                                            <p className="text-[10px] text-slate-400 font-medium">تخفيض السعر للدول النامية تلقائياً</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-xl transition-all flex items-center px-1 ${formData.enablePPP ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-[#0A0A0A] rounded-xl transition-all ${formData.enablePPP ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#111111] border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-300">الحد الأقصى للمبيعات</p>
                                            <p className="text-[10px] text-slate-400 font-medium">اتركه فارغاً للبيع اللامحدود</p>
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="∞" 
                                            className="input-modern text-center font-bold text-lg w-20 h-10" 
                                            value={formData.stockLimit} 
                                            onChange={e => update('stockLimit', e.target.value)} 
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[#111111] rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer border border-transparent" onClick={() => update('isActive', !formData.isActive)}>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-300">تفعيل المنتج</p>
                                            <p className="text-[10px] text-slate-400 font-medium">اجعله مرئياً في صفحة المتجر</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-xl transition-all flex items-center px-1 ${formData.isActive ? 'bg-emerald-700 text-white' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-[#0A0A0A] rounded-xl transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </Section>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 md:bottom-8 z-30 p-4 bg-emerald-700 text-white/90 md:rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg shadow-[#10B981]/20 border-t md:border border-white/10 -mx-4 md:mx-0">
                    <div className="flex-1 text-white pr-4 hidden sm:block mb-4 md:mb-0">
                        <p className="text-xs opacity-60 font-medium">تذكر مراجعة كافة التفاصيل قبل الحفظ</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-3 md:gap-4">
                        <Link href="/dashboard/products" className="flex-1 md:flex-none text-center px-4 md:px-8 py-3.5 text-white/50 hover:text-white font-bold transition-all bg-black/20 rounded-xl md:bg-transparent">إلغاء</Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] md:flex-none px-6 md:px-10 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-emerald-500 hover:scale-[1.02] transition-all disabled:opacity-50 text-sm md:text-base whitespace-nowrap"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Section({ title, icon, children }: any) {
    return (
        <div className="bg-[#0A0A0A] rounded-xl p-5 md:p-8 lg:p-10 shadow-lg shadow-[#10B981]/20 border border-white/10 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 -mx-2">
                <div className="w-12 h-12 bg-[#0A0A0A] text-primary-ink rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                    {icon}
                </div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
