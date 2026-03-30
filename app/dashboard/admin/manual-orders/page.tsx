'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';

export default function RedirectToFinancialCenter() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/admin/orders?tab=PENDING_MANUAL');
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white p-6 text-center">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">جاري الانتقال إلى المركز المالي الموحد</h1>
            <p className="text-gray-500">تم دمج هذه الصفحة مع إدارة العمليات المركزية لتسهيل عملك.</p>
        </div>
    );
}
