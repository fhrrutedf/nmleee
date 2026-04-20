'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiPost, handleApiError } from '@/lib/safe-fetch';

export default function CancelSubscriptionButton({ subscriptionId, isCanceled }: { subscriptionId: string, isCanceled: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm('هل أنت متأكد أنك تريد إيقاف التجديد التلقائي؟ ستظل مستفيداً من الباقة حتى نهاية الفترة الحالية.')) {
            return;
        }

        setLoading(true);
        try {
            const data = await apiPost('/api/stripe/cancel-subscription', { subscriptionId });

            toast.success(data?.message || 'تم إيقاف التجديد التلقائي');
            router.refresh(); // Refresh page to show updated status
        } catch (error) {
            toast.error(handleApiError(error) || 'خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    if (isCanceled) {
        return (
            <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200">
                سينتهي الاشتراك بنهاية الفترة ولن يتجدد.
            </div>
        );
    }

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className={`px-4 py-2 bg-red-500/100/10 text-red-600 rounded-lg text-sm font-medium border border-red-200 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100 hover:text-red-700'}`}
        >
            {loading ? 'جاري التنفيذ...' : 'إيقاف التجديد التلقائي'}
        </button>
    );
}
