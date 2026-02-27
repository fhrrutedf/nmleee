'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTag, FiCalendar, FiUsers, FiClock, FiTrash2, FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import showToast from '@/lib/toast';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage', // percentage | fixed
        value: '',
        usageLimit: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = showToast.loading('جاري إنشاء الكوبون...');

        try {
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم إنشاء الكوبون بنجاح!');
                setShowModal(false);
                fetchCoupons();
                // reset form
                setFormData({
                    code: '', type: 'percentage', value: '', usageLimit: '', minPurchase: '',
                    maxDiscount: '', startDate: '', endDate: '', isActive: true
                });
            } else {
                const err = await response.json();
                throw new Error(err.error || 'فشل إنشاء الكوبون');
            }
        } catch (error: any) {
            console.error('Error creating coupon:', error);
            showToast.dismiss(toastId);
            showToast.error(error.message || 'حدث خطأ أثناء الإنشاء');
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (deletingId !== id) {
            setDeletingId(id);
            return; // First click: show confirmation UI
        }
        // Second click: actual delete
        setDeletingId(null);
        try {
            const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast.success('تم حذف الكوبون!');
                fetchCoupons();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showToast.error('خطأ في عملية الحذف');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean, code: string) => {
        try {
            const res = await fetch(`/api/coupons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                showToast.success(`تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} الكوبون ${code}`);
                fetchCoupons();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">الكوبونات والخصومات</h1>
                    <p className="text-text-muted mt-1 font-medium">أنشئ أكواد خصم وعروض لمضاعفة مبيعاتك.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary flex items-center gap-2 shadow-lg shadow-action-blue/20 hover:-translate-y-1 transition-transform"
                >
                    <FiPlus />
                    <span>إنشاء كوبون جديد</span>
                </button>
            </div>

            {/* Coupons List */}
            {coupons.length === 0 ? (
                <div className="bg-white dark:bg-card-white rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiTag className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا توجد كوبونات فعالة!</h3>
                    <p className="text-text-muted mb-6 max-w-md mx-auto">الكوبونات هي طريقة ممتازة لتحفيز عملائك على الشراء فوراً وزيادة مبيعاتك وأرباحك.</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary px-8">
                        أضف أول كوبون
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className={`bg-white dark:bg-card-white rounded-2xl border ${coupon.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-70'} shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative`}>
                            {/* Top Accent */}
                            <div className={`h-2 w-full ${coupon.isActive ? 'bg-gradient-to-r from-action-blue to-purple-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <h3 className="text-xl font-black text-primary-charcoal dark:text-gray-200 tracking-wider font-mono">{coupon.code}</h3>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(coupon.id, coupon.isActive, coupon.code)}
                                        className={`text-xs font-bold px-3 py-1 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}
                                    >
                                        {coupon.isActive ? 'فعال' : 'معطل'}
                                    </button>
                                </div>

                                <div className="text-3xl font-black text-action-blue dark:text-blue-400 mb-6 drop-shadow-sm">
                                    {coupon.type === 'percentage' ? `${coupon.value}% خصم` : `${coupon.value} ج.م خصم`}
                                </div>

                                <div className="space-y-3 font-medium text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <FiUsers className="text-gray-400" />
                                        <span>الاستخدامات المسموحة: {coupon.usageLimit ? `${coupon.usageCount} / ${coupon.usageLimit}` : `${coupon.usageCount} (غير محدود)`}</span>
                                    </div>

                                    {(coupon.startDate || coupon.endDate) && (
                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="text-gray-400" />
                                            <span className={(coupon.endDate && new Date(coupon.endDate) < new Date()) ? 'text-red-500 font-bold' : ''}>
                                                صالح حتى: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('ar-EG') : 'مدى الحياة'}
                                            </span>
                                        </div>
                                    )}

                                    {coupon.minPurchase > 0 && (
                                        <div className="flex items-center gap-2">
                                            <FiTag className="text-gray-400" />
                                            <span>حد أدنى للطلب: {coupon.minPurchase} ج.م</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-800">
                                {deletingId === coupon.id ? (
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                                            <FiAlertTriangle />
                                            تأكيد الحذف؟
                                        </span>
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id, coupon.code)}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-bold flex items-center gap-1"
                                        >
                                            <FiTrash2 size={12} /> حذف نهائياً
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(coupon.id, coupon.code)}
                                            className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors flex items-center justify-center"
                                            title="حذف الكوبون"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-card-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
                        <div className="sticky top-0 bg-white dark:bg-card-white p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiTag className="text-action-blue" /> إضافة كوبون خصم جديد
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label font-bold text-gray-700 dark:text-gray-300">كود الخصم (لغة انجليزية) <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="input uppercase tracking-wider font-mono text-lg"
                                        placeholder="مثال: SALE50 أو VIP2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                                    />
                                </div>

                                <div>
                                    <label className="label font-bold text-gray-700 dark:text-gray-300">نوع الخصم <span className="text-red-500">*</span></label>
                                    <select
                                        className="input"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ج.م)</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="label font-bold text-gray-700 dark:text-gray-300">قيمة الخصم <span className="text-red-500">*</span></label>
                                    <div className="relative border border-action-blue/20 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-action-blue/30 transition-shadow bg-blue-50/30 dark:bg-blue-900/10">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step={formData.type === 'percentage' ? "1" : "0.01"}
                                            max={formData.type === 'percentage' ? "100" : undefined}
                                            className="w-full bg-transparent p-4 text-xl font-bold pr-16 outline-none"
                                            placeholder={formData.type === 'percentage' ? "مثال: 20" : "مثال: 150"}
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        />
                                        <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center font-bold text-action-blue text-xl border-l border-action-blue/20 bg-action-blue/5">
                                            {formData.type === 'percentage' ? '%' : 'ج.م'}
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Options Toggle could be added here, currently displaying directly */}
                                <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><FiClock className="text-action-blue" /> الإعدادات والقيود المتطورة (اختياري)</h4>
                                </div>

                                <div>
                                    <label className="label text-gray-700 dark:text-gray-300">حد استخدام الكوبون (إجمالي)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="input"
                                        placeholder="مثال: يخصم لأول 50 عميل"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">اتركه فارغاً للاستخدام غير المحدود</p>
                                </div>

                                <div>
                                    <label className="label text-gray-700 dark:text-gray-300">الحد الأدنى للطب (ج.م)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input"
                                        placeholder="يُطبق فقط لو تخطت السلة هذا المبلغ"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                    />
                                </div>

                                {formData.type === 'percentage' && (
                                    <div className="md:col-span-2">
                                        <label className="label text-gray-700 dark:text-gray-300">الحد الأقصى للخصم (ج.م)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="input"
                                            placeholder="الحماية من الخصومات الكبيرة جداً للحزم (مثال: 500 ج.م كحد أقصى)"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="label text-gray-700 dark:text-gray-300">تاريخ بدء الخصم</label>
                                    <input
                                        type="datetime-local"
                                        className="input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label text-gray-700 dark:text-gray-300">تاريخ انتهاء الخصم</label>
                                    <input
                                        type="datetime-local"
                                        className="input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline border-transparent bg-gray-100 dark:bg-gray-800 px-6 font-bold shadow-sm">إلغاء</button>
                                <button type="submit" className="btn btn-primary px-8 font-bold shadow-xl shadow-action-blue/20 flex items-center gap-2 text-lg">
                                    <FiCheckCircle /> <span>اعتماد الكوبون وحفظه</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
