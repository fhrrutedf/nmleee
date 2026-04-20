"use client";

import React, { useEffect, useState } from "react";
import { FiUsers, FiMail, FiDownload, FiSearch } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiGet } from "@/lib/safe-fetch";

export default function SubscribersList() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchSubscribers = async () => {
        try {
            const data = await apiGet("/api/admin/subscribers");
            setSubscribers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,Email,Date,Status,Source\n" 
            + filteredSubscribers.map(s => `${s.email},${new Date(s.createdAt).toLocaleDateString()},${s.status},${s.source}`).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("تم تصدير القائمة بنجاح");
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FiUsers className="text-emerald-500" /> تجميع العملاء (القائمة البريدية)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">إدارة وتحميل المشتركين في النشرة البريدية وإشعارات المدونة.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/admin/blog" className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition">
                        العودة للمدونة
                    </Link>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-600 transition"
                    >
                        <FiDownload /> تصدير المشتركين CSV
                    </button>
                </div>
            </div>

            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute right-4 top-3.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="ابحث عن بريد إلكتروني..."
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
                                    <th className="px-6 py-4 rounded-r-xl">البريد الإلكتروني</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">المصدر</th>
                                    <th className="px-6 py-4 rounded-l-xl">تاريخ الاشتراك</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscribers.length > 0 ? filteredSubscribers.map((sub) => (
                                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            <FiMail className="text-gray-500" /> {sub.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${sub.status === 'SUBSCRIBED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {sub.status === 'SUBSCRIBED' ? 'مشترك' : 'ملغى الاشتراك'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {sub.source === 'blog_sidebar' ? 'الشريط الجانبي للمدونة' : sub.source}
                                        </td>
                                        <td className="px-6 py-4">{new Date(sub.createdAt).toLocaleDateString("ar-SA")}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-10 text-gray-500">لا يوجد مشتركون حاول البحث مرة أخرى</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
