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
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#10B981] dark:text-white flex items-center gap-2">
                    <FiUsers className="text-[#10B981]" /> الطلاب
                </h1>
                <p className="text-text-muted text-sm mt-1">عرض الطلاب حسب المدرب (شجرة)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">إجمالي الطلاب</p>
                    <p className="text-2xl font-bold text-[#10B981] mt-1">{totalStudents}</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">المدربين</p>
                    <p className="text-2xl font-bold text-[#10B981] dark:text-white mt-1">{trainers.length}</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <p className="text-xs text-text-muted font-bold uppercase">الكورسات النشطة</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{trainers.reduce((s, t) => s + t.courses.length, 0)}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <div className="relative">
                    <FiSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="ابحث عن مدرب..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input w-full pr-10"
                    />
                </div>
            </div>

            {/* Trainers Tree */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin" />
                </div>
            ) : filteredTrainers.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiUsers className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-text-muted text-lg">لا يوجد مدربين لديهم طلاب</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTrainers.map(trainer => (
                        <div key={trainer.id} className="card overflow-hidden p-0">
                            {/* Trainer Card (clickable) */}
                            <button
                                onClick={() => toggleTrainer(trainer.id)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#111111] dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                                        {trainer.avatar ? (
                                            <img src={trainer.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser size={20} className="text-[#10B981]" />
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#10B981] dark:text-white">{trainer.name || 'مدرب'}</p>
                                        <p className="text-xs text-text-muted">@{trainer.username} · {trainer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#10B981]">{trainer.totalStudents}</p>
                                        <p className="text-[10px] text-text-muted uppercase font-bold">طالب</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-muted">
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
                                            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-[#111111] dark:bg-gray-900/50">
                                                        <th className="text-right px-4 py-3 text-xs font-bold text-text-muted">الطالب</th>
                                                        <th className="text-right px-4 py-3 text-xs font-bold text-text-muted">الكورس</th>
                                                        <th className="text-right px-4 py-3 text-xs font-bold text-text-muted">التقدم</th>
                                                        <th className="text-right px-4 py-3 text-xs font-bold text-text-muted">تاريخ الانضمام</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {(trainerStudents[trainer.id] || []).map(student => (
                                                        <tr key={student.id} className="hover:bg-[#111111] dark:hover:bg-gray-800/50">
                                                            <td className="px-4 py-3">
                                                                <p className="font-bold text-[#10B981] dark:text-white text-xs">{student.name}</p>
                                                                <p className="text-[11px] text-text-muted">{student.email}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{student.courseTitle}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-xl h-1.5">
                                                                        <div
                                                                            className={`h-1.5 rounded-xl ${student.isCompleted ? 'bg-green-500' : 'bg-emerald-700'}`}
                                                                            style={{ width: `${student.progress}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[11px]">{student.progress}%</span>
                                                                    {student.isCompleted && <FiCheckCircle size={12} className="text-green-500" />}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-[11px] text-text-muted">
                                                                {new Date(student.joinedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(trainerStudents[trainer.id] || []).length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-text-muted text-xs">لا يوجد طلاب</td>
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
    );
}
