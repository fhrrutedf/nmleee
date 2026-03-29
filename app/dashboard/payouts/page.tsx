'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';
import { isPayoutMethodConfigured, getPayoutMethodLabel } from '@/lib/payout-utils';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchPayouts();
        fetchStats();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await apiGet('/api/user/profile');
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchPayouts = async () => {
        try {
            const data = await apiGet('/api/payouts');
            setPayouts(data);
        } catch (error) {
            console.error('Error fetching payouts:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await apiGet('/api/payouts/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', handleApiError(error));
        }
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(requestAmount);

        if (amount > stats.availableBalance) {
            toast.error('المبلغ المطلوب أكبر من الرصيد المتاح');
            return;
        }

        if (amount < 100) {
            toast.error('الحد الأدنى للسحب هو 100 $');
            return;
        }

        if (!user || !isPayoutMethodConfigured(user)) {
            toast.error('يُرجى إعداد طريقة سحب مفعلة أولاً من الإعدادات');
            return;
        }

        try {
            await apiPost('/api/payouts', { amount });
            toast.success('تم إرسال طلب السحب بنجاح! سيتم مراجعته قريباً ✅');
            setRequestAmount('');
            fetchPayouts();
            fetchStats();
        } catch (error) {
            console.error('Error requesting payout:', handleApiError(error));
            toast.error('فشل إرسال الطلب: ' + handleApiError(error));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'مكتمل';
            case 'PENDING':
                return 'قيد المراجعة';
            case 'CANCELLED':
                return 'ملغي';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">الأرباح والسحب</h1>
                <p className="text-gray-600 mt-1">إدارة أرباحك وطلبات السحب</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card bg-emerald-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-100">إجمالي الأرباح</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalEarnings.toFixed(2)} $</div>
                </div>

                <div className="card bg-emerald-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-100">الرصيد المتاح</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.availableBalance.toFixed(2)} $</div>
                </div>

                <div className="card bg-emerald-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-100">طلبات قيد المراجعة</span>
                        <FiClock className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.pendingPayouts.toFixed(2)} $</div>
                </div>
            </div>

            {/* Request Payout Form */}
            <div className="card bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-lg shadow-emerald-600/20">
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-600 rounded-xl"></span>
                        طلب سحب جديد
                    </h2>

                    {user && !isPayoutMethodConfigured(user) ? (
                        <div className="bg-emerald-600-50 border border-amber-200 p-6 rounded-xl flex flex-col items-center text-center ">
                            <FiAlertCircle className="text-4xl text-emerald-600-500 mb-3" />
                            <h3 className="font-bold text-blue-900 mb-2">طريقة السحب غير مكتملة</h3>
                            <p className="text-sm text-blue-800 mb-6 max-w-sm">
                                لم يتم إعداد أو تفعيل طريقة سحب حتى الآن. لتتمكن من استلام أرباحك، يرجى إضافة بياناتك البنكية أو وسيلة دفع أخرى.
                            </p>
                            <Link 
                                href="/dashboard/settings?tab=payment" 
                                className="btn btn-primary px-8 flex items-center gap-2"
                            >
                                <span>انتقل للإعدادات</span>
                                <FiChevronLeft />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRequestPayout} className="space-y-6">
                            {user?.payoutMethod && (
                                <div className="p-3 bg-green-50 text-green-800 border border-green-100 rounded-xl text-sm flex items-center gap-2">
                                    <FiCheckCircle className="text-green-500" />
                                    <span>سيتم التحويل عبر: <strong>{getPayoutMethodLabel(user.payoutMethod)}</strong></span>
                                    <Link href="/dashboard/settings?tab=payment" className="mr-auto text-xs text-green-600 underline">تعديل</Link>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="label text-gray-700">المبلغ المطلوب ($)</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        min="100"
                                        step="0.01"
                                        className="input pr-12 text-lg font-bold"
                                        placeholder="الحد الأدنى: 100 $"
                                        value={requestAmount}
                                        onChange={(e) => setRequestAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-sm text-gray-500">
                                        الرصيد المتاح: <span className="font-bold text-gray-900">{stats.availableBalance.toFixed(2)} $</span>
                                    </p>
                                    <button 
                                        type="button" 
                                        onClick={() => setRequestAmount(stats.availableBalance.toString())}
                                        className="text-xs text-emerald-600 hover:underline"
                                    >
                                        سحب الكل
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-emerald-600/20 shadow-accent/20 active:scale-[0.98]">
                                إرسال طلب السحب
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Payouts History */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">سجل السحوبات</h2>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FiDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p>لا توجد طلبات سحب بعد</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-right py-3 px-4">التاريخ</th>
                                    <th className="text-right py-3 px-4">المبلغ</th>
                                    <th className="text-right py-3 px-4">الحالة</th>
                                    <th className="text-right py-3 px-4">تاريخ التحويل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((payout: any) => (
                                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            {new Date(payout.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-3 px-4 font-bold">
                                            {payout.amount.toFixed(2)} $
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-xl text-sm ${getStatusColor(payout.status)}`}>
                                                {payout.status === 'COMPLETED' && <FiCheck className="inline ml-1" />}
                                                {payout.status === 'CANCELLED' && <FiX className="inline ml-1" />}
                                                {payout.status === 'PENDING' && <FiClock className="inline ml-1" />}
                                                {getStatusText(payout.status)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {payout.completedAt
                                                ? new Date(payout.completedAt).toLocaleDateString('ar-EG')
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
