'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiSave, FiClock, FiCalendar } from 'react-icons/fi';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
];

export default function AppointmentSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default 9 to 5, Mon-Fri (1-5)
    const [consultationPrice, setConsultationPrice] = useState<number>(0);
    const [availabilities, setAvailabilities] = useState<any[]>(
        DAYS_OF_WEEK.map(day => ({
            dayOfWeek: day.id,
            isActive: day.id >= 1 && day.id <= 5,
            startTime: '09:00',
            endTime: '17:00'
        }))
    );

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchSettings();
        }
    }, [status, router]);

    const fetchSettings = async () => {
        try {
            const data = await apiGet('/api/availability');
            if (data) {
                if (data.consultationPrice !== undefined) {
                    setConsultationPrice(data.consultationPrice);
                }

                const existingAvail = data.availabilities || [];
                // Merge loaded data with missing days just in case
                const merged = DAYS_OF_WEEK.map(day => {
                    const existing = existingAvail.find((a: any) => a.dayOfWeek === day.id);
                    return existing || {
                        dayOfWeek: day.id,
                        isActive: false,
                        startTime: '09:00',
                        endTime: '17:00'
                    };
                });
                setAvailabilities(merged);
            }
        } catch (error) {
            console.error('Error fetching availability settings:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiPost('/api/availability', {
                consultationPrice: Number(consultationPrice),
                availabilities: availabilities
            });
            toast.success('تم حفظ إعدادات المواعيد بنجاح!');
        } catch (error) {
            toast.error('فشل حفظ الإعدادات: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const updateDay = (dayOfWeek: number, field: string, value: any) => {
        setAvailabilities(prev => prev.map(a =>
            a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
        ));
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">إعدادات توفر المواعيد</h1>
                    <p className="text-gray-600 mt-2">حدد أوقات عملك والأيام المتاحة لاستقبال الجلسات والاستشارات</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <FiSave />}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <FiClock className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">سعر الاستشارة (بالجنيه)</h2>
                            <p className="text-sm text-gray-500">حدد سعر الجلسة الواحدة أو اتركها 0 لجعل الجلسات مجانية.</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">EGP</span>
                        <input
                            type="number"
                            min="0"
                            className="input-field pl-12 font-bold text-lg"
                            value={consultationPrice}
                            onChange={(e) => setConsultationPrice(e.target.value ? Number(e.target.value) : 0)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <FiCalendar className="text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">أيام وساعات العمل</h2>
                        <p className="text-sm text-gray-500">قم بتفعيل الأيام التي تود استقبال المواعيد فيها</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {DAYS_OF_WEEK.map((day) => {
                        const availability = availabilities.find(a => a.dayOfWeek === day.id)!;
                        return (
                            <div key={day.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border ${availability.isActive ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center gap-4 mb-4 md:mb-0 w-48">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={availability.isActive}
                                            onChange={(e) => updateDay(day.id, 'isActive', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                    <span className={`font-semibold text-lg ${availability.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {day.name}
                                    </span>
                                </div>

                                <div className={`flex items-center gap-4 transition-opacity ${availability.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">من</span>
                                        <div className="relative">
                                            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="time"
                                                value={availability.startTime}
                                                onChange={(e) => updateDay(day.id, 'startTime', e.target.value)}
                                                className="input-field pl-4 pr-10 py-2 w-36 text-center"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 text-sm">إلى</span>
                                        <div className="relative">
                                            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="time"
                                                value={availability.endTime}
                                                onChange={(e) => updateDay(day.id, 'endTime', e.target.value)}
                                                className="input-field pl-4 pr-10 py-2 w-36 text-center"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
                <FiClock className="text-xl flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold mb-1">ملاحظة هامة</h3>
                    <p className="text-sm">سيقوم النظام تلقائياً بتقسيم هذه الأوقات إلى فترات زمنية (Sessions) مدتها ساعة تقريباً قابلة للحجز من قِبل المشترين بحسب التوقيت المحلي لهم.</p>
                </div>
            </div>
        </div>
    );
}
