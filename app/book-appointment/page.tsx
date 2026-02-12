'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiUser, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';

export default function BookAppointmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        type: 'online',
        notes: '',
        service: ''
    });

    // أوقات متاحة (يمكن جلبها من API)
    const availableTimes = [
        '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00'
    ];

    const services = [
        { id: 'consultation', name: 'استشارة عامة', duration: '30 دقيقة', price: 100 },
        { id: 'training', name: 'جلسة تدريبية', duration: '60 دقيقة', price: 200 },
        { id: 'workshop', name: 'ورشة عمل', duration: '120 دقيقة', price: 500 }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.date || !formData.time || !formData.service) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('تم حجز الموعد بنجاح! سنتواصل معك قريباً للتأكيد.');
                router.push('/my-appointments');
            } else {
                alert('حدث خطأ في الحجز. حاول مرة أخرى');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('حدث خطأ. حاول مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const selectedService = services.find(s => s.id === formData.service);

    // الحد الأدنى للتاريخ (اليوم)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-3">احجز موعد استشارة</h1>
                    <p className="text-xl text-gray-600">اختر الوقت المناسب لك وسنتواصل معك</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                            {/* Service Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    اختر نوع الخدمة <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {services.map((service) => (
                                        <label
                                            key={service.id}
                                            className={`relative flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.service === service.id
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="service"
                                                value={service.id}
                                                checked={formData.service === service.id}
                                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                className="sr-only"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{service.name}</h4>
                                                <p className="text-sm text-gray-600">{service.duration}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-2xl font-bold text-primary-600">{service.price} ج.م</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiUser className="inline ml-1" />
                                        الاسم الكامل <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiMail className="inline ml-1" />
                                        البريد الإلكتروني <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiPhone className="inline ml-1" />
                                        رقم الهاتف <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input w-full"
                                        placeholder="+20 123 456 7890"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiCalendar className="inline ml-1" />
                                        التاريخ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={today}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiClock className="inline ml-1" />
                                        الوقت <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="input w-full"
                                        required
                                    >
                                        <option value="">اختر الوقت</option>
                                        {availableTimes.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Meeting Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    نوع الموعد <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.type === 'online'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="online"
                                            checked={formData.type === 'online'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="sr-only"
                                        />
                                        <FiVideo className="text-2xl text-primary-600" />
                                        <div>
                                            <p className="font-medium">عبر الإنترنت</p>
                                            <p className="text-xs text-gray-500">Zoom/Google Meet</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.type === 'inperson'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="inperson"
                                            checked={formData.type === 'inperson'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="sr-only"
                                        />
                                        <FiMapPin className="text-2xl text-primary-600" />
                                        <div>
                                            <p className="font-medium">شخصياً</p>
                                            <p className="text-xs text-gray-500">في المكتب</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiMessageSquare className="inline ml-1" />
                                    ملاحظات إضافية
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input w-full"
                                    rows={4}
                                    placeholder="أخبرنا بالمزيد عن احتياجاتك..."
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary text-lg py-4"
                            >
                                {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
                            </button>
                        </form>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>

                            {selectedService ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-primary-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">الخدمة</p>
                                        <p className="font-bold">{selectedService.name}</p>
                                        <p className="text-sm text-gray-500">{selectedService.duration}</p>
                                    </div>

                                    {formData.date && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                                            <p className="font-bold">
                                                {new Date(formData.date).toLocaleDateString('ar-EG', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {formData.time && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">الوقت</p>
                                            <p className="font-bold">{formData.time}</p>
                                        </div>
                                    )}

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">النوع</p>
                                        <p className="font-bold">
                                            {formData.type === 'online' ? 'عبر الإنترنت' : 'شخصياً'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">السعر</span>
                                            <span className="text-2xl font-bold text-primary-600">
                                                {selectedService.price} ج.م
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    اختر خدمة لعرض التفاصيل
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
