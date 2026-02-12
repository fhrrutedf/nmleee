'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiVideo, FiCalendar, FiEdit, FiTrash2, FiEye, FiUsers, FiDollarSign, FiCheckCircle, FiXCircle, FiSearch, FiFilter } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiGet, apiDelete, apiPut, handleApiError } from '@/lib/safe-fetch';

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await apiGet('/api/courses');
            setCourses(data);

            // حساب الإحصائيات
            const active = data.filter((c: any) => c.isActive).length;
            const inactive = data.filter((c: any) => !c.isActive).length;
            const totalRevenue = data.reduce((sum: number, c: any) => sum + (c.price || 0), 0);

            setStats({
                total: data.length,
                active,
                inactive,
                totalRevenue
            });
        } catch (error) {
            console.error('Error fetching courses:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return;

        try {
            await apiDelete(`/api/courses/${id}`);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', handleApiError(error));
            alert('فشل حذف الدورة: ' + handleApiError(error));
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await apiPut(`/api/courses/${id}`, { isActive: !currentStatus });
            fetchCourses();
        } catch (error) {
            console.error('Error toggling status:', handleApiError(error));
        }
    };

    // تصفية الدورات
    const filteredCourses = courses.filter((course: any) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'active' && course.isActive) ||
            (filterStatus === 'inactive' && !course.isActive);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">الدورات التدريبية</h1>
                    <p className="text-text-muted mt-2">إدارة شاملة لجميع دوراتك التدريبية ومحتواها التعليمي</p>
                </div>
                <Link href="/dashboard/courses/new" className="btn btn-primary shadow-lg hover:shadow-blue-500/25">
                    <FiPlus className="ml-2 text-xl" />
                    <span>إضافة دورة جديدة</span>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">إجمالي الدورات</p>
                            <p className="text-3xl font-bold mt-2">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <FiVideo className="text-2xl text-white" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg shadow-green-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">دورات نشطة</p>
                            <p className="text-3xl font-bold mt-2">{stats.active}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <FiCheckCircle className="text-2xl text-white" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white border-none shadow-lg shadow-gray-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-100 text-sm font-medium">غير نشطة (مسودة)</p>
                            <p className="text-3xl font-bold mt-2">{stats.inactive}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <FiXCircle className="text-2xl text-white" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg shadow-purple-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">إجمالي القيمة</p>
                            <p className="text-3xl font-bold mt-2">{stats.totalRevenue.toFixed(0)} <span className="text-sm font-normal opacity-80">ج.م</span></p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <FiDollarSign className="text-2xl text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن دورة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pr-10 w-full"
                        />
                    </div>
                    <div className="relative">
                        <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input pr-10 w-full bg-white dark:bg-gray-800"
                        >
                            <option value="all">جميع الدورات</option>
                            <option value="active">النشطة فقط</option>
                            <option value="inactive">غير النشطة فقط</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="min-h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent mx-auto"></div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card text-center py-16 px-6 border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiVideo className="text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا توجد دورات مطابقة</h3>
                    <p className="text-text-muted mb-6">
                        {searchTerm || filterStatus !== 'all'
                            ? 'جرب تغيير شروط البحث أو الفلتر'
                            : 'ابدأ مشوارك التعليمي بإضافة دورتك التدريبية الأولى'
                        }
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                        <Link href="/dashboard/courses/new" className="btn btn-primary px-8">
                            إضافة دورة جديدة
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course: any, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col bg-card-white dark:bg-card-white border border-gray-100 dark:border-gray-800"
                        >
                            {/* صورة الدورة */}
                            <div className="relative h-48 overflow-hidden rounded-lg mb-4 bg-gray-100 dark:bg-gray-800">
                                {course.image ? (
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                        <FiVideo className="text-5xl text-blue-200 dark:text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${course.isActive
                                        ? 'bg-green-500/90 text-white'
                                        : 'bg-gray-500/90 text-white'
                                        }`}>
                                        {course.isActive ? 'منشور' : 'مسودة'}
                                    </span>
                                </div>
                            </div>

                            {/* معلومات الدورة */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-primary-charcoal dark:text-white mb-2 line-clamp-1 group-hover:text-action-blue transition-colors">{course.title}</h3>
                                <p className="text-text-muted text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {course.description || 'لا يوجد وصف مختصر'}
                                </p>
                            </div>

                            {/* تفاصيل */}
                            <div className="flex items-center gap-4 text-sm text-text-muted mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                {course.duration && (
                                    <div className="flex items-center gap-1.5">
                                        <FiCalendar />
                                        <span>{course.duration}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <FiUsers />
                                    <span>0 طالب</span>
                                </div>
                            </div>

                            {/* السعر والأزرار */}
                            <div className="mt-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-primary-charcoal dark:text-white">
                                        {course.price.toFixed(2)} <span className="text-xs font-normal text-text-muted">ج.م</span>
                                    </span>
                                    {course.category && (
                                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-action-blue text-xs rounded-md">
                                            {course.category}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        onClick={() => router.push(`/course/${course.id}`)}
                                        className="col-span-1 btn btn-secondary p-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 border-none"
                                        title="عرض"
                                    >
                                        <FiEye className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${course.id}/edit`)}
                                        className="col-span-2 btn btn-outline py-2 text-sm flex items-center justify-center gap-2"
                                    >
                                        <FiEdit /> تعديل
                                    </button>
                                    <button
                                        onClick={() => deleteCourse(course.id)}
                                        className="col-span-1 btn p-0 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <FiTrash2 className="text-lg" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => toggleStatus(course.id, course.isActive)}
                                    className={`w-full mt-3 btn btn-sm py-2 text-xs border ${course.isActive
                                        ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-500 dark:hover:bg-yellow-900/20'
                                        : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-500 dark:hover:bg-green-900/20'
                                        }`}
                                >
                                    {course.isActive ? 'إيقاف النشر (تحويل لمسودة)' : 'نشر الدورة الآن'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
