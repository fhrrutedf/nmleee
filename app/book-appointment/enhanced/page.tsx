'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiUser, FiMail, FiPhone, FiMessageSquare, FiDollarSign, FiCheck } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function EnhancedBookAppointmentPage() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get('seller') || '';
  
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    type: 'online',
    notes: '',
    service: '',
    customField1: '',
    customField2: ''
  });

  const services = [
    { id: 'consultation', name: 'استشارة عامة', duration: 30, price: 50 },
    { id: 'training', name: 'جلسة تدريبية', duration: 60, price: 100 },
    { id: 'workshop', name: 'ورشة عمل', duration: 120, price: 250 }
  ];

  const timezones = [
    { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
    { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
    { value: 'Africa/Cairo', label: 'القاهرة (GMT+2)' },
    { value: 'Europe/Istanbul', label: 'إسطنبول (GMT+3)' },
  ];

  // Fetch available slots when date changes
  useEffect(() => {
    if (!formData.date || !sellerId || !formData.service) return;
    
    const fetchSlots = async () => {
      setFetchingSlots(true);
      try {
        const service = services.find(s => s.id === formData.service);
        const res = await fetch(
          `/api/appointments/slots?userId=${sellerId}&date=${formData.date}&duration=${service?.duration || 30}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setFetchingSlots(false);
      }
    };
    
    fetchSlots();
  }, [formData.date, formData.service, sellerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.service) {
      showToast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const service = services.find(s => s.id === formData.service);
      
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellerId,
          duration: service?.duration || 30,
          price: service?.price || 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast.success('تم حجز الموعد بنجاح!');
        
        // If paid service, redirect to checkout
        if (service && service.price > 0) {
          window.location.href = `/checkout?type=appointment&id=${data.appointment.id}`;
        }
      } else {
        const error = await res.json();
        showToast.error(error.error || 'فشل حجز الموعد');
      }
    } catch (error) {
      showToast.error('حدث خطأ في حجز الموعد');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#111111] rounded-2xl border border-white/10 p-8 shadow-lg shadow-[#10B981]/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">حجز موعد</h1>
            <p className="text-gray-400">اختر الوقت المناسب لك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                <FiDollarSign className="inline ml-2" />
                نوع الخدمة
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, service: service.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-right ${
                      formData.service === service.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <p className="font-bold text-white">{service.name}</p>
                    <p className="text-sm text-gray-400">{service.duration} دقيقة</p>
                    <p className="text-emerald-400 font-bold mt-1">{service.price}$</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                <FiCalendar className="inline ml-2" />
                التاريخ
              </label>
              <input
                type="date"
                min={today}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
              />
            </div>

            {/* Time Slots */}
            {formData.date && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  <FiClock className="inline ml-2" />
                  الوقت المتاح
                </label>
                {fetchingSlots ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot.time })}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                          formData.time === slot.time
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#0A0A0A] text-gray-300 hover:bg-emerald-500/20'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد أوقات متاحة هذا اليوم</p>
                )}
              </div>
            )}

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                <FiVideo className="inline ml-2" />
                نوع الاجتماع
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'online' })}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    formData.type === 'online'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 text-gray-400'
                  }`}
                >
                  <FiVideo className="inline ml-2" />
                  اونلاين
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'offline' })}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    formData.type === 'offline'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 text-gray-400'
                  }`}
                >
                  <FiMapPin className="inline ml-2" />
                  حضوري
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  <FiUser className="inline ml-2" />
                  الاسم *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  <FiMail className="inline ml-2" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                <FiPhone className="inline ml-2" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Custom Fields */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-gray-300 mb-4">معلومات إضافية</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">مجال الاهتمام</label>
                  <input
                    type="text"
                    placeholder="مثال: تطوير الأعمال"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    value={formData.customField1}
                    onChange={(e) => setFormData({ ...formData, customField1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">المستوى الحالي</label>
                  <select
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    value={formData.customField2}
                    onChange={(e) => setFormData({ ...formData, customField2: e.target.value })}
                  >
                    <option value="">اختر المستوى</option>
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                <FiMessageSquare className="inline ml-2" />
                ملاحظات
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="أي ملاحظات أو تفاصيل إضافية..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formData.time}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  جاري الحجز...
                </>
              ) : (
                <>
                  <FiCheck />
                  تأكيد الحجز
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
