"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiFolder } from "react-icons/fi";
import toast from "react-hot-toast";
import { getCategories, createCategory, deleteCategory, updateCategory } from "../actions";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameAr, setNameAr] = useState("");
    const [slug, setSlug] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (e) {
            toast.error("فشل تحميل التصنيفات");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameAr || !slug) return toast.error("يرجى إدخال الاسم والرابط");

        if (editingId) {
            const res = await updateCategory(editingId, { nameAr, slug });
            if (res.success) {
                toast.success("تم التحديث بنجاح");
                setEditingId(null);
                setNameAr("");
                setSlug("");
                loadCategories();
            } else {
                toast.error(res.error);
            }
        } else {
            const res = await createCategory({ nameAr, slug });
            if (res.success) {
                toast.success("تمت الإضافة بنجاح");
                setNameAr("");
                setSlug("");
                loadCategories();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟ سيتم فك ارتباط جميع المقالات به.")) return;
        const res = await deleteCategory(id);
        if (res.success) {
            toast.success("تم الحذف");
            loadCategories();
        } else {
            toast.error(res.error);
        }
    };

    const handleEdit = (cat: any) => {
        setEditingId(cat.id);
        setNameAr(cat.nameAr);
        setSlug(cat.slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <FiFolder className="text-emerald-500" /> إدارة التصنيفات
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
                        <h2 className="text-lg font-bold text-white mb-4">
                            {editingId ? "تعديل تصنيف" : "إضافة تصنيف جديد"}
                        </h2>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">اسم التصنيف (بالعربي)</label>
                            <input 
                                type="text"
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition"
                                value={nameAr}
                                onChange={e => setNameAr(e.target.value)}
                                placeholder="مثال: الربح من الإنترنت"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">الرابط المخصص (Slug)</label>
                            <input 
                                type="text"
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-left focus:border-emerald-500 outline-none transition"
                                dir="ltr"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="e-marketing"
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button 
                                type="submit"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                            >
                                {editingId ? "حفظ التعديلات" : <><FiPlus /> إضافة</>}
                            </button>
                            {editingId && (
                                <button 
                                    type="button"
                                    onClick={() => { setEditingId(null); setNameAr(""); setSlug(""); }}
                                    className="bg-gray-800 text-gray-400 px-4 rounded-xl hover:text-white transition"
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-right">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4">التصنيف</th>
                                    <th className="p-4">الرابط</th>
                                    <th className="p-4 text-center">المقالات</th>
                                    <th className="p-4 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
                                ) : categories.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا توجد تصنيفات بعد.</td></tr>
                                ) : categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-white/[0.02] transition">
                                        <td className="p-4 font-bold text-white">{cat.nameAr}</td>
                                        <td className="p-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md text-xs font-bold">
                                                {cat._count.articles}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 text-gray-400 hover:text-emerald-500 transition"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition"
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
                </div>
            </div>
        </div>
    );
}
