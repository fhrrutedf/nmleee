'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';

export default function BrandRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to settings with the brand tab active
        router.replace('/dashboard/settings?tab=brand');
    }, [router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <FiRefreshCw className="text-4xl text-[#10B981] animate-spin" />
            <p className="text-gray-500 font-bold">جاري الانتقال إلى إعدادات الهوية البصرية...</p>
        </div>
    );
}
