'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiDollarSign, FiClock, FiCheck, FiTrendingUp } from 'react-icons/fi';

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
    const [balance, setBalance] = useState<Balance | null>(null);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { text: 'معلق', bg: 'bg-yellow-100', color: 'text-yellow-800' },
            available: { text: 'متاح للسحب', bg: 'bg-green-100', color: 'text-green-800' },
            paid_out: { text: 'تم الدفع', bg: 'bg-blue-100', color: 'text-blue-800' },
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">أرباحك</h1>
                    <p className="text-gray-600 mt-2">تتبع أرباحك ومبيعاتك</p>
                </div>

                {/* Balance Cards */}
                <div className="grid gap-6 mb-8 md:grid-cols-3">
                    {/* Pending Balance */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">الأرباح المعلقة</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    ${balance?.pending.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">ستكون متاحة بعد 7 أيام</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <FiClock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Available Balance */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">متاح للسحب</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    ${balance?.available.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">حد أدنى $50 للسحب</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <FiDollarSign className="text-green-600" size={24} />
                            </div>
                        </div>
                        {balance && balance.available >= 50 && (
                            <button
                                onClick={() => router.push('/dashboard/payout/request')}
                                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                طلب سحب
                            </button>
                        )}
                    </div>

                    {/* Total Earnings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">إجمالي الأرباح</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-2">
                                    ${balance?.total.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">منذ البداية</p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <FiTrendingUp className="text-indigo-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings History */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">سجل الأرباح</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلب</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجمالي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العمولة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">صافي الربح</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {earnings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            لا توجد أرباح بعد
                                        </td>
                                    </tr>
                                ) : (
                                    earnings.map((earning) => (
                                        <tr key={earning.orderNumber} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {earning.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {earning.item}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${earning.total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                -${earning.platformFee.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                ${earning.yourEarning.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(earning.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(earning.date).toLocaleDateString('ar-EG')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">📌 معلومات مهمة:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• عمولة المنصة: <strong>10%</strong> من كل عملية بيع</li>
                        <li>• فترة الانتظار: <strong>7 أيام</strong> قبل أن تصبح الأرباح متاحة للسحب</li>
                        <li>• الحد الأدنى للسحب: <strong>$50</strong></li>
                        <li>• طرق السحب: تحويل بنكي، PayPal، أو USDT</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
