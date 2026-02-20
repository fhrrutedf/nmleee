'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiClock, FiCreditCard, FiAlertCircle } from 'react-icons/fi';

export default function PayoutsClient({ initialPayouts }: { initialPayouts: any[] }) {
    const [payouts, setPayouts] = useState(initialPayouts);
    const [filter, setFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredPayouts = payouts.filter(p => filter === 'ALL' || p.status === filter);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        let reason = '';
        let transactionId = '';

        if (action === 'reject') {
            const input = prompt('أدخل سبب الرفض (سيتم إرساله للبائع):');
            if (input === null) return; // تم الإلغاء
            reason = input;
        } else if (action === 'approve') {
            const input = prompt('أدخل رقم العملية المرجعية للحوالة (Transaction ID) بشكل اختياري:');
            if (input === null) return;
            transactionId = input;
        }

        setProcessingId(id);

        try {
            const res = await fetch(`/api/admin/payouts/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason, transactionId })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(action === 'approve' ? 'تم قبول الطلب وتحويله لحالة مدفوع' : 'تم رفض الطلب واسترجاع الرصيد للبائع');
                // Update local state
                setPayouts(payouts.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            status: action === 'approve' ? 'PAID' : 'REJECTED',
                            rejectionReason: reason || null,
                            transactionId: transactionId || null,
                            paidAt: action === 'approve' ? new Date().toISOString() : null,
                            rejectedAt: action === 'reject' ? new Date().toISOString() : null,
                        };
                    }
                    return p;
                }));
            } else {
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('لم نتمكن من الاتصال بالخادم');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 p-2 gap-2 bg-gray-50 overflow-x-auto">
                {['ALL', 'PENDING', 'PAID', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-white text-action-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                    >
                        {status === 'ALL' ? 'الكل' :
                            status === 'PENDING' ? 'قيد الانتظار' :
                                status === 'PAID' ? 'مكتملة' : 'مرفوضة'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {filteredPayouts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">لا توجد طلبات تطابق الفلتر الحالي</div>
                ) : (
                    filteredPayouts.map(payout => (
                        <div key={payout.id} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-gray-50/50 transition-colors">

                            {/* Seller & Payout Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between lg:justify-start gap-4">
                                    <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 text-action-blue rounded-full flex items-center justify-center text-sm">
                                            {payout.seller?.name?.charAt(0) || '?'}
                                        </div>
                                        {payout.seller?.name || 'بائع محذوف'}
                                    </div>
                                    <span className="text-gray-400 text-sm">{new Date(payout.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <span className="block text-gray-500 mb-1 text-xs">طريقة الدفع</span>
                                        <span className="font-bold text-gray-800">{payout.method || 'غير محدد'}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 md:col-span-3">
                                        <span className="block text-gray-500 mb-1 text-xs">تفاصيل الحساب</span>
                                        <span className="font-medium text-gray-800 break-words">
                                            {payout.method === 'bank' && `حساب: ${payout.seller?.accountNumber || '?'}, بنك: ${payout.seller?.bankName || '?'}`}
                                            {payout.method === 'paypal' && `ايميل: ${payout.seller?.paypalEmail || '?'}`}
                                            {payout.method === 'crypto' && `محفظة: ${payout.seller?.cryptoWallet || '?'}`}
                                            {payout.method === 'shamCashNumber' && `رقم: ${payout.seller?.shamCashNumber || '?'}`}
                                            {/* أضف باقي الطرق حسب الحاجة */}
                                            {(!['bank', 'paypal', 'crypto', 'shamCashNumber'].includes(payout.method)) && `تفاصيل أخرى تجدها في ملف البائع`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount & Actions */}
                            <div className="lg:w-64 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-r border-gray-100 pt-4 lg:pt-0 pl-0 pr-0 lg:pr-6 gap-4">
                                <div className="text-right w-full flex lg:flex-col justify-between items-center lg:items-end">
                                    <span className="block text-gray-500 text-sm mb-1">المبلغ المطلوب</span>
                                    <span className="text-3xl font-black text-green-600">${payout.amount}</span>
                                </div>

                                <div className="w-full">
                                    {payout.status === 'PENDING' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(payout.id, 'approve')}
                                                disabled={processingId === payout.id}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                                            >
                                                {processingId === payout.id ? '...' : <><FiCheck /> دفع</>}
                                            </button>
                                            <button
                                                onClick={() => handleAction(payout.id, 'reject')}
                                                disabled={processingId === payout.id}
                                                className="w-12 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg flex items-center justify-center transition-colors border border-red-200"
                                                title="رفض"
                                            >
                                                {processingId === payout.id ? '...' : <FiX />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`w-full py-2 rounded-lg text-center font-bold text-sm border flex items-center justify-center gap-2
                                            ${payout.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                                payout.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            {payout.status === 'PAID' && <><FiCheck /> تم الدفع</>}
                                            {payout.status === 'REJECTED' && <><FiX /> مرفوض</>}
                                            {payout.status === 'APPROVED' && <><FiClock /> مقبول (بانتظار التحويل)</>}
                                        </div>
                                    )}
                                </div>

                                {/* Rejection reason */}
                                {payout.status === 'REJECTED' && payout.rejectionReason && (
                                    <div className="text-xs text-red-500 text-right w-full bg-red-50 p-2 rounded border border-red-100">
                                        سبب: {payout.rejectionReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
