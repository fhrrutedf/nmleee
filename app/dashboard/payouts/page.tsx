'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { apiGet, apiPost, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [requestAmount, setRequestAmount] = useState('');

    useEffect(() => {
        fetchPayouts();
        fetchStats();
    }, []);

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
            toast.error('الحد الأدنى للسحب هو 100 ج.م');
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
                <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-100">إجمالي الأرباح</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.totalEarnings.toFixed(2)} ج.م</div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-100">الرصيد المتاح</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.availableBalance.toFixed(2)} ج.م</div>
                </div>

                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-100">طلبات قيد المراجعة</span>
                        <FiClock className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats.pendingPayouts.toFixed(2)} ج.م</div>
                </div>
            </div>

            {/* Request Payout Form */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">طلب سحب جديد</h2>
                <form onSubmit={handleRequestPayout} className="space-y-4">
                    <div>
                        <label className="label">المبلغ (ج.م)</label>
                        <input
                            type="number"
                            required
                            min="100"
                            step="0.01"
                            className="input"
                            placeholder="الحد الأدنى: 100 ج.م"
                            value={requestAmount}
                            onChange={(e) => setRequestAmount(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            الرصيد المتاح: {stats.availableBalance.toFixed(2)} ج.م
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        طلب السحب
                    </button>
                </form>
            </div>

            {/* Payouts History */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">سجل السحوبات</h2>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
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
                                            {payout.amount.toFixed(2)} ج.م
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(payout.status)}`}>
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
