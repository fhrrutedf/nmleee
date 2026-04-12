"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FileUploader from "@/components/ui/FileUploader";
import "react-quill-new/dist/quill.snow.css";
import { FiSave, FiCheckCircle, FiChevronRight, FiGlobe, FiSettings, FiImage, FiClock } from "react-icons/fi";
import Link from "next/link";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewBlogPost() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [category, setCategory] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">("DRAFT");
    const [publishedAt, setPublishedAt] = useState("");
    const [coverImage, setCoverImage] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const generateSlug = () => {
        if (!title) return;
        // Arabic-friendly slug generation
        const generatedSlug = title
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\u0621-\u064A0-9a-z-]/g, '');
        setSlug(generatedSlug);
    };

    const handleSave = async () => {
        if (!title || !slug || !content) {
            toast.error("يرجى تعبئة العنوان، الرابط المخصص والمحتوى");
            return;
        }

        if (status === "SCHEDULED" && !publishedAt) {
            toast.error("يرجى اختيار تاريخ ووقت النشر للمقالات المجدولة");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug,
                    content,
                    excerpt,
                    metaDescription,
                    category,
                    categoryId,
                    status,
                    publishedAt: status === "SCHEDULED" ? publishedAt : null,
                    coverImage
                })
            });

            if (res.ok) {
                toast.success("تم الحفظ بنجاح!");
                router.push("/dashboard/admin/blog");
            } else {
                const data = await res.json();
                toast.error(data.error || "فشل الحفظ");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الاتصال بالخادم");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Link href="/dashboard/admin/blog" className="hover:text-emerald-500 transition">إدارة المدونة</Link>
                        <FiChevronRight size={12} />
                        <span className="text-emerald-500 font-bold">إضافة مقال جديد</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white dark:text-white">كتابة مقال جديد</h1>
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {isSaving ? "جاري الحفظ..." : <><FiSave /> حفظ المقال</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#0A0A0A] dark:bg-card-white p-6 rounded-2xl shadow-xl border border-white/5 dark:border-gray-800 space-y-6">
                        {/* Title Input */}
                        <div>
                            <input
                                type="text"
                                className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-gray-700 focus:ring-0 p-0"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={generateSlug}
                                placeholder="عنوان المقال هنا..."
                            />
                        </div>

                        {/* Rich Text Editor */}
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">المحتوى</label>
                             <div className="min-h-[500px] border border-white/10 rounded-xl overflow-hidden bg-[#111111]">
                                <style>{`
                                    .ql-toolbar { background: #1a1a1a !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 12px !important; }
                                    .ql-container { border: none !important; font-size: 16px !important; color: #e5e7eb !important; font-family: inherit !important; }
                                    .ql-editor { min-h-[500px] padding: 24px !important; line-height: 1.8 !important; }
                                    .ql-editor.ql-blank::before { color: #374151 !important; font-style: normal !important; }
                                    .ql-stroke { stroke: #9ca3af !important; }
                                    .ql-fill { fill: #9ca3af !important; }
                                    .ql-picker { color: #9ca3af !important; }
                                `}</style>
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    placeholder="ابدأ بكتابة قصتك..."
                                />
                             </div>
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">مقتطف القصة (Excerpt)</label>
                            <textarea
                                className="w-full px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-gray-300 focus:border-emerald-500/50 transition h-24 resize-none"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="اكتب ملخصاً جذاباً للمقال ليظهر في صفحات العرض..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar (Settings) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Publishing Settings */}
                    <div className="bg-[#0A0A0A] dark:bg-card-white p-5 rounded-2xl shadow-xl border border-white/5 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiSettings /> الإعدادات العامة
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">حالة النشر</label>
                                <select
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition cursor-pointer"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="DRAFT">مسودة</option>
                                    <option value="PUBLISHED">نشر فوري</option>
                                    <option value="SCHEDULED">جدولة النشر</option>
                                </select>
                            </div>

                            {status === "SCHEDULED" && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">تاريخ ووقت النشر</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                                            value={publishedAt}
                                            onChange={(e) => setPublishedAt(e.target.value)}
                                        />
                                        <FiClock className="absolute left-3 top-3 text-gray-500 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">التصنيف</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="مثال: تقنية، ريادة أعمال"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Sidebar */}
                    <div className="bg-[#0A0A0A] dark:bg-card-white p-5 rounded-2xl shadow-xl border border-white/5 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiGlobe /> تحسين محركات البحث (SEO)
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">الرابط المخصص (Slug)</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-400 focus:border-emerald-500 outline-none transition font-sans"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">وصف الميتا (Meta Description)</label>
                                <textarea
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:border-emerald-500 outline-none transition h-28 resize-none"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder="هذا الوصف يظهر في نتائج بحث جوجل..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-[#0A0A0A] dark:bg-card-white p-5 rounded-2xl shadow-xl border border-white/5 dark:border-gray-800 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiImage /> الصورة البارزة
                        </div>

                        <div className="group relative">
                            {coverImage ? (
                                <div className="space-y-3">
                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <button
                                        onClick={() => setCoverImage("")}
                                        className="w-full py-2 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-500 hover:text-white transition"
                                    >
                                        إزالة الصورة
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full scale-90">
                                    <FileUploader
                                        onUploadSuccess={(urls) => {
                                            if (urls && urls.length > 0) setCoverImage(urls[0]);
                                        }}
                                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button (Mobile Float) */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 transition disabled:opacity-50"
                >
                    {isSaving ? "جاري الحفظ..." : <><FiCheckCircle /> حفظ ونشر</>}
                </button>
            </div>
        </div>
    );
}
