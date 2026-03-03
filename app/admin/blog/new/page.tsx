"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FileUploader from "@/components/ui/FileUploader";
import "react-quill-new/dist/quill.snow.css";
import { FiSave, FiCheckCircle } from "react-icons/fi";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewBlogPost() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [coverImage, setCoverImage] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    const generateSlug = () => {
        if (!title) return;
        // Basic Arabic-friendly slug generation
        const generatedSlug = title.trim().replace(/\s+/g, '-').replace(/[#$@!%^&*()_+=\[\]{};':"\\|,.<>\/?~]+/g, '');
        setSlug(generatedSlug);
    };

    const handleSave = async () => {
        if (!title || !slug || !content) {
            toast.error("يرجى تعبئة العنوان، الرابط المخصص والمحتوى");
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
                    category,
                    status,
                    coverImage
                })
            });

            if (res.ok) {
                toast.success("تم الحفظ بنجاح!");
                router.push("/admin/blog");
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
        <div className="p-6 max-w-5xl mx-auto w-full" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إضافة مقال جديد</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-card-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                عنوان المقال <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-action-blue"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={generateSlug}
                                placeholder="اكتب هنا عنوان المقال المثير..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الرابط المخصص للمقال (Slug) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-action-blue text-left"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                dir="ltr"
                                placeholder="my-awesome-post-title"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                محتوى المقال <span className="text-red-500">*</span>
                            </label>
                            <div className="h-96 pb-12 mb-4 text-black dark:text-white">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    className="h-full mt-2 bg-white dark:bg-card-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Settings) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">تفضيلات النشر</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حالة المقال</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                            >
                                <option value="DRAFT">مسودة</option>
                                <option value="PUBLISHED">منشور للعامة</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التصنيف الرئيسي</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="مثال: تقنية"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مقتطف قصير (للسيو والتلخيص)</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg h-24 resize-none"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="اكتب وصف قصير عن المقال..."
                            ></textarea>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صورة الغلاف</label>
                            {coverImage ? (
                                <div className="relative">
                                    <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                                    <button
                                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-md text-white hover:bg-red-600"
                                        onClick={() => setCoverImage("")}
                                    >حذف</button>
                                </div>
                            ) : (
                                <FileUploader
                                    onUploadSuccess={(urls) => {
                                        if (urls && urls.length > 0) setCoverImage(urls[0]);
                                    }}
                                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                />
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-action-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 flex justify-center items-center gap-2 transition"
                        >
                            {isSaving ? (
                                <span>جاري الحفظ...</span>
                            ) : (
                                <>
                                    <FiCheckCircle size={18} />
                                    <span>{status === "PUBLISHED" ? "نشر المقال" : "حفظ كمسودة"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
