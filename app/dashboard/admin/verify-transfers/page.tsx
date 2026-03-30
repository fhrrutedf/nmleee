'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';

export default function RedirectToFinancialCenter() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/admin/orders');
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white p-6 text-center text-sm font-bold">
            <FiLoader size={48} className="animate-spin text-emerald-500 mb-6" />
            <h1 className="text-xl">جاري دمج نظام الربط الذكي...</h1>
            <p className="text-gray-500">تم نقل "مطابقة الحوالات" لتكون أداة مباشرة داخل المركز المالي.</p>
        </div>
    );
}
