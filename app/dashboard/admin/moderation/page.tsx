'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiClock, FiShield } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface PendingCourse {
    id: string;
    title: string;
    price: number;
    createdAt: string;
    user: { name: string; email: string };
    modules: { id: string }[];
}

export default function CourseModerationPage() {
    const [courses, setCourses] = useState<PendingCourse[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/moderation');
            if (!res.ok) throw new Error('فشل جلب الكورسات');
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            showToast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/moderation/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' })
            });

            if (res.ok) {
                showToast.success('تمت الموافقة بنجاح');
                setCourses(prev => prev.filter(c => c.id !== id));
            } else {
                showToast.error('حدث خطأ');
            }
        } catch {
            showToast.error('حدث خطأ بالاتصال');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!activeCourseId || !rejectReason.trim()) {
            showToast.error('الرجاء كتابة سبب الرفض');
            return;
        }

        setProcessingId(activeCourseId);
        try {
            const res = await fetch(`/api/admin/moderation/${activeCourseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED', reason: rejectReason })
            });

            if (res.ok) {
                showToast.success('تم رفض الكورس بنجاح وتم إشعار المدرب');
                setCourses(prev => prev.filter(c => c.id !== activeCourseId));
                setIsRejectModalOpen(false);
                setRejectReason('');
            } else {
                showToast.error('حدث خطأ');
            }
        } catch {
            showToast.error('حدث خطأ بالاتصال');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#10B981] dark:text-white flex items-center gap-2">
                        <FiShield className="text-[#10B981]" /> حارس المحتوى (المراجعة)
                    </h1>
                    <p className="text-text-muted text-sm mt-1">كافة الكورسات المدرجة حديثاً تنتظر الموافقة للظهور في السوق</p>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="card text-center py-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6">
                        <FiCheck className="text-4xl text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">النظام نظيف تماماً!</h2>
                    <p className="text-gray-500 dark:text-gray-400">لا توجد أي كورسات جديدة بانتظار المراجعة.</p>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead className="border-b border-gray-100 dark:border-gray-800 text-sm">
                            <tr>
                                <th className="px-5 py-4 font-semibold text-gray-500">اسم الكورس</th>
                                <th className="px-5 py-4 font-semibold text-gray-500">المدرب</th>
                                <th className="px-5 py-4 font-semibold text-gray-500">السعر</th>
                                <th className="px-5 py-4 font-semibold text-gray-500">الوحدات</th>
                                <th className="px-5 py-4 font-semibold text-gray-500">تاريخ الإضافة</th>
                                <th className="px-5 py-4 font-semibold text-gray-500 text-center">تفاصيل وقرار</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-[#111111] dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="font-bold text-[#10B981] dark:text-white">
                                            {course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{course.user.name}</span>
                                            <span className="text-xs text-text-muted">{course.user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-green-600 font-bold">${course.price}</td>
                                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                        {course.modules?.length || 0} فصول
                                    </td>
                                    <td className="px-5 py-4 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {new Date(course.createdAt).toLocaleDateString('ar')}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <a
                                                href={`/course/${course.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="معاينة كزائر"
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-700-50 text-[#10B981]-600 hover:bg-blue-100 transition-colors"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleApprove(course.id)}
                                                disabled={processingId === course.id}
                                                title="موافقة"
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                            >
                                                <FiCheck className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setActiveCourseId(course.id);
                                                    setIsRejectModalOpen(true);
                                                }}
                                                disabled={processingId === course.id}
                                                title="رفض"
                                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ">
                    <div className="bg-[#0A0A0A] dark:bg-[#1a1c23] rounded-xl p-6 w-full max-w-md shadow-lg shadow-[#10B981]/20 relative">
                        <button
                            onClick={() => setIsRejectModalOpen(false)}
                            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500"
                        >
                            <FiX />
                        </button>

                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">رفض الكورس ⛔</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">الرجاء إبداء سبب الرفض ليتم إرساله كإشعار للمدرب لتصحيحه.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="label">أسباب الرفض (رسالة للمدرب)</label>
                                <textarea
                                    className="input w-full min-h-[120px] resize-y"
                                    placeholder="مثال: يرجى إضافة صورة غلاف مناسبة، أو جودة الصوت في المقطع التعريفي منخفضة..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 font-semibold">
                                <button
                                    className="px-5 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => {
                                        setIsRejectModalOpen(false);
                                        setRejectReason('');
                                    }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    className="btn bg-red-600 text-white hover:bg-red-700 px-6"
                                    onClick={handleReject}
                                    disabled={processingId === activeCourseId}
                                >
                                    {processingId === activeCourseId ? 'جاري التنفيذ...' : 'تأكيد الرفض'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
