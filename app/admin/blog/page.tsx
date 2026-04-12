"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiMoreVertical } from "react-icons/fi";
import toast from "react-hot-toast";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    createdAt: string;
    publishedAt?: string;
    category?: string;
    coverImage?: string;
    viewsCount: number;
    user: { name: string };
}

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/blog");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء جلب المقالات");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const deletePost = async (slug: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه المقالة؟")) return;

        try {
            const res = await fetch(`/api/blog/${slug}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("تم حذف المقالة بنجاح");
                setPosts(posts.filter((p) => p.slug !== slug));
            } else {
                toast.error("فشل الحذف");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const filteredPosts = posts.filter(p => p.title.includes(search));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <span className="px-3 py-1 text-xs rounded-xl font-bold bg-green-500/20 text-emerald-500 border border-emerald-500/20">منشور</span>;
            case "SCHEDULED":
                return <span className="px-3 py-1 text-xs rounded-xl font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">مجدول</span>;
            default:
                return <span className="px-3 py-1 text-xs rounded-xl font-bold bg-yellow-500/20 text-amber-500 border border-amber-500/20">مسودة</span>;
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-500 dark:text-white mb-2">إدارة المدونة</h1>
                    <p className="text-gray-500 text-sm">قم بإدارة منشورات مدونتك وتتبع مشاهاداتها.</p>
                </div>
                <Link
                    href="/dashboard/admin/blog/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition"
                >
                    <FiPlus />
                    <span className="font-bold text-sm">مقال جديد</span>
                </Link>
            </div>

            <div className="bg-[#0A0A0A] dark:bg-card-white rounded-2xl p-4 sm:p-6 shadow-xl border border-white/5 dark:border-gray-800">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="ابحث عن مقال..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 border border-white/10 dark:border-gray-700 bg-[#111111] dark:bg-bg-light rounded-xl focus:outline-none focus:border-emerald-600 transition"
                    />
                    <FiSearch className="absolute right-4 top-3.5 text-gray-500" size={18} />
                </div>

                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">لا توجد مقالات لعرضها.</div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-right text-sm">
                            <thead className="text-gray-500 text-xs uppercase bg-[#111111] dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-4 rounded-r-xl font-bold">المقال</th>
                                    <th className="px-4 py-4 font-bold">التصنيف</th>
                                    <th className="px-4 py-4 font-bold text-center">المشاهدات</th>
                                    <th className="px-4 py-4 font-bold text-center">الحالة</th>
                                    <th className="px-4 py-4 font-bold">تاريخ النشر</th>
                                    <th className="px-4 py-4 rounded-l-xl font-bold text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 dark:divide-gray-800">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-[#111111] dark:hover:bg-gray-800/20 transition group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-lg bg-emerald-900/20 flex-shrink-0 border border-white/5 overflow-hidden flex items-center justify-center">
                                                    {post.coverImage ? (
                                                        <img src={post.coverImage} className="w-full h-full object-cover" alt="cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-600 font-bold">بدون صورة</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-200 dark:text-gray-100 max-w-[200px] truncate">{post.title}</span>
                                                    <span className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate" dir="ltr">{post.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-400 font-medium">{post.category || "---"}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111111] dark:bg-gray-800 rounded-lg text-gray-300 font-mono text-xs">
                                                <FiEye size={12} className="text-emerald-500" />
                                                {post.viewsCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {getStatusBadge(post.status)}
                                        </td>
                                        <td className="px-4 py-4 text-gray-400 text-xs font-medium">
                                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-4 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition" title="معاينة بالموقع">
                                                    <FiEye size={16} />
                                                </Link>
                                                <Link href={`/dashboard/admin/blog/${post.slug}`} className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition" title="تحرير المقال">
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button onClick={() => deletePost(post.slug)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="حذف نهائي">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
