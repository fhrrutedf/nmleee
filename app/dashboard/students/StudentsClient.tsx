"use client";

import { useState } from "react";
import { FiDownload, FiMail, FiSearch, FiAward, FiCheckCircle } from "react-icons/fi";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type Student = {
    id: string;
    name: string;
    email: string;
    courseTitle: string;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
    joinedAt: string;
};

export default function StudentsClient({ initialStudents }: { initialStudents: Student[] }) {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ["الاسم,البريد الإلكتروني,الدورة,نسبة الإكمال,تاريخ الانضمام,تاريخ الإكمال"];
        const rows = students.map((s) => {
            return `${s.name},${s.email},${s.courseTitle},${s.progress}%,${format(new Date(s.joinedAt), "yyyy-MM-dd")},${s.completedAt ? format(new Date(s.completedAt), "yyyy-MM-dd") : "لم يكتمل"}`;
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `students_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter students
    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.courseTitle.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white dark:bg-card-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الإيميل، أو اسم الدورة..."
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-light focus:outline-none focus:ring-2 focus:ring-action-blue/20 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                        className="flex-1 md:flex-none btn btn-outline flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm"
                        onClick={exportToCSV}
                    >
                        <FiDownload />
                        <span>تصدير Excel</span>
                    </button>
                    <button
                        className="flex-1 md:flex-none btn btn-primary flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm"
                    >
                        <FiMail />
                        <span>إرسال إيميل للكل</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <tr>
                            <th className="px-6 py-4 font-medium rounded-r-xl">الطالب</th>
                            <th className="px-6 py-4 font-medium">الدورة التدريبية</th>
                            <th className="px-6 py-4 font-medium">نسبة الإكمال</th>
                            <th className="px-6 py-4 font-medium">تاريخ الانضمام</th>
                            <th className="px-6 py-4 font-medium rounded-l-xl">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    لا يوجد طلاب لعرضهم.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {student.name}
                                        </div>
                                        <div className="text-gray-500 text-xs mt-1">
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {student.courseTitle}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 min-w-[100px] max-w-[150px]">
                                                <div
                                                    className={`h-2 rounded-full ${student.isCompleted ? 'bg-green-500' : 'bg-action-blue'}`}
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium w-8">{student.progress}%</span>
                                            {student.isCompleted && <FiCheckCircle className="text-green-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {format(new Date(student.joinedAt), "dd MMMM yyyy", { locale: ar })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 text-action-blue hover:bg-action-blue/10 rounded-lg transition-colors"
                                                title="إرسال رسالة"
                                            >
                                                <FiMail />
                                            </button>
                                            <button
                                                className="p-2 text-purple-600 hover:bg-purple-600/10 rounded-lg transition-colors"
                                                title="إصدار شهادة"
                                            >
                                                <FiAward />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
