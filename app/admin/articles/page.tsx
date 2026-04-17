"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from "react-icons/fi";
import { deleteArticle } from "./actions";
import toast from "react-hot-toast";

export default function ArticlesList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchArticles = async () => {
        try {
            const res = await fetch("/api/articles"); // We need to create an API route for GET
            if (res.ok) {
                const data = await res.json();
                setArticles(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        const res = await deleteArticle(id);
        if (res.success) {
            toast.success("تم الحذف بنجاح");
            fetchArticles();
        } else {
            toast.error("فشل الحذف");
        }
    };

    const filteredArticles = articles.filter(a => a.title.includes(search));

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">إدارة المقالات</h1>
                    <p className="text-sm text-gray-500">نظام مستقل لإدارة محتوى منصة ماناسا ديجيتال</p>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition"
                >
                    <FiPlus /> إضافة مقال
                </Link>
            </div>

            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute right-4 top-3.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="ابحث عن مقال..."
                            className="w-full bg-[#111111] border border-white/10 rounded-xl pr-11 pl-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center text-gray-500 py-10">جاري التحميل...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-[#111111]">
                                <tr>
                                    <th className="px-6 py-4 rounded-r-xl">العنوان</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">تاريخ الإنشاء</th>
                                    <th className="px-6 py-4 rounded-l-xl text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArticles.map((article) => (
                                    <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                        <td className="px-6 py-4 font-medium text-white">{article.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${article.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {article.status === 'PUBLISHED' ? 'منشور' : (article.status === 'SCHEDULED' ? 'مجدول' : 'مسودة')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(article.createdAt).toLocaleDateString("ar-SA")}</td>
                                        <td className="px-6 py-4 flex justify-center gap-2">
                                            <Link href={`/admin/articles/${article.id}/edit`} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition">
                                                <FiEdit2 size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(article.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition">
                                                <FiTrash2 size={16} />
                                            </button>
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
