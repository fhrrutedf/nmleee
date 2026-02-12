'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiUsers, FiTrendingUp, FiClock, FiAward, FiBarChart2 } from 'react-icons/fi';

interface StudentProgress {
    id: string;
    student: {
        name: string;
        email: string;
    };
    progress: number;
    totalWatchTime: number;
    lastAccessedAt: string;
    isCompleted: boolean;
    completedAt?: string;
}

export default function CourseReportsPage() {
    const params = useParams();
    const courseId = params.id as string;

    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        completionRate: 0,
        averageProgress: 0,
        totalWatchTime: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [courseId]);

    const fetchReports = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/reports`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">تقارير الدورة</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">إجمالي الطلاب</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FiUsers className="text-indigo-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">معدل الإكمال</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FiAward className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">متوسط التقدم</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.averageProgress.toFixed(0)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiTrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">إجمالي وقت المشاهدة</p>
                                <p className="text-3xl font-bold text-gray-900">{formatTime(stats.totalWatchTime)}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiClock className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiBarChart2 />
                        توزيع التقدم
                    </h2>
                    <div className="h-64 flex items-end gap-2">
                        {[0, 25, 50, 75, 100].map((range) => {
                            const count = students.filter(
                                (s) => s.progress >= range && s.progress < range + 25
                            ).length;
                            const percentage = students.length > 0 ? (count / students.length) * 100 : 0;

                            return (
                                <div key={range} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t-lg hover:bg-indigo-600 transition-colors cursor-pointer"
                                        style={{ height: `${percentage * 2}px` }}
                                        title={`${count} طلاب`}
                                    />
                                    <p className="text-xs text-gray-600 mt-2">{range}%-{range + 24}%</p>
                                    <p className="text-sm font-semibold text-gray-900">{count}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-bold text-gray-900">تفاصيل الطلاب</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الطالب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        التقدم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        وقت المشاهدة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        آخر دخول
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الحالة
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{student.student.name}</p>
                                                <p className="text-sm text-gray-500">{student.student.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 w-12">
                                                    {student.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatTime(student.totalWatchTime)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {student.lastAccessedAt ? formatDate(student.lastAccessedAt) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.isCompleted ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    مكتمل
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    قيد التقدم
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {students.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            لا يوجد طلاب مسجلون في هذه الدورة بعد
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
