'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    FiArrowRight, FiUpload, FiDollarSign, FiPackage,
    FiSave, FiX, FiFilm, FiEye, FiImage, FiCheck, FiLayers
} from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
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
        image: '',
        images: [] as string[],
        fileUrl: '',
        fileType: 'pdf',
        trailerUrl: '',
        previewFileUrl: '',
        pricingType: 'fixed' as PricingType,
        minPrice: '',
        suggestedPrice: '',
        isActive: true,
        displayOrder: 0
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            if (response.ok) {
                const data = await response.json();

                let pType: PricingType = 'fixed';
                if (data.isFree || data.price === 0) pType = 'free';
                else if (data.minPrice !== null && data.minPrice !== undefined) pType = 'pwyw';

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price ? data.price.toString() : '',
                    category: data.category || '',
                    tags: data.tags ? data.tags.join(', ') : '',
                    image: data.image || '',
                    images: data.images || [],
                    fileUrl: data.fileUrl || '',
                    fileType: data.fileType || 'pdf',
                    trailerUrl: data.trailerUrl || '',
                    previewFileUrl: data.previewFileUrl || '',
                    pricingType: pType,
                    minPrice: data.minPrice ? data.minPrice.toString() : '',
                    suggestedPrice: data.suggestedPrice ? data.suggestedPrice.toString() : '',
                    isActive: data.isActive ?? true,
                    displayOrder: data.displayOrder || 0
                });
            } else {
                showToast.error('المنتج غير موجود');
                router.push('/dashboard/products');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast.error('حدث خطأ أثناء جلب البيانات');
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
            const res = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
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
                showToast.success('تم التحديث بنجاح! 🎉');
                router.push('/dashboard/products');
            } else {
                throw new Error('فشل الحفظ');
            }
        } catch {
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 overflow-hidden">
            
            {/* Elegant Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#0A0A0A] p-10 rounded-xl border border-slate-50 shadow-lg shadow-[#10B981]/20">
                <div className="space-y-2 max-w-xl">
                    <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs mb-2 transition-colors">
                        <FiArrowRight /> العودة للمنتجات
                    </Link>
                    <h1 className="text-3xl font-bold text-white break-words leading-tight">{formData.title}</h1>
                    <p className="text-slate-400 font-medium">تعديل التفاصيل المتقدمة وخيارات العرض</p>
                </div>
                <div className="flex gap-4">
                     <div className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${formData.isActive ? 'bg-emerald-700-50 text-[#10B981]-600' : 'bg-emerald-800 text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-xl ${formData.isActive ? 'bg-emerald-700-500 ' : 'bg-slate-300'}`} />
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
                                    <label className="label-modern">وصف المنتج الكامل <span className="text-red-500">*</span></label>
                                    <div className="mt-2 min-h-[300px]">
                                        <RichTextEditor
                                            value={formData.description}
                                            onChange={val => update('description', val)}
                                        />
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
                                                <button type="button" onClick={() => update('image', '')} className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20"><FiX /></button>
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
                                                <button type="button" onClick={() => update('images', formData.images.filter((_, idx) => idx !== i))} className="absolute top-1 left-1 bg-red-500 text-white w-5 h-5 rounded-xl flex items-center justify-center text-[8px]"><FiX /></button>
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
                                <div className="grid grid-cols-2 gap-2 p-1 bg-emerald-800 rounded-xl">
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
                                    <div>
                                        <label className="label-modern">السعر الأساسي ($)</label>
                                        <input
                                            type="number" step="0.01" className="input-modern text-center font-bold"
                                            value={formData.price}
                                            onChange={e => update('price', e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-[#111111] rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer" onClick={() => update('isActive', !formData.isActive)}>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-700">تفعيل المنتج</p>
                                            <p className="text-[10px] text-slate-400 font-medium">اجعله مرئياً في صفحة المتجر</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-xl transition-all flex items-center px-1 ${formData.isActive ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-[#0A0A0A] rounded-xl transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </Section>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-8 z-30 p-4 bg-emerald-700/90  rounded-xl flex items-center justify-between shadow-lg shadow-[#10B981]/20 border border-white/10  mx-4">
                    <div className="flex-1 text-white pr-4 hidden sm:block">
                        <p className="text-xs opacity-60 font-medium">تذكر مراجعة كافة التفاصيل قبل الحفظ</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard/products" className="px-8 py-3.5 text-white/50 hover:text-white font-bold transition-all">إلغاء</Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-3.5 bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-[#10B981]/20 shadow-ink/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Section({ title, icon, children }: any) {
    return (
        <div className="bg-[#0A0A0A] rounded-xl p-8 lg:p-10 shadow-lg shadow-[#10B981]/20 border border-slate-50 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6 -mx-2">
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
