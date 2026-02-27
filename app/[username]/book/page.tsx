'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCalendar, FiClock, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { apiGet } from '@/lib/safe-fetch';

const DAYS_OF_WEEK = [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
    { id: 2, name: 'الثلاثاء' },
    { id: 3, name: 'الأربعاء' },
    { id: 4, name: 'الخميس' },
    { id: 5, name: 'الجمعة' },
    { id: 6, name: 'السبت' },
];

export default function BookAppointmentPage() {
    const params = useParams();
    const router = useRouter();
    const [creator, setCreator] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    useEffect(() => {
        if (params.username) {
            fetchCreator();
        }
    }, [params.username]);

    const fetchCreator = async () => {
        try {
            const username = Array.isArray(params.username) ? params.username[0] : params.username;
            const data = await apiGet(`/api/creators/${username}`);
            if (!data.creator) throw new Error('Creator not found');
            setCreator(data.creator);
        } catch (err) {
            console.error(err);
            setError('لم يتم العثور على هذا البائع أو الصفحة غير موجودة.');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        setSelectedDate(dateStr);
        setSelectedTime('');

        if (dateStr && creator?.availabilities) {
            const dateObj = new Date(dateStr);
            const dayOfWeek = dateObj.getDay();

            const dayAvail = creator.availabilities.find((a: any) => a.dayOfWeek === dayOfWeek && a.isActive);
            if (dayAvail) {
                // Generate time slots (every hour for simplicity)
                const slots = [];
                let current = parseInt(dayAvail.startTime.split(':')[0]);
                const end = parseInt(dayAvail.endTime.split(':')[0]);

                while (current < end) {
                    slots.push(`${current.toString().padStart(2, '0')}:00`);
                    current++;
                }
                setAvailableTimes(slots);
            } else {
                setAvailableTimes([]);
            }
        } else {
            setAvailableTimes([]);
        }
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) return;

        // Prepare appointment item for checkout
        const appointmentItem = {
            id: `appt_${creator.id}_${Date.now()}`,
            type: 'appointment',
            title: `استشارة مع ${creator.name}`,
            price: creator.consultationPrice || 0,
            image: creator.avatar,
            brandColor: creator.brandColor,
        };

        const appointmentDetails = {
            date: selectedDate,
            time: selectedTime,
            sellerId: creator.id
        };

        // Create a special cart array for this direct checkout just to pass it to stripe
        // We will store it in sessionStorage instead of localStorage so we don't overwrite regular cart
        sessionStorage.setItem('direct_checkout_items', JSON.stringify([appointmentItem]));
        sessionStorage.setItem('appointment_details', JSON.stringify(appointmentDetails));

        router.push('/checkout?direct=true');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !creator) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">{error || 'البائع غير موجود'}</h1>
                <Link href="/" className="btn btn-primary">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    // Determine min date (today) and max date (30 days from now)
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDateObj = new Date();
    maxDateObj.setDate(today.getDate() + 30);
    const maxDate = maxDateObj.toISOString().split('T')[0];

    const hasAvailability = creator.availabilities && creator.availabilities.some((a: any) => a.isActive);

    const brandColor = creator.brandColor || '#D41295';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <style dangerouslySetInnerHTML={{
                __html: `
                .text-primary-600, .text-primary-700 { color: ${brandColor} !important; }
                .bg-primary-600 { background-color: ${brandColor} !important; }
                .bg-primary-50, .bg-primary-100 { background-color: ${brandColor}18 !important; }
                .bg-primary-100\/50 { background-color: ${brandColor}10 !important; }
                .bg-primary-50.to-primary-100\/50, .from-primary-50 { --tw-gradient-from: ${brandColor}18 !important; }
                .border-primary-100 { border-color: ${brandColor}30 !important; }
                .border-primary-500, .border-primary-300 { border-color: ${brandColor} !important; }
                .btn-primary { background-color: ${brandColor} !important; border-color: ${brandColor} !important; }
                .hover\\:text-primary-700:hover { color: ${brandColor}cc !important; }
                .hover\\:border-primary-300:hover { border-color: ${brandColor}60 !important; }
                .hover\\:bg-primary-50:hover { background-color: ${brandColor}12 !important; }
                .from-primary-50 { --tw-gradient-from: ${brandColor}15 !important; }
                .to-primary-100\/50 { --tw-gradient-to: ${brandColor}10 !important; }
                .animate-spin { border-bottom-color: ${brandColor} !important; }
            ` }} />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/${creator.username}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 gap-2 transition-colors">
                        <FiArrowRight />
                        <span>العودة لملف {creator.name}</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">حجز استشارة / جلسة</h1>
                    <p className="text-gray-600 mt-2">اختر الوقت المناسب لك للحصول على استشارتك مع {creator.name}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Seller Profile Summary */}
                    <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-100 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0">
                            {creator.avatar ? (
                                <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary-600">
                                    {creator.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{creator.name}</h2>
                            <p className="text-primary-700 text-sm">مدة الجلسة: 60 دقيقة</p>
                        </div>
                        <div className="mr-auto text-left">
                            <span className="block text-sm text-gray-500 mb-1">سعر الاستشارة</span>
                            <span className="text-2xl font-bold text-primary-600">
                                {creator.consultationPrice > 0 ? `${creator.consultationPrice} ج.م` : 'مجانية'}
                            </span>
                        </div>
                    </div>

                    {!hasAvailability ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FiCalendar className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مواعيد متاحة حالياً</h3>
                            <p className="text-gray-500">عذراً، هذا البائع لم يقم بإضافة أوقات عمل للحجوزات بعد. يرجى المحاولة لاحقاً.</p>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8">
                            {/* Step 1: Date Selection */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm">1</span>
                                    اختر يوم الحجز
                                </h3>

                                <input
                                    type="date"
                                    min={minDate}
                                    max={maxDate}
                                    value={selectedDate}
                                    onChange={handleDateSelect}
                                    className="input-field max-w-sm text-lg cursor-pointer"
                                />
                                {selectedDate && availableTimes.length === 0 && (
                                    <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                                        <FiUser />
                                        هذا اليوم غير متاح للحجز لدى البائع. الرجاء اختيار يوم آخر.
                                    </p>
                                )}
                            </div>

                            {/* Step 2: Time Selection */}
                            <div className={`transition-opacity duration-300 ${(!selectedDate || availableTimes.length === 0) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm">2</span>
                                    اختر وقت الجلسة
                                </h3>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {availableTimes.map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-3 rounded-lg border text-center transition-all ${selectedTime === time
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-md transform scale-105'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                                }`}
                                        >
                                            <span className="block font-medium">{time}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedDate || !selectedTime}
                                    className={`btn btn-primary px-8 py-3 text-lg flex items-center gap-2 transition-transform ${(!selectedDate || !selectedTime) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg'}`}
                                >
                                    <span>المتابعة للدفع</span>
                                    <FiCheckCircle />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
