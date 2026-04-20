"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import FileUploader from "@/components/ui/FileUploader";
import "react-quill-new/dist/quill.snow.css";
import { FiSave, FiCheckCircle, FiChevronRight, FiSettings, FiImage, FiCode } from "react-icons/fi";
import Link from "next/link";
import { updateArticle, autoSaveArticle } from "../../actions";
import { apiGet, handleApiError } from "@/lib/safe-fetch";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditArticle() {
    const router = useRouter();
    const params = useParams();
    const articleId = typeof params?.id === "string" ? params.id : "";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editorMode, setEditorMode] = useState<"VISUAL" | "HTML">("VISUAL");
    const [excerpt, setExcerpt] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">("DRAFT");
    const [publishedAt, setPublishedAt] = useState("");
    const [coverImage, setCoverImage] = useState<string>("");
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const contentRef = useRef(content);
    const initialContentLoaded = useRef(false);

    useEffect(() => {
        if (!articleId) return;
        const fetchArticle = async () => {
            try {
                const data = await apiGet(`/api/blog/${articleId}`);
                setTitle(data.title);
                setContent(data.content);
                contentRef.current = data.content; // Track base content
                setExcerpt(data.excerpt || "");
                setStatus(data.status);
                setCoverImage(data.coverImage || "");
                if (data.publishedAt) {
                    setPublishedAt(new Date(data.publishedAt).toISOString().slice(0, 16));
                }
                initialContentLoaded.current = true;
            } catch (error) {
                toast.error(handleApiError(error) || "لم يتم العثور على المقال أو خطأ في التحميل");
                if (!initialContentLoaded.current) {
                    router.push("/dashboard/admin/blog");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticle();
    }, [articleId, router]);

    // Auto-save logic
    useEffect(() => {
        if (!initialContentLoaded.current || !articleId) return;
        
        const saveTimeout = setTimeout(async () => {
            if (content !== contentRef.current) {
                try {
                    await autoSaveArticle(articleId, content);
                    contentRef.current = content; // Update baseline
                    toast.success("تم الحفظ التلقائي", { id: 'autosave', icon: '💾' });
                } catch(e) {
                    // Ignore errors silently for autosave
                }
            }
        }, 3000); // 3 seconds after stop typing

        return () => clearTimeout(saveTimeout);
    }, [content, articleId]);

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
        const res = await updateArticle(articleId, {
            title,
            content,
            excerpt,
            status,
            coverImage,
            publishedAt: status === "SCHEDULED" ? new Date(publishedAt) : null
        });

        if (res.success) {
            toast.success("تم تشييك وحفظ التعديلات!");
            contentRef.current = content;
            router.push("/dashboard/admin/blog");
        } else {
            toast.error(res.error || "فشل التحديث");
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="text-center text-gray-500 py-10">جاري التحميل...</div>;
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Link href="/dashboard/admin/blog" className="hover:text-emerald-500 transition">إدارة المقالات</Link>
                        <FiChevronRight size={12} />
                        <span className="text-emerald-500 font-bold">تعديل المقال</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">تعديل المقال</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition">
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {isSaving ? "جاري الحفظ..." : <><FiSave /> حفظ الكل</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
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
                                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">المحتوى <span className="text-gray-600 pr-2">({content !== contentRef.current ? "جاري الحفظ..." : "محفوظ"})</span></label>
                                 <div className="flex bg-[#111111] border border-white/10 rounded-lg p-1">
                                     <button
                                         onClick={() => setEditorMode("VISUAL")}
                                         className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${editorMode === "VISUAL" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}
                                     >
                                         محرر مرئي
                                     </button>
                                     <button
                                         onClick={() => setEditorMode("HTML")}
                                         className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-2 ${editorMode === "HTML" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}
                                     >
                                         <FiCode size={12} /> محرر HTML
                                     </button>
                                 </div>
                             </div>
                             <div className="min-h-[500px] border border-white/10 rounded-xl overflow-hidden bg-[#111111]">
                                {editorMode === "VISUAL" ? (
                                    <>
                                        <style>{`
                                            .ql-toolbar { background: #1a1a1a !important; border: none !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 12px !important; }
                                            .ql-container { border: none !important; font-size: 16px !important; color: #e5e7eb !important; font-family: inherit !important; }
                                            .ql-editor { min-height: 500px; padding: 24px !important; line-height: 1.8 !important; }
                                            .ql-editor h1, .ql-editor h2, .ql-editor h3 { font-weight: bold !important; color: #10B981 !important; margin-bottom: 0.5em !important; }
                                            .ql-editor p { margin-bottom: 1em !important; color: #d1d5db !important; }
                                            .ql-editor a { color: #10B981 !important; text-decoration: underline !important; }
                                            .ql-editor ul { padding-right: 1.5rem !important; margin-bottom: 1em !important; }
                                            .ql-editor ol { padding-right: 1.5rem !important; margin-bottom: 1em !important; }
                                            .ql-editor li { margin-bottom: 0.25em !important; color: #d1d5db !important; }
                                            .ql-editor li::before { content: none !important; }
                                            .ql-editor strong { color: #34D399 !important; font-weight: bold !important; }
                                            .ql-editor img { border-radius: 0.75rem !important; margin: 1rem 0 !important; max-width: 100% !important; height: auto !important; }
                                        `}</style>
                                        <ReactQuill theme="snow" value={content} onChange={setContent} placeholder="ابدأ بكتابة قصتك..." />
                                    </>
                                ) : (
                                    <textarea
                                        className="w-full min-h-[500px] bg-[#111111] text-[#e5e7eb] border-none p-6 font-mono text-left focus:outline-none resize-y"
                                        dir="ltr"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                )}
                             </div>
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
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0A0A0A] p-5 rounded-2xl shadow-xl border border-white/5 space-y-5">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm border-b border-white/5 pb-3">
                            <FiSettings /> إعدادات הנشر
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">حالة النشر</label>
                                <select
                                    className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                >
                                    <option value="DRAFT">مسودة</option>
                                    <option value="PUBLISHED">منشور فوري</option>
                                    <option value="SCHEDULED">جدولة النشر</option>
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
                                <img src={coverImage} alt="Cover" className="w-full rounded-xl" />
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
