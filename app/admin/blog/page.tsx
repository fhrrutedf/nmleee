"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    createdAt: string;
    category?: string;
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

    return (
        <div className="p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">إدارة المدونة</h1>
                    <p className="text-gray-500">قم بإدارة منشورات مدونتك وتتبع حالاتها.</p>
                </div>
                <Link
                    href="/dashboard/admin/blog/new"
                    className="flex items-center gap-2 px-4 py-2 bg-action-blue text-white rounded-lg hover:bg-blue-600 transition"
                >
                    <FiPlus />
                    <span>مقال جديد</span>
                </Link>
            </div>

            <div className="bg-white dark:bg-card-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="ابحث عن مقال..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-light focus:outline-none focus:border-action-blue"
                    />
                    <FiSearch className="absolute right-3 top-3 text-gray-400" />
                </div>

                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">لا توجد مقالات لعرضها.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-r-lg font-medium">العنوان</th>
                                    <th className="px-4 py-3 font-medium">التصنيف</th>
                                    <th className="px-4 py-3 font-medium">الحالة</th>
                                    <th className="px-4 py-3 font-medium">التاريخ</th>
                                    <th className="px-4 py-3 rounded-l-lg font-medium">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition">
                                        <td className="px-4 py-4 truncate max-w-xs font-medium text-gray-900 dark:text-gray-100">
                                            {post.title}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">{post.category || "---"}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {post.status === "PUBLISHED" ? "منشور" : "مسودة"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">
                                            {new Date(post.createdAt).toLocaleDateString("ar")}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link href={`/dashboard/admin/blog/${post.slug}`} className="text-gray-400 hover:text-action-blue transition">
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button onClick={() => deletePost(post.slug)} className="text-gray-400 hover:text-red-500 transition">
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
