"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers, FiUsers, FiActivity, FiEye, FiCheckCircle, FiFileText } from "react-icons/fi";
import { deleteArticle } from "./actions";
import toast from "react-hot-toast";
import { apiGet } from "@/lib/safe-fetch";

export default function ArticlesList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchArticles = async () => {
        try {
            const data = await apiGet("/api/blog"); 
            setArticles(data || []);
        } catch (error) {
            console.error(error);
            toast.error("فشل تحميل المقالات");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المقال نهائياً؟")) return;
        const res = await deleteArticle(id);
        if (res.success) {
            toast.success("تم الحذف بنجاح");
            fetchArticles();
        } else {
            toast.error("فشل الحذف");
        }
    };

    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: articles.length,
        published: articles.filter(a => a.status === 'PUBLISHED').length,
        drafts: articles.filter(a => a.status === 'DRAFT').length,
        views: articles.reduce((acc, curr) => acc + (curr.views || 0), 0)
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">لوحة تحكم المدونة</h1>
                    <p className="text-slate-500 font-medium text-sm">أهلاً بك في نظام إدارة المحتوى المتقدم لمنصة ماناسا ديجيتال.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/dashboard/admin/blog/categories"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/5 transition"
                    >
                        <FiLayers className="text-emerald-500" /> التصنيفات
                    </Link>
                    <Link
                        href="/dashboard/admin/blog/subscribers"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-white/10 text-slate-300 rounded-xl font-bold text-sm hover:bg-white/5 transition"
                    >
                        <FiUsers className="text-emerald-500" /> المشتركون
                    </Link>
                    <Link
                        href="/dashboard/admin/blog/new"
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition"
                    >
                        <FiPlus /> إضافة مقال جديد
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "إجمالي المقالات", value: stats.total, icon: <FiFileText />, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "مقالات منشورة", value: stats.published, icon: <FiCheckCircle />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "مسودات", value: stats.drafts, icon: <FiEdit2 />, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "إجمالي المشاهدات", value: stats.views, icon: <FiEye />, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0A0A0A] p-5 rounded-2xl border border-white/5 shadow-lg">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 text-xl`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* List Section */}
            <div className="bg-[#0A0A0A] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="ابحث بالعنوان أو الكاتب..."
                            className="w-full bg-[#111111] border border-white/10 rounded-xl pr-12 pl-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${statusFilter === "ALL" ? "bg-emerald-600 text-white" : "bg-[#111111] text-slate-500 hover:text-slate-300"}`}
                        >
                            الكل
                        </button>
                        <button 
                            onClick={() => setStatusFilter("PUBLISHED")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${statusFilter === "PUBLISHED" ? "bg-emerald-600 text-white" : "bg-[#111111] text-slate-500 hover:text-slate-300"}`}
                        >
                            المنشورة
                        </button>
                        <button 
                            onClick={() => setStatusFilter("DRAFT")}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${statusFilter === "DRAFT" ? "bg-emerald-600 text-white" : "bg-[#111111] text-slate-500 hover:text-slate-300"}`}
                        >
                            المسودات
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
                        <p className="text-slate-500 font-bold">جاري تحميل المحتوى...</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="py-20 text-center text-slate-600 font-bold">
                        لم يتم العثور على أي مقالات تطابق بحثك.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-5">المقال</th>
                                    <th className="px-6 py-5">الحالة</th>
                                    <th className="px-6 py-5">المشاهدات</th>
                                    <th className="px-6 py-5">التاريخ</th>
                                    <th className="px-6 py-5 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredArticles.map((article) => (
                                    <tr key={article.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {article.coverImage ? (
                                                    <img src={article.coverImage} className="w-12 h-12 rounded-xl object-cover border border-white/5" alt="" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-700">
                                                        <FiFileText size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-white font-bold mb-0.5 group-hover:text-emerald-400 transition-colors">{article.title}</h4>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">{article.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                article.status === 'PUBLISHED' 
                                                    ? 'bg-emerald-500/10 text-emerald-500' 
                                                    : article.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${article.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                                {article.status === 'PUBLISHED' ? 'منشور' : (article.status === 'SCHEDULED' ? 'مجدول' : 'مسودة')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-slate-400 text-sm">
                                            {article.views || 0}
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-xs font-bold">
                                            {new Date(article.createdAt).toLocaleDateString("ar-SA")}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <Link 
                                                    href={`/dashboard/admin/blog/${article.id}/edit`} 
                                                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(article.id)} 
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition"
                                                    title="حذف"
                                                >
                                                    <FiTrash2 size={18} />
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
