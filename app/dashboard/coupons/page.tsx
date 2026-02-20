'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCopy, FiCheck } from 'react-icons/fi';
import { apiGet, apiPost, apiDelete, handleApiError } from '@/lib/safe-fetch';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        maxUses: '',
        expiresAt: '',
        minPurchase: '',
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const data = await apiGet('/api/coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiPost('/api/coupons', {
                ...formData,
                value: parseFloat(formData.value),
                maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
            });

            alert('تم إنشاء كوبون الخصم بنجاح! ✅');
            setShowModal(false);
            setFormData({
                code: '',
                type: 'percentage',
                value: '',
                maxUses: '',
                expiresAt: '',
                minPurchase: '',
            });
            fetchCoupons();
        } catch (error) {
            console.error('Error creating coupon:', handleApiError(error));
            alert('فشل إنشاء الكوبون: ' + handleApiError(error));
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

        try {
            await apiDelete(`/api/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', handleApiError(error));
            alert('فشل حذف الكوبون: ' + handleApiError(error));
        }
    };

    const generateCode = () => {
        const code = 'SAVE' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setFormData({ ...formData, code });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const getStatusColor = (coupon: any) => {
        if (!coupon.isActive) return 'bg-gray-100 text-gray-700';
        if (coupon.endDate && new Date(coupon.endDate) < new Date()) return 'bg-red-100 text-red-700';
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 'bg-orange-100 text-orange-700';
        return 'bg-green-100 text-green-700';
    };

    const getStatusText = (coupon: any) => {
        if (!coupon.isActive) return 'غير نشط';
        if (coupon.endDate && new Date(coupon.endDate) < new Date()) return 'منتهي';
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 'مستنفذ';
        return 'نشط';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">كوبونات الخصم</h1>
                    <p className="text-gray-600 mt-1">إنشاء وإدارة كوبونات الخصم</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                >
                    <FiPlus className="inline ml-2" />
                    إضافة كوبون جديد
                </button>
            </div>

            {/* Coupons Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                </div>
            ) : coupons.length === 0 ? (
                <div className="card text-center py-12">
                    <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">لا توجد كوبونات بعد</h3>
                    <p className="text-gray-600 mb-6">ابدأ بإنشاء كوبون خصم الأول</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        إضافة كوبون جديد
                    </button>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-right py-3 px-4">الكود</th>
                                <th className="text-right py-3 px-4">النوع</th>
                                <th className="text-right py-3 px-4">القيمة</th>
                                <th className="text-right py-3 px-4">الاستخدامات</th>
                                <th className="text-right py-3 px-4">تاريخ الانتهاء</th>
                                <th className="text-right py-3 px-4">الحالة</th>
                                <th className="text-right py-3 px-4">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon: any) => (
                                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <code className="px-3 py-1 bg-gray-100 rounded font-mono font-bold">
                                                {coupon.code}
                                            </code>
                                            <button
                                                onClick={() => copyCode(coupon.code)}
                                                className="text-gray-400 hover:text-primary-600"
                                            >
                                                {copiedCode === coupon.code ? <FiCheck className="text-green-600" /> : <FiCopy />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {coupon.type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-primary-600">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ج.م`}
                                    </td>
                                    <td className="py-3 px-4">
                                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                    </td>
                                    <td className="py-3 px-4">
                                        {coupon.endDate
                                            ? new Date(coupon.endDate).toLocaleDateString('ar-EG')
                                            : 'بدون نهاية'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(coupon)}`}>
                                            {getStatusText(coupon)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => deleteCoupon(coupon.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">إنشاء كوبون خصم جديد</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label">كود الكوبون *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        className="input flex-1"
                                        placeholder="SAVE20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="btn btn-outline"
                                    >
                                        توليد تلقائي
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">نوع الخصم *</label>
                                    <select
                                        required
                                        className="input"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">قيمة ثابتة (ج.م)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">قيمة الخصم *</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="input"
                                        placeholder={formData.type === 'percentage' ? '20' : '50'}
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">الحد الأقصى للاستخدامات (اختياري)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="غير محدود"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="label">تاريخ الانتهاء (اختياري)</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">الحد الأدنى للشراء (اختياري)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    placeholder="مثال: 100 ج.م"
                                    value={formData.minPurchase}
                                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    الحد الأدنى للمبلغ المطلوب لاستخدام الكوبون
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4 border-t">
                                <button type="submit" className="btn btn-primary flex-1">
                                    إنشاء الكوبون
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-outline flex-1"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
