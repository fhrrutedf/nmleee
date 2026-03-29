"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import FileUploader from "@/components/ui/FileUploader";
import "react-quill-new/dist/quill.snow.css";
import { FiSave, FiCheckCircle } from "react-icons/fi";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditBlogPost() {
    const router = useRouter();
    const params = useParams();
    const slugParams = typeof params?.slug === "string" ? params.slug : "";

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [coverImage, setCoverImage] = useState<string>("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!slugParams) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${slugParams}`);
                if (res.ok) {
                    const data = await res.json();
                    setTitle(data.title);
                    setSlug(data.slug);
                    setContent(data.content);
                    setExcerpt(data.excerpt || "");
                    setCategory(data.category || "");
                    setStatus(data.status);
                    setCoverImage(data.coverImage || "");
                } else {
                    toast.error("لم يتم العثور على المقال");
                    router.push("/dashboard/admin/blog");
                }
            } catch (error) {
                toast.error("حدث خطأ أثناء جلب تفاصيل المقال");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [slugParams, router]);

    const handleSave = async () => {
        if (!title || !slug || !content) {
            toast.error("يرجى تعبئة العنوان، الرابط المخصص والمحتوى");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/blog/${slugParams}`, {
                method: "PATCH",
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
                toast.success("تم تحديث المقال بنجاح!");
                router.push("/dashboard/admin/blog");
            } else {
                const data = await res.json();
                toast.error(data.error || "فشل التحديث");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الاتصال بالخادم");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center" dir="rtl">جاري التحميل...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto w-full" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">تعديل المقال</h1>

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
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-accent"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الرابط المخصص للمقال (Slug) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-accent text-left"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                dir="ltr"
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
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مقتطف قصير</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg h-24 resize-none"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
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
                            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-600 flex justify-center items-center gap-2 transition"
                        >
                            {isSaving ? (
                                <span>جاري الحفظ...</span>
                            ) : (
                                <>
                                    <FiSave size={18} />
                                    <span>حفظ التعديلات</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
