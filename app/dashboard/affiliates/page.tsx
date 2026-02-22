'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiLink, FiUsers, FiDollarSign, FiActivity, FiCopy, FiTrash2, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import showToast from '@/lib/toast';
import { useSession } from 'next-auth/react';

export default function AffiliatesPage() {
    const { data: session } = useSession();
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        productId: '',
        commissionType: 'percentage', // percentage | fixed
        commissionValue: '',
    });

    useEffect(() => {
        if (session) {
            fetchAffiliatesData();
        }
    }, [session]);

    const fetchAffiliatesData = async () => {
        try {
            const res = await fetch('/api/affiliates');
            if (res.ok) {
                const data = await res.json();
                setAffiliates(data.affiliateLinks || []);
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error("حدث خطأ أثناء تحميل بيانات المسوقين");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = showToast.loading('جاري إضافة مسوق جديد...');

        try {
            const response = await fetch('/api/affiliates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم إنشاء الرابط وإضافة المسوق بنجاح!');
                setShowModal(false);
                fetchAffiliatesData();
                setFormData({ email: '', productId: '', commissionType: 'percentage', commissionValue: '' });
            } else {
                const err = await response.json();
                throw new Error(err.error || 'فشل إضافة المسوق');
            }
        } catch (error: any) {
            console.error('Error creating affiliate link:', error);
            showToast.dismiss(toastId);
            showToast.error(error.message || 'المسوق غير موجود أو حدث خطأ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد أنك تريد إيقاف ورشة مسح رابط هذا المسوق بشكل نهائي؟')) return;

        try {
            const res = await fetch(`/api/affiliates/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast.success('تم حذف رابط التسويق!');
                fetchAffiliatesData();
            } else {
                showToast.error('حدث خطأ أثناء محاولة الحذف');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/affiliates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                showToast.success(`تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} رابط المسوق بنجاح`);
                fetchAffiliatesData();
            } else {
                showToast.error("حدث خطأ أثناء تعديل الحالة");
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const copyToClipboard = async (code: string) => {
        const prodUrl = `${window.location.origin}/browse?ref=${code}`; // Note: Depending on your routing, update this URL format!
        try {
            await navigator.clipboard.writeText(prodUrl);
            showToast.success('تم نسخ الرابط! يمكنك مشاركته مع المسوق');
        } catch (err) {
            showToast.error('فشل النسخ تلقائياً');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-charcoal border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                        <FiUsers className="text-action-blue" /> نظام التسويق بالعمولة
                    </h1>
                    <p className="text-text-muted mt-2 font-medium">حوّل عملائك إلى مسوقين لمنتجاتك وضاعف أرباحك بطريقة ذكية.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn bg-action-blue hover:bg-blue-600 text-white flex items-center gap-2 shadow-lg shadow-action-blue/20 hover:-translate-y-1 transition-transform"
                >
                    <FiPlus />
                    <span>إضافة مسوق جديد</span>
                </button>
            </div>

            {/* Global Stats Overview (optional based on existing data) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
                        <FiUsers size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold mb-1">عدد المسوقين النشطين</p>
                        <h4 className="text-3xl font-black text-primary-charcoal dark:text-white">{affiliates.filter(a => a.isActive).length}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">
                        <FiActivity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold mb-1">إجمالي المبيعات المحققة</p>
                        <h4 className="text-3xl font-black text-primary-charcoal dark:text-white">{affiliates.reduce((acc, curr) => acc + curr.salesCount, 0)}</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FiDollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-bold mb-1">إجمالي العمولات المدفوعة</p>
                        <h4 className="text-3xl font-black text-primary-charcoal dark:text-white">{affiliates.reduce((acc, curr) => acc + curr.commission, 0)} <span className="text-sm">ج.م</span></h4>
                    </div>
                </div>
            </div>

            {/* Affiliates List */}
            {affiliates.length === 0 ? (
                <div className="bg-white dark:bg-card-white rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiLink className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">لا يوجد مسوقين مضافين حالياً</h3>
                    <p className="text-text-muted mb-6 max-w-md mx-auto">شارك أرباحك مع أشخاص آخرين وضع نظام تسويق بالعمولة لجلب المزيد من الزوار لمنتجاتك.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المسوق الرائع</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">المنتج المروج</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">العمولة المتفق عليها</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">إحصائيات (نقرات/مبيعات)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                                    <th className="px-6 py-4 text-xs font-bold text-center text-gray-500 uppercase">إجراءات وروابط</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {affiliates.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-action-blue rounded-full flex items-center justify-center font-bold">
                                                    {link.user?.name?.charAt(0) || <FiUsers />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{link.user?.name || "مستخدم غير معرف"}</p>
                                                    <p className="text-xs text-gray-500">{link.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                                {link.product?.title || link.course?.title || "منتج محذوف"}
                                            </p>
                                            <span className="text-xs text-gray-400 font-mono mt-1 block">CODE: {link.code}</span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 font-black text-green-600 bg-green-50 dark:bg-green-900/10 px-3 py-1 rounded-lg border border-green-100 dark:border-transparent">
                                                {link.commissionType === 'percentage' ? `${link.commissionValue}% نسبة` : `${link.commissionValue} ج.م ثابت`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-4 font-medium">
                                                <div title="عدد الزيارات للرابط" className="flex items-center tracking-wider"><FiActivity className="ml-1 text-blue-500" /> {link.clicks}</div>
                                                <div title="عدد المبيعات" className="flex items-center text-primary-charcoal dark:text-white font-bold"><FiCheckCircle className="ml-1 text-green-500" /> {link.salesCount}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStatus(link.id, link.isActive)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${link.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-500 dark:bg-red-900/20'}`}
                                                title="اضغط للتفعيل أو التعطيل"
                                            >
                                                <span className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {link.isActive ? 'نشط ويعمل' : 'مُعطل مؤقتاً'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(link.code)}
                                                    className="p-2 text-action-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-xl transition-colors"
                                                    title="نسخ الرابط لمشاركته مع المسوق"
                                                >
                                                    <FiCopy size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 rounded-xl transition-colors"
                                                    title="حذف نهائي"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-card-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all">
                        <div className="sticky top-0 bg-white dark:bg-card-white p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                                <FiLink className="text-action-blue" /> تكليف مسوق جديد
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                                <FiTrash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLink} className="p-6 space-y-6">
                            {products.length === 0 ? (
                                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                    <FiAlertCircle className="mx-auto text-2xl text-yellow-500 mb-2" />
                                    <p className="font-bold text-yellow-700 dark:text-yellow-500">لا يوجد لديك منتجات نشطة حالياً لإعطائها للمسوقين!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <label className="label font-bold text-gray-700 dark:text-gray-300">البريد الإلكتروني للمسوق <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            className="input text-left"
                                            dir="ltr"
                                            placeholder="marketer@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">يجب أن يكون المسوق لديه حساب في المنصة مسبقاً.</p>
                                    </div>

                                    <div>
                                        <label className="label font-bold text-gray-700 dark:text-gray-300">المنتج المُستهدف <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className="input"
                                            value={formData.productId}
                                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        >
                                            <option value="">-- اختر المنتج من قائمتك --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.title} (سعر: {p.price} ج.م)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label font-bold text-gray-700 dark:text-gray-300">نوع العمولة <span className="text-red-500">*</span></label>
                                            <select
                                                className="input"
                                                value={formData.commissionType}
                                                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                                            >
                                                <option value="percentage">نسبة مئوية من المبيعة (%)</option>
                                                <option value="fixed">مبلغ ثابت عن كل مبيعة (ج.م)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label font-bold text-gray-700 dark:text-gray-300">قيمة العمولة <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    step={formData.commissionType === 'percentage' ? "1" : "0.01"}
                                                    max={formData.commissionType === 'percentage' ? "100" : undefined}
                                                    className="input pr-10"
                                                    placeholder="مثال: 50"
                                                    value={formData.commissionValue}
                                                    onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 font-bold text-gray-400">
                                                    {formData.commissionType === 'percentage' ? '%' : 'ج'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline border-transparent bg-gray-100 dark:bg-gray-800 px-6 font-bold shadow-sm">إلغاء الأمر</button>
                                <button type="submit" disabled={products.length === 0} className="btn btn-primary px-8 font-bold shadow-xl shadow-action-blue/20 flex items-center gap-2 text-lg">
                                    <FiCheckCircle /> <span>إنشاء وحفظ</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
