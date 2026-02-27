'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiDollarSign, FiClock, FiCheck, FiTrendingUp, FiZap, FiShield, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Balance {
    pending: number;
    available: number;
    total: number;
}

interface Earning {
    orderNumber: string;
    total: number;
    platformFee: number;
    yourEarning: number;
    status: string;
    availableAt: string;
    paidOutAt: string | null;
    date: string;
    item: string;
}

export default function EarningsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [balance, setBalance] = useState<Balance | null>({ pending: 0, available: 0, total: 0 });
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawType, setWithdrawType] = useState<'standard' | 'fast'>('standard');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchData();
    }, [session]);

    const fetchData = async () => {
        try {
            const [balanceRes, earningsRes] = await Promise.all([
                fetch('/api/seller/balance'),
                fetch('/api/seller/earnings'),
            ]);

            if (balanceRes.ok && earningsRes.ok) {
                const balanceData = await balanceRes.json();
                const earningsData = await earningsRes.json();
                setBalance(balanceData);
                setEarnings(earningsData);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawRequest = async () => {
        toast.success(`تم تقديم طلب السحب بنمط: ${withdrawType === 'fast' ? 'السحب السريع 🚀' : 'السحب العادي ⏳'}`);
        setShowWithdrawModal(false);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { text: 'معلق للحماية', bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-700 dark:text-yellow-400', icon: FiShield },
            available: { text: 'متاح للسحب', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-700 dark:text-green-400', icon: FiCheck },
            paid_out: { text: 'تم الدفع', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-700 dark:text-blue-400', icon: FiDollarSign },
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 inline-flex ${badge.bg} ${badge.color}`}>
                <Icon size={14} />
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-primary-charcoal dark:text-white">الأرباح والسحوبات</h1>
                <p className="text-text-muted mt-2 font-medium">تتبع مبيعاتك واطلب سحب أرباحك بطرق متعددة وسريعة</p>
            </div>

            {/* Balance Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Available Balance */}
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-bold text-gray-500">الرصيد المتاح للسحب</p>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center">
                                <FiDollarSign size={24} />
                            </div>
                        </div>
                        <p className="text-4xl sm:text-5xl font-black text-primary-charcoal dark:text-white mb-2 tracking-tight">
                            {balance?.available.toFixed(2) || '0.00'} <span className="text-xl sm:text-2xl text-gray-400">ج.م</span>
                        </p>

                        {balance && balance.available >= 50 ? (
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="mt-6 w-full py-4 bg-primary-charcoal hover:bg-black dark:bg-action-blue dark:hover:bg-blue-600 text-white rounded-2xl transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <FiDollarSign /> طلب سحب الأموال
                            </button>
                        ) : (
                            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-bg-light p-3 rounded-xl border border-gray-100 dark:border-gray-800 font-medium">
                                <FiAlertCircle className="text-orange-500" />
                                الحد الأدنى للسحب هو 50 ج.م
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Balance */}
                <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-bold text-gray-500">أرباح معلقة (فترة الحماية)</p>
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-2xl flex items-center justify-center">
                                <FiShield size={24} />
                            </div>
                        </div>
                        <p className="text-4xl sm:text-5xl font-black text-primary-charcoal dark:text-white mb-2 tracking-tight">
                            {balance?.pending.toFixed(2) || '0.00'} <span className="text-xl sm:text-2xl text-gray-400">ج.م</span>
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-bg-light p-3 rounded-xl border border-gray-100 dark:border-gray-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            <FiClock className="text-yellow-500 shrink-0" />
                            الأرباح تصبح متاحة بعد 7-14 يوم
                        </div>
                    </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-action-blue to-purple-600 text-white rounded-3xl shadow-lg p-8 relative overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-bold text-white/80">إجمالي الأرباح منذ التسجيل</p>
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center">
                                <FiTrendingUp size={24} />
                            </div>
                        </div>
                        <p className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                            {balance?.total.toFixed(2) || '0.00'} <span className="text-xl sm:text-2xl text-white/50">ج.م</span>
                        </p>
                        <p className="mt-6 flex items-center gap-2 text-sm text-white/80 bg-black/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 font-medium">
                            استمر في الإبداع والبيع! 🚀
                        </p>
                    </div>
                </div>
            </div>

            {/* Earnings History */}
            <div className="bg-white dark:bg-card-white rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">سجل المعاملات والأرباح</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المنتج المُباع</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الإجمالي</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">العمولة</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">صافي ربحك</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {earnings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <FiDollarSign size={24} />
                                        </div>
                                        لا توجد أرباح بعد، ابدأ في خطتك التسويقية الآن!
                                    </td>
                                </tr>
                            ) : (
                                earnings.map((earning) => (
                                    <tr key={earning.orderNumber} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {earning.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            {earning.item}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {earning.total.toFixed(2)} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                                            -{earning.platformFee.toFixed(2)} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 dark:text-green-500">
                                            +{earning.yourEarning.toFixed(2)} ج.م
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(earning.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {new Date(earning.date).toLocaleDateString('ar-EG')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Options Modal / Area */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-card-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-primary-charcoal dark:text-white">اختر طريقة السحب</h2>
                            <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div
                                onClick={() => setWithdrawType('standard')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${withdrawType === 'standard' ? 'border-primary-charcoal dark:border-action-blue bg-gray-50 dark:bg-action-blue/5' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${withdrawType === 'standard' ? 'bg-primary-charcoal text-white dark:bg-action-blue' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            <FiClock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary-charcoal dark:text-white">سحب عادي (موصى به)</h3>
                                            <p className="text-sm text-gray-500 font-medium mt-1">يصلك المبلغ خلال 3 إلى 5 أيام عمل بشكل طبيعي</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${withdrawType === 'standard' ? 'border-primary-charcoal dark:border-action-blue bg-primary-charcoal dark:bg-action-blue' : 'border-gray-300'}`}>
                                        {withdrawType === 'standard' && <FiCheck className="text-white text-sm" />}
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-4 text-sm font-bold border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <span className="text-green-600">رسوم السحب: 0.00 ج.م</span>
                                </div>
                            </div>

                            <div
                                onClick={() => setWithdrawType('fast')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${withdrawType === 'fast' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-purple-200'
                                    }`}
                            >
                                <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                                    <FiZap /> الأسرع
                                </div>
                                <div className="flex justify-between items-start mb-2 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${withdrawType === 'fast' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            <FiZap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-primary-charcoal dark:text-white">سحب فوري / سريع</h3>
                                            <p className="text-sm text-gray-500 font-medium mt-1">يصلك المبلغ بين 15 دقيقة إلى 48 ساعة كحد أقصى</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${withdrawType === 'fast' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                                        {withdrawType === 'fast' && <FiCheck className="text-white text-sm" />}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 text-sm font-bold border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <span className="text-red-500">رسوم إضافية: 2% من إجمالي المبلغ المسحوب</span>
                                    <span className="text-gray-500 text-xs">مناسب للظروف الطارئة واحتياج سيولة سريعة للحملات الإعلانية!</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
                            <button onClick={() => setShowWithdrawModal(false)} className="btn btn-outline border-transparent bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 py-3 px-6 shadow-sm font-bold">إلغاء</button>
                            <button onClick={handleWithdrawRequest} className={`btn btn-primary py-3 px-8 font-bold text-lg shadow-xl shadow-action-blue/20 hover:-translate-y-1 transition-transform ${withdrawType === 'fast' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30' : ''}`}>
                                تأكيد السحب {withdrawType === 'fast' ? 'السريع' : ''} المتاح
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
