'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiCheckCircle, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function MyAppointmentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/my-appointments');
        } else if (status === 'authenticated') {
            fetchAppointments();
        }
    }, [status, router]);

    const fetchAppointments = async () => {
        try {
            const data = await apiGet('/api/appointments/my-appointments');
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const upcoming = appointments.filter((a: any) => a.status === 'pending' || a.status === 'confirmed');
    const completed = appointments.filter((a: any) => a.status === 'completed');
    const cancelled = appointments.filter((a: any) => a.status === 'cancelled');

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">مواعيدي</h1>
                    <p className="text-gray-600">جميع المواعيد التي حجزتها</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">القادمة</p>
                                <p className="text-3xl font-bold mt-1">{upcoming.length}</p>
                            </div>
                            <FiCalendar className="text-4xl text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">المكتملة</p>
                                <p className="text-3xl font-bold mt-1">{completed.length}</p>
                            </div>
                            <FiCheckCircle className="text-4xl text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">الملغاة</p>
                                <p className="text-3xl font-bold mt-1">{cancelled.length}</p>
                            </div>
                            <FiX className="text-4xl text-red-200" />
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">لا توجد مواعيد</h3>
                        <p className="text-gray-600 mb-6">لم تحجز أي مواعيد بعد</p>
                        <Link href="/book-appointment" className="btn btn-primary">
                            احجز موعد جديد
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((appointment: any) => (
                            <div key={appointment.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{appointment.title || 'موعد'}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar />
                                                <span>{new Date(appointment.date).toLocaleDateString('ar-EG')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiClock />
                                                <span>{appointment.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {appointment.type === 'online' ? <FiVideo /> : <FiMapPin />}
                                                <span>{appointment.type === 'online' ? 'عبر الإنترنت' : 'شخصياً'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                        appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {appointment.status === 'confirmed' ? 'مؤكد' :
                                            appointment.status === 'completed' ? 'مكتمل' :
                                                appointment.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                                    </span>
                                </div>

                                {appointment.notes && (
                                    <p className="text-gray-600 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                                        {appointment.notes}
                                    </p>
                                )}

                                {appointment.status === 'pending' && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-500">في انتظار تأكيد البائع</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Link href="/book-appointment" className="btn btn-primary">
                        احجز موعد جديد
                    </Link>
                </div>
            </div>
        </div>
    );
}
