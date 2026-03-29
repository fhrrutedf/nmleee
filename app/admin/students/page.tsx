'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    FiUsers, FiChevronDown, FiChevronUp, FiSearch,
    FiBook, FiUser, FiMail, FiCheckCircle, FiArrowRight
} from 'react-icons/fi';

interface CourseInfo {
    id: string;
    title: string;
    studentCount: number;
}

interface Trainer {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
    totalStudents: number;
    courses: CourseInfo[];
}

interface StudentInfo {
    id: string;
    name: string;
    email: string;
    courseTitle: string;
    courseId: string;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
    joinedAt: string;
}

export default function AdminStudentsPage() {
    const { data: session } = useSession();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTrainer, setExpandedTrainer] = useState<string | null>(null);
    const [trainerStudents, setTrainerStudents] = useState<Record<string, StudentInfo[]>>({});
    const [loadingStudents, setLoadingStudents] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (session) fetchTrainers();
    }, [session]);

    const fetchTrainers = async () => {
        try {
            const res = await fetch('/api/admin/students');
            if (res.ok) {
                const data = await res.json();
                setTrainers(data.trainers || []);
            }
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTrainer = async (trainerId: string) => {
        if (expandedTrainer === trainerId) {
            setExpandedTrainer(null);
            return;
        }
        setExpandedTrainer(trainerId);

        if (!trainerStudents[trainerId]) {
            setLoadingStudents(trainerId);
            try {
                const res = await fetch(`/api/admin/students?trainerId=${trainerId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTrainerStudents(prev => ({ ...prev, [trainerId]: data.students }));
                }
            } catch (e) {
                console.error('Error:', e);
            } finally {
                setLoadingStudents(null);
            }
        }
    };

    const totalStudents = trainers.reduce((s, t) => s + t.totalStudents, 0);

    const filteredTrainers = trainers.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#111111] dark:bg-gray-900">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white dark:text-white">🎓 الطلاب</h1>
                    <p className="text-gray-500 mt-1">عرض الطلاب حسب المدرب (شجرة)</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-lg shadow-[#10B981]/20">
                        <p className="text-xs text-gray-400 font-bold uppercase">إجمالي الطلاب</p>
                        <p className="text-2xl font-bold text-[#10B981] mt-1">{totalStudents}</p>
                    </div>
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-lg shadow-[#10B981]/20">
                        <p className="text-xs text-gray-400 font-bold uppercase">المدربين</p>
                        <p className="text-2xl font-bold text-white dark:text-white mt-1">{trainers.length}</p>
                    </div>
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-lg shadow-[#10B981]/20">
                        <p className="text-xs text-gray-400 font-bold uppercase">الكورسات النشطة</p>
                        <p className="text-2xl font-bold text-[#10B981]-600 mt-1">{trainers.reduce((s, t) => s + t.courses.length, 0)}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-lg shadow-[#10B981]/20">
                    <div className="relative">
                        <FiSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="ابحث عن مدرب..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-emerald-500/20 dark:border-gray-700 bg-[#111111] dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-ink/20"
                        />
                    </div>
                </div>

                {/* Trainers Tree */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-ink"></div>
                    </div>
                ) : filteredTrainers.length === 0 ? (
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <FiUsers className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-400 text-lg">لا يوجد مدربين لديهم طلاب</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTrainers.map(trainer => (
                            <div key={trainer.id} className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-[#10B981]/20 overflow-hidden">
                                {/* Trainer Card (clickable) */}
                                <button
                                    onClick={() => toggleTrainer(trainer.id)}
                                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#111111] dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden">
                                            {trainer.avatar ? (
                                                <img src={trainer.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser size={20} className="text-[#10B981]" />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white dark:text-white">{trainer.name || 'مدرب'}</p>
                                            <p className="text-xs text-gray-400">@{trainer.username} · {trainer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-[#10B981]">{trainer.totalStudents}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">طالب</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            {trainer.courses.map(c => (
                                                <span key={c.id} className="bg-emerald-800 dark:bg-gray-700 px-2 py-1 rounded-lg hidden sm:inline">
                                                    {c.title} ({c.studentCount})
                                                </span>
                                            ))}
                                        </div>
                                        {expandedTrainer === trainer.id ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>
                                </button>

                                {/* Students Table (expanded) */}
                                {expandedTrainer === trainer.id && (
                                    <div className="border-t border-gray-100 dark:border-gray-700">
                                        {loadingStudents === trainer.id ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-ink"></div>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-[#111111] dark:bg-gray-900/50">
                                                            <th className="text-right px-4 py-3 text-xs font-bold text-gray-400">الطالب</th>
                                                            <th className="text-right px-4 py-3 text-xs font-bold text-gray-400">الكورس</th>
                                                            <th className="text-right px-4 py-3 text-xs font-bold text-gray-400">التقدم</th>
                                                            <th className="text-right px-4 py-3 text-xs font-bold text-gray-400">تاريخ الانضمام</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {(trainerStudents[trainer.id] || []).map(student => (
                                                            <tr key={student.id} className="hover:bg-[#111111] dark:hover:bg-gray-800/50">
                                                                <td className="px-4 py-3">
                                                                    <p className="font-bold text-white dark:text-white text-xs">{student.name}</p>
                                                                    <p className="text-[11px] text-gray-400">{student.email}</p>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-300">{student.courseTitle}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-xl h-1.5">
                                                                            <div
                                                                                className={`h-1.5 rounded-xl ${student.isCompleted ? 'bg-emerald-700 text-white-500' : 'bg-emerald-700 text-white'}`}
                                                                                style={{ width: `${student.progress}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[11px]">{student.progress}%</span>
                                                                        {student.isCompleted && <FiCheckCircle size={12} className="text-[#10B981]-500" />}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-[11px] text-gray-400">
                                                                    {new Date(student.joinedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {(trainerStudents[trainer.id] || []).length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">لا يوجد طلاب</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
