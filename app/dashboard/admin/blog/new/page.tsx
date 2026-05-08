"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FileUploader from "@/components/ui/FileUploader";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { FiSave, FiChevronRight, FiSettings, FiImage, FiActivity } from "react-icons/fi";
import Link from "next/link";
import { createArticle } from "../actions";

export default function NewArticle() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED">("DRAFT");
    const [publishedAt, setPublishedAt] = useState("");
    const [coverImage, setCoverImage] = useState<string>("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDesc, setSeoDesc] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

    React.useEffect(() => {
        const loadCats = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (e) {}
        };
        loadCats();
    }, []);

    const handleSave = async () => {
        if (!title || !content) {
            toast.error("يرجى تعبئة العنوان والمحتوى");
            return;
        }

        if (status === "SCHEDULED" && !publishedAt) {
            toast.error("يرجى اختيار تاريخ ووقت النشر");
            return;
        }

        setIsSaving(true);
        const res = await createArticle({
            title,
            slug,
            content,
            excerpt,
            status,
            coverImage,
            seoTitle,
            seoDesc,
            categoryId,
            publishedAt: status === "SCHEDULED" ? new Date(publishedAt) : null
        });

        if (res.success) {
            toast.success("تم حفظ المقالة بنجاح!");
            router.push(`/dashboard/admin/blog/${res.articleId}/edit`);
        } else {
            toast.error(res.error || "فشل الحفظ");
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Link href="/dashboard/admin/blog" className="hover:text-emerald-500 transition">إدارة المقالات</Link>
                        <FiChevronRight size={12} />
                        <span className="text-emerald-500 font-bold">إضافة مقال جديد</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">كتابة مقال جديد</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {isSaving ? "جاري الحفظ..." : <><FiSave /> حفظ المقال</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 gap-8 px-4">
                        <button 
                            className={`pb-4 font-bold transition-colors ${activeTab === 'content' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-300'}`}
                            onClick={() => setActiveTab('content')}
                        >
                            المحتوى الأساسي
                        </button>
                        <button 
                            className={`pb-4 font-bold transition-colors ${activeTab === 'seo' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-300'}`}
                            onClick={() => setActiveTab('seo')}
                        >
                            السيو (SEO)
                        </button>
                    </div>

                    {activeTab === 'content' && (
                        <div className="bg-[#0A0A0A] p-6 rounded-2xl shadow-xl border border-white/5 space-y-6">
                            <div>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-gray-700 focus:ring-0 p-0"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="عنوان المقال هنا..."
                                />
                            </div>

                            <div className="space-y-2">
                                 <div className="flex items-center justify-between mb-2">
                                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">المحتوى</label>
                                 </div>
                                 <TiptapEditor 
                                     value={content}
                                     onChange={setContent}
                                     placeholder="ابدأ بكتابة قصتك الرائعة هنا..."
                                 />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">مقتطف القصة (Excerpt)</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-gray-300 focus:border-emerald-500/50 transition h-24 resize-none outline-none"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="اكتب ملخصاً للمقال..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="bg-[#0A0A0A] p-6 rounded-2xl shadow-xl border border-white/5 space-y-6">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3 mb-4">
                                <FiActivity /> تحسين محركات البحث
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2 border-l-2 border-emerald-500">العنوان في محركات البحث (SEO Title)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                                    placeholder="إذا ترك فارغاً سيتم استخدام العنوان الأساسي"
                                    value={seoTitle}
                                    onChange={e => setSeoTitle(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-2">يفضل ألا يتجاوز 60 حرفاً.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2 border-l-2 border-emerald-500">الوصف (Meta Description)</label>
                                <textarea 
                                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none h-32 resize-none"
                                    placeholder="وصف المقالة لمحركات البحث..."
                                    value={seoDesc}
                                    onChange={e => setSeoDesc(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-2">يفضل ألا يتجاوز 160 حرفاً.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2 border-l-2 border-emerald-500">الرابط المخصص (Slug)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-white text-left focus:border-emerald-500 outline-none"
                                    placeholder="my-awesome-article"
                                    dir="ltr"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-2 text-right">سيتم توليده تلقائياً من العنوان إذا ترك فارغاً.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0A0A0A] p-5 rounded-2xl shadow-xl border border-white/5 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiSettings /> إعدادات النشر
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">التصنيف</label>
                                <select
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    <option value="">بدون تصنيف</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">حالة النشر</label>
                                <select
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="DRAFT">مسودة</option>
                                    <option value="PUBLISHED">نشر فوري</option>
                                    <option value="SCHEDULED">جدولة النشر</option>
                                    <option value="ARCHIVED">أرشيف</option>
                                </select>
                            </div>
                            {status === "SCHEDULED" && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">تاريخ ووقت النشر</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                                        value={publishedAt}
                                        onChange={(e) => setPublishedAt(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-5 rounded-2xl shadow-xl border border-white/5 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiImage /> الصورة البارزة
                        </div>
                        {coverImage ? (
                            <div className="space-y-3">
                                <img src={coverImage} alt="Cover" className="w-full h-40 object-cover rounded-xl" />
                                <button
                                    onClick={() => setCoverImage("")}
                                    className="w-full py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg"
                                >
                                    إزالة الصورة
                                </button>
                            </div>
                        ) : (
                            <FileUploader
                                onUploadSuccess={(urls) => { if (urls?.length) setCoverImage(urls[0]); }}
                                accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
