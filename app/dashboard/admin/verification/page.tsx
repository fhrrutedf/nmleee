'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiEye, FiUser, FiCalendar, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';

interface VerificationRequest {
    id: string;
    documentUrl: string;
    documentType: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
    };
}

export default function AdminVerificationPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }
        fetchRequests();
    }, [session]);

    const fetchRequests = async () => {
        try {
            const data = await apiGet('/api/admin/verification');
            setRequests(data.requests);
        } catch (error) {
            toast.error('فشل تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessing(id);
        try {
            await apiPut('/api/admin/verification', {
                requestId: id,
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : undefined
            });
            toast.success(status === 'APPROVED' ? 'تم توثيق الحساب بنجاح! ✅' : 'تم رفض الطلب');
            setRequests(requests.filter(r => r.id !== id));
            setShowRejectionModal(null);
            setRejectionReason('');
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-10 text-center ">جاري تحميل طلبات التوثيق...</div>;

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-600 dark:text-white">طلبات توثيق الحساب</h1>
                    <p className="text-text-muted mt-1">مراجعة هوية البائعين لمنح الشارة الزرقاء (Trust Badge)</p>
                </div>
                <div className="bg-emerald-700/10 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-600/20">
                    {requests.length} طلب معلق
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="card bg-white dark:bg-card-white p-20 text-center rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-emerald-600 dark:text-white">لا توجد طلبات معلقة حالياً</h3>
                    <p className="text-text-muted">كل شيء تحت السيطرة!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <div key={request.id} className="card bg-white dark:bg-card-white rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg shadow-emerald-600/20 transition-all group">
                            {/* Document Preview */}
                            <div className="h-48 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                <img 
                                    src={request.documentUrl} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                    alt="Document" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a href={request.documentUrl} target="_blank" className="btn btn-primary bg-white text-emerald-600 hover:bg-white/90">
                                        <FiEye /> عرض كامل
                                    </a>
                                </div>
                                <div className="absolute top-4 right-4 bg-black/60  text-white text-[10px] font-bold px-3 py-1 rounded-xl uppercase tracking-tighter">
                                    {request.documentType.replace('_', ' ')}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-600/20">
                                        {request.user.avatar ? <img src={request.user.avatar} className="w-full h-full object-cover rounded-xl" /> : request.user.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-emerald-600 dark:text-white truncate">{request.user.name}</h3>
                                        <p className="text-xs text-text-muted truncate">{request.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <div className="flex items-center gap-1">
                                        <FiCalendar /> {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiFileText /> طلب رقم #{request.id.slice(-4)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button 
                                        onClick={() => handleAction(request.id, 'APPROVED')}
                                        disabled={!!processing}
                                        className="btn bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl shadow-lg shadow-emerald-600/20 shadow-green-200 dark:shadow-none"
                                    >
                                        {processing === request.id ? 'جاري...' : 'قبول'}
                                    </button>
                                    <button 
                                        onClick={() => setShowRejectionModal(request.id)}
                                        disabled={!!processing}
                                        className="btn bg-red-50 text-red-600 border-red-100 hover:bg-red-100 py-3 rounded-xl"
                                    >
                                        رفض
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  ">
                    <div className="bg-white dark:bg-card-white rounded-xl p-8 max-w-md w-full shadow-lg shadow-emerald-600/20 space-y-6">
                        <div className="flex items-center gap-3 text-red-500">
                            <FiAlertCircle className="text-2xl" />
                            <h3 className="text-xl font-bold">سبب رفض التوثيق</h3>
                        </div>
                        <p className="text-sm text-text-muted">يرجى كتابة سبب واضح ليتمكن المستخدم من تعديله (مثلاً: الصورة غير واضحة، الوثيقة منتهية الصلاحية).</p>
                        <textarea 
                            className="input min-h-[120px]" 
                            placeholder="اكتب السبب هنا..." 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleAction(showRejectionModal, 'REJECTED')}
                                disabled={!rejectionReason || !!processing}
                                className="btn bg-red-600 text-white flex-1 py-4"
                            >
                                تأكيد الرفض
                            </button>
                            <button 
                                onClick={() => setShowRejectionModal(null)} 
                                className="btn bg-gray-100 text-gray-600 flex-1 py-4"
                            >
                                تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
