'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiHome, FiShoppingBag, FiVideo, FiCalendar, FiDollarSign,
    FiSettings, FiLogOut, FiMenu, FiX, FiTag, FiLink2,
    FiTrendingUp, FiCreditCard, FiExternalLink, FiGlobe, FiActivity
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-light">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-action-blue border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-primary-charcoal font-medium">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const menuItems = [
        { href: '/dashboard', icon: FiHome, label: 'الرئيسية', exact: true },
        { href: '/dashboard/products', icon: FiShoppingBag, label: 'المنتجات الرقمية' },
        { href: '/dashboard/courses', icon: FiVideo, label: 'الدورات التدريبية' },
        { href: '/dashboard/appointments', icon: FiCalendar, label: 'المواعيد' },
        { href: '/dashboard/earnings', icon: FiDollarSign, label: 'الأرباح والسحوبات' },
        { href: '/dashboard/orders', icon: FiTrendingUp, label: 'الطلبات' },
        { href: '/dashboard/coupons', icon: FiTag, label: 'الكوبونات' },
        { href: '/dashboard/affiliates', icon: FiLink2, label: 'التسويق بالعمولة' },
        { href: '/dashboard/integrations', icon: FiActivity, label: 'التكاملات' },
        { href: '/dashboard/billing', icon: FiCreditCard, label: 'الاشتراك والباقة' },
        { href: '/dashboard/settings', icon: FiSettings, label: 'الإعدادات' },
    ];

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-light transition-colors duration-300">
            {/* Mobile Menu Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full bg-card-white dark:bg-card-white shadow-xl z-50 w-64 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-action-blue to-purple-600 bg-clip-text text-transparent">تقانة</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-primary-charcoal hover:text-action-blue transition-colors"
                        >
                            <FiX className="text-2xl" />
                        </button>
                    </div>
                    <p className="text-sm text-text-muted mt-2">مرحباً، {session.user?.name}</p>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                    {menuItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href) && item.href !== '/dashboard';
                        const isHome = item.href === '/dashboard' && pathname === '/dashboard';
                        const active = isActive || isHome;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full ${active
                                    ? 'bg-action-blue text-white shadow-md shadow-action-blue/25'
                                    : 'text-primary-charcoal hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-action-blue'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className={`text-lg flex-shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                                <span className="font-semibold text-sm truncate flex-1 text-right">{item.label}</span>
                                {active && (
                                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <Link
                        href="/explore"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-action-blue w-full transition-colors text-sm font-medium"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FiGlobe className="text-lg" />
                        <span>استكشف المتجر</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors text-sm font-medium"
                    >
                        <FiLogOut className="text-lg" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:mr-64 min-h-screen flex flex-col">
                {/* Top Bar */}
                <header className="bg-card-white dark:bg-card-white shadow-sm sticky top-0 z-30 transition-colors duration-300">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-primary-charcoal hover:text-action-blue"
                        >
                            <FiMenu className="text-2xl" />
                        </button>

                        <div className="flex items-center gap-3 mr-auto">
                            <ThemeToggle />
                            <Link
                                href="/explore"
                                className="hidden md:flex items-center gap-2 text-sm text-gray-500 hover:text-action-blue transition-colors font-medium"
                            >
                                <FiGlobe />
                                <span>المتجر</span>
                            </Link>
                            <Link
                                href={`/@${(session.user as any)?.username}`}
                                target="_blank"
                                className="btn btn-outline text-sm flex items-center gap-2 py-2 px-4 rounded-full"
                            >
                                <FiExternalLink />
                                <span>متجري</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
