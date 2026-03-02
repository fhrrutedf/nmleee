'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    FiHome,
    FiUsers,
    FiPackage,
    FiDollarSign,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiShoppingCart
} from 'react-icons/fi';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        } else if (status === 'authenticated') {
            // Verify admin status from session
            // Optional: you can fetch from /api/user/me if session doesn't have role
            const checkAdminStatus = async () => {
                try {
                    const res = await fetch('/api/user/me');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.user?.role === 'ADMIN') {
                            setIsAdmin(true);
                        } else {
                            setIsAdmin(false);
                            router.replace('/'); // Redirect non-admins to home
                        }
                    }
                } catch (error) {
                    console.error("Failed to verify admin status", error);
                    setIsAdmin(false);
                    router.replace('/');
                }
            };

            // If next-auth session exposes role, use it directly, else fetch
            // checkAdminStatus();

            // Assuming we added role to session callback in Phase 1
            if ((session?.user as any)?.role === 'ADMIN' || session?.user?.email === 'admin@admin.com') { // fallback for test emails
                setIsAdmin(true);
            } else {
                checkAdminStatus(); // Verify explicitly
            }
        }
    }, [status, session, router]);

    if (status === 'loading' || isAdmin === null) {
        return (
            <div className="min-h-[100dvh] bg-bg-light dark:bg-bg-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action-blue"></div>
            </div>
        );
    }

    if (isAdmin === false) {
        return null; // Will redirect in useEffect
    }

    const navLinks = [
        { name: 'الرئيسية', href: '/admin/dashboard', icon: FiHome },
        { name: 'المستخدمين', href: '/admin/dashboard/users', icon: FiUsers },
        { name: 'المنتجات والمحتوى', href: '/admin/dashboard/products', icon: FiPackage },
        { name: 'الطلبات', href: '/admin/dashboard/orders', icon: FiShoppingCart },
        { name: 'المالية والسحوبات', href: '/admin/dashboard/payouts', icon: FiDollarSign },
        { name: 'الإعدادات', href: '/admin/dashboard/settings', icon: FiSettings },
    ];

    return (
        <div className="min-h-[100dvh] bg-gray-50 dark:bg-bg-dark flex flex-col md:flex-row font-sans" dir="rtl">
            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-card-white shadow-sm px-4 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="font-black text-xl text-primary-charcoal dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-action-blue flex items-center justify-center text-white">
                        <FiSettings size={18} />
                    </div>
                    إدارة المنصة
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Desktop Sidebar (always visible) */}
            <aside className="hidden md:flex sticky top-0 right-0 z-40 w-72 h-[100dvh] bg-white dark:bg-card-white border-l border-gray-100 dark:border-gray-800 shadow-none flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white shadow-lg">
                        <FiSettings size={22} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-primary-charcoal dark:text-white leading-none">لوحة الإدارة</h2>
                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Admin Panel</span>
                    </div>
                </div>
                <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${isActive ? 'bg-action-blue text-white shadow-md shadow-action-blue/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary-charcoal dark:hover:text-white'}`}>
                                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-action-blue transition-colors'} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold mb-2 group">
                        <FiHome className="text-gray-400 group-hover:text-action-blue" size={20} />العودة للموقع
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold">
                        <FiLogOut size={20} />تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar (only in DOM when open) */}
            {isSidebarOpen && (
                <aside className="md:hidden fixed top-0 right-0 z-40 w-72 h-[100dvh] bg-white dark:bg-card-white border-l border-gray-100 dark:border-gray-800 shadow-xl flex flex-col">
                    <div className="flex-1 px-4 py-6 overflow-y-auto mt-4 space-y-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                            const Icon = link.icon;
                            return (
                                <Link key={link.href} href={link.href} onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group ${isActive ? 'bg-action-blue text-white shadow-md shadow-action-blue/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary-charcoal dark:hover:text-white'}`}>
                                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-action-blue transition-colors'} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-bold mb-2 group">
                            <FiHome className="text-gray-400 group-hover:text-action-blue" size={20} />العودة للموقع
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold">
                            <FiLogOut size={20} />تسجيل الخروج
                        </button>
                    </div>
                </aside>
            )}

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main Content Area */}

            <main className="flex-1 w-full flex flex-col min-h-[100dvh] relative overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
