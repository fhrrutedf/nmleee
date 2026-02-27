'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUser, FiVideo, FiCheck, FiX, FiPlus, FiEdit, FiTrash2, FiMessageSquare, FiDollarSign, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet, apiPut, apiDelete, apiPost, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showModal, setShowModal] = useState(false);

    // Add form state
    const [formData, setFormData] = useState({
        title: 'استشارة متخصصة',
        date: '',
        time: '',
        duration: 60,
        price: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        meetingLink: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleAddConsultation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dateTimeString = `${formData.date}T${formData.time}`;
            const appointmentDate = new Date(dateTimeString);

            await apiPost('/api/appointments', {
                title: formData.title,
                date: appointmentDate.toISOString(),
                duration: Number(formData.duration),
                price: Number(formData.price),
                customerName: formData.customerName || null,
                customerEmail: formData.customerEmail || null,
                customerPhone: formData.customerPhone || null,
                meetingLink: formData.meetingLink || null,
                description: formData.description || null,
                status: 'CONFIRMED'
            });

            toast.success('تم إضافة الاستشارة بنجاح');
            setShowModal(false);
            setFormData({
                title: 'استشارة متخصصة',
                date: '',
                time: '',
                duration: 60,
                price: 0,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                meetingLink: '',
                description: ''
            });
            fetchAppointments();
        } catch (error) {
            console.error('Error adding consultation:', handleApiError(error));
            toast.error('فشل إضافة الاستشارة: ' + handleApiError(error));
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchAppointments();
        }
    }, [session]);

    const fetchAppointments = async () => {
        try {
            const data = await apiGet('/api/appointments');
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await apiPut(`/api/appointments/${id}`, { status });
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', handleApiError(error));
            toast.error('فشل تحديث الحالة: ' + handleApiError(error));
        }
    };

    const deleteAppointment = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

        try {
            await apiDelete(`/api/appointments/${id}`);
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', handleApiError(error));
            toast.error('فشل حذف الموعد: ' + handleApiError(error));
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter((apt: any) => apt.status === 'confirmed' || apt.status === 'pending');
    const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed');
    const cancelledAppointments = appointments.filter((apt: any) => apt.status === 'cancelled');

    const currentList = activeTab === 'upcoming' ? upcomingAppointments :
        activeTab === 'completed' ? completedAppointments :
            cancelledAppointments;

    // حساب إجمالي الإيرادات
    const totalRevenue = completedAppointments.reduce((sum: number, apt: any) => sum + (apt.price || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">إدارة الجلسات والاستشارات</h1>
                    <p className="text-gray-600 mt-2">جدول جلساتك الاستشارية</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/appointments/settings" className="btn btn-outline flex items-center gap-2">
                        <FiSettings />
                        <span className="hidden sm:inline">أوقات العمل</span>
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <FiPlus />
                        <span className="hidden sm:inline">إضافة استشارة</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">إجمالي الاستشارات</p>
                            <p className="text-3xl font-bold mt-1">{appointments.length}</p>
                        </div>
                        <FiCalendar className="text-4xl text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">قادمة</p>
                            <p className="text-3xl font-bold mt-1">{upcomingAppointments.length}</p>
                        </div>
                        <FiCheck className="text-4xl text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">مكتملة</p>
                            <p className="text-3xl font-bold mt-1">{completedAppointments.length}</p>
                        </div>
                        <FiCheck className="text-4xl text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">إجمالي الإيرادات</p>
                            <p className="text-3xl font-bold mt-1">{totalRevenue.toFixed(0)} ج.م</p>
                        </div>
                        <FiDollarSign className="text-4xl text-orange-200" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'upcoming'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            القادمة ({upcomingAppointments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'completed'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            المكتملة ({completedAppointments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('cancelled')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${activeTab === 'cancelled'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            الملغاة ({cancelledAppointments.length})
                        </button>
                    </nav>
                </div>

                {/* Appointments List */}
                {currentList.length === 0 ? (
                    <div className="text-center py-12">
                        <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد استشارات</h3>
                        <p className="text-gray-500 mb-6">لم تقم بإنشاء أي استشارات في هذه الفئة بعد</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary"
                        >
                            إضافة استشارة جديدة
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentList.map((appointment: any) => (
                            <div
                                key={appointment.id}
                                className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                            <FiUser className="text-2xl" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                                {appointment.title || 'جلسة استشارية'}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-primary-600" />
                                                    <span>{new Date(appointment.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiClock className="text-primary-600" />
                                                    <span>{appointment.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiVideo className="text-primary-600" />
                                                    <span>{appointment.type === 'online' ? 'عبر الإنترنت' : 'شخصياً'}</span>
                                                </div>
                                            </div>

                                            {appointment.notes && (
                                                <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                                    <FiMessageSquare className="text-primary-600 mt-1" />
                                                    <p className="flex-1">{appointment.notes}</p>
                                                </div>
                                            )}

                                            {appointment.clientName && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">العميل:</span>
                                                    <span className="font-medium">{appointment.clientName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {appointment.status === 'confirmed' ? 'مؤكد' :
                                                appointment.status === 'pending' ? 'قيد الانتظار' :
                                                    appointment.status === 'completed' ? 'مكتمل' :
                                                        'ملغي'}
                                        </span>

                                        {appointment.price && (
                                            <span className="text-xl font-bold text-primary-600">
                                                {appointment.price} ج.م
                                            </span>
                                        )}

                                        <div className="flex gap-2">
                                            {appointment.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                                                        className="btn btn-sm bg-green-500 hover:bg-green-600 text-white"
                                                        title="تأكيد"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                                                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                                        title="إلغاء"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </>
                                            )}

                                            {appointment.status === 'confirmed' && (
                                                <button
                                                    onClick={() => updateStatus(appointment.id, 'completed')}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    تم الإكمال
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteAppointment(appointment.id)}
                                                className="btn btn-sm btn-outline text-red-500 hover:bg-red-50"
                                                title="حذف"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal لإضافة موعد جديد */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">إضافة استشارة جديدة</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX className="text-2xl" />
                            </button>
                        </div>

                        <form onSubmit={handleAddConsultation} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الاستشارة *</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="input-field w-full"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field w-full"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الوقت *</label>
                                    <input
                                        type="time"
                                        required
                                        className="input-field w-full"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="15"
                                        step="15"
                                        className="input-field w-full"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط الاجتماع (اختياري)</label>
                                    <input
                                        type="url"
                                        className="input-field w-full text-left"
                                        dir="ltr"
                                        placeholder="https://zoom.us/..."
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-6">
                                <h4 className="font-semibold text-gray-800 mb-4">بيانات العميل (اختياري)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني للعميل</label>
                                        <input
                                            type="email"
                                            className="input-field w-full text-left"
                                            dir="ltr"
                                            value={formData.customerEmail}
                                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                                <textarea
                                    className="input-field w-full"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-outline"
                                    disabled={submitting}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex items-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <FiCheck />
                                    )}
                                    <span>حفظ وتأكيد</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
