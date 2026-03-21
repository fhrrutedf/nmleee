'use client';

import { useSession, signOut } from 'next-auth/react';
import { FiAlertTriangle, FiLogOut, FiUser } from 'react-icons/fi';

export default function ImpersonationBanner() {
    const { data: session } = useSession();
    const user = session?.user as any;

    if (!user?.isImpersonating) return null;

    return (
        <div className="bg-red-600 text-white py-2 px-4 sticky top-0 z-[100] shadow-lg animate-pulse-slow">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm md:text-base font-bold">
                    <FiAlertTriangle className="animate-bounce" />
                    <span>
                        أنت تتصفح كـ <span className="underline">{user.name}</span> (انتحال شخصية)
                    </span>
                    <span className="hidden md:inline opacity-75 text-xs">
                        — الأدمن: {user.originalAdminName || 'مسؤول'}
                    </span>
                </div>
                
                <button
                    onClick={() => signOut({ callbackUrl: '/dashboard/admin/users' })}
                    className="flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-black hover:bg-red-50 transition-colors uppercase tracking-tight"
                >
                    <FiLogOut size={14} />
                    إنهاء الجلسة
                </button>
            </div>
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
