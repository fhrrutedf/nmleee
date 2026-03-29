'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiHome, FiShoppingBag, FiVideo, FiCalendar, FiDollarSign,
    FiSettings, FiLogOut, FiMenu, FiX, FiTag, FiLink2,
    FiTrendingUp, FiCreditCard, FiExternalLink, FiGlobe, FiActivity, FiUsers, FiPackage, FiZap, FiDroplet,
    FiBriefcase, FiBookOpen, FiMessageSquare, FiShield, FiShoppingCart, FiPieChart
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useViewportHeight } from '@/hooks/useViewportHeight';
import { NotificationListener } from '@/components/NotificationListener';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspace, setWorkspace] = useState<'store' | 'academy'>('store');
    useViewportHeight();

    useEffect(() => {
        if (pathname.startsWith('/dashboard/courses') || pathname.startsWith('/dashboard/students')) {
            setWorkspace('academy');
        } else {
            setWorkspace('store');
        }
    }, [pathname]);

    const handleWorkspaceChange = (newWs: 'store' | 'academy') => {
        setWorkspace(newWs);
        if (newWs === 'academy') {
            router.push('/dashboard/courses');
        } else {
            router.push('/dashboard');
        }
        setSidebarOpen(false);
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?callbackUrl=${callbackUrl}`);
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-accent mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const isAdmin = (session.user as any)?.role === 'ADMIN';

    const allMenuItems = [
        { href: '/dashboard', icon: FiHome, label: 'الرئيسية', exact: true, type: 'store' },
        { href: '/dashboard/products', icon: FiShoppingBag, label: 'المنتجات الرقمية', type: 'store' },
        { href: '/dashboard/bundles', icon: FiPackage, label: 'الباقات والحزم', type: 'store' },
        { href: '/dashboard/orders', icon: FiTrendingUp, label: 'الطلبات والمبيعات', type: 'store' },
        { href: '/dashboard/coupons', icon: FiTag, label: 'أكواد الخصم', type: 'store' },
        { href: '/dashboard/affiliates', icon: FiLink2, label: 'التسويق بالعمولة', type: 'store' },
        { href: '/dashboard/automation', icon: FiZap, label: 'الأتمتة الذكية', type: 'store' },
        { href: '/dashboard/brand', icon: FiDroplet, label: 'الهوية البصرية', type: 'store' },

        { href: '/dashboard/courses', icon: FiVideo, label: 'الدورات التدريبية', type: 'academy' },
        { href: '/dashboard/students', icon: FiUsers, label: 'الطلاب والشهادات', type: 'academy' },
        { href: '/dashboard/courses/qa', icon: FiMessageSquare, label: 'نقاشات الطلاب', type: 'academy' },

        { href: '/dashboard/appointments', icon: FiCalendar, label: 'المواعيد والحجز', type: 'shared' },
        { href: '/dashboard/financials', icon: FiPieChart, label: 'تحليل مالي', type: 'shared' },
        { href: '/dashboard/earnings', icon: FiDollarSign, label: 'السحب والتحصيل', type: 'shared' },
        { href: '/dashboard/integrations', icon: FiActivity, label: 'تطبيقات الربط', type: 'shared' },
        { href: '/dashboard/billing', icon: FiCreditCard, label: 'الباقة الحالية', type: 'shared' },
        { href: '/dashboard/settings', icon: FiSettings, label: 'الإعدادات', type: 'shared' },

        { href: '/dashboard/admin', icon: FiShield, label: 'مركز التحكم الآمن', type: 'admin' },
        { href: '/dashboard/admin/users', icon: FiUsers, label: 'إدارة الأعضاء', type: 'admin' },
        { href: '/dashboard/admin/orders', icon: FiShoppingCart, label: 'إدارة العمليات', type: 'admin' },
        { href: '/dashboard/admin/payouts', icon: FiDollarSign, label: 'المالية المركزية', type: 'admin' },
        { href: '/dashboard/admin/broadcast', icon: FiZap, label: '🚀 البث الجماعي', type: 'admin' },
        { href: '/dashboard/admin/platform-settings', icon: FiSettings, label: 'إعدادات المنصة', type: 'admin' },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.type === workspace || item.type === 'shared' || (item.type === 'admin' && isAdmin)
    );

    return (
        <div className="min-h-screen bg-white transition-colors duration-300 relative selection:bg-accent/20">
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-ink/60  z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar - Institutional Grade */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-ink text-white flex items-center justify-center font-black text-sm">ت</div>
                                    <span className="font-black text-ink">تمالين</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
                                {menuItems.map((item) => {
                                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/dashboard';
                                    const isHome = item.href === '/dashboard' && pathname === '/dashboard';
                                    const active = isActive || isHome;
                                    return (
                                        <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group w-full ${active ? 'bg-ink text-white shadow-lg shadow-ink/20' : 'text-gray-400 hover:bg-gray-50 hover:text-ink'}`}>
                                            <item.icon size={18} className={`${active ? 'text-accent' : 'group-hover:text-ink'}`} />
                                            <span className="text-xs font-black tracking-tight flex-1 text-right">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-2">
                                <Link href="/explore" className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <FiGlobe size={16}/> <span>Marketplace</span>
                                </Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-5 py-3 text-[10px] font-black text-red-400 uppercase tracking-widest">
                                    <FiLogOut size={16}/> <span>End Session</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar - Institutional Grade */}
            <aside className="hidden lg:flex fixed inset-y-0 right-0 bg-white border-l border-gray-100 z-50 w-72 flex-col">
                <div className="p-10">
                    <div className="flex items-center gap-3 mb-10">
                         <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center font-black text-xl shadow-sm shadow-ink/20">ت</div>
                         <h1 className="text-xl font-black text-ink tracking-tighter">تمالين</h1>
                    </div>
                    
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mb-4 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">{session.user?.name}</p>
                    
                    {/* Professional Workspace Switcher */}
                    <div className="bg-gray-50 p-1 rounded-[1.25rem] border border-gray-100 flex">
                        <button onClick={() => handleWorkspaceChange('store')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${workspace === 'store' ? 'bg-white text-ink shadow-sm shadow-black/5 outline outline-1 outline-gray-100' : 'text-gray-400 hover:text-ink'}`}>
                             المتجر
                        </button>
                        <button onClick={() => handleWorkspaceChange('academy')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${workspace === 'academy' ? 'bg-white text-ink shadow-sm shadow-black/5 outline outline-1 outline-gray-100' : 'text-gray-400 hover:text-ink'}`}>
                             الأكاديمية
                        </button>
                    </div>
                </div>

                <nav className="px-6 space-y-1.5 overflow-y-auto flex-1 no-scrollbar pt-2 pb-10">
                    {menuItems.map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== '/dashboard';
                        const isHome = item.href === '/dashboard' && pathname === '/dashboard';
                        const active = isActive || isHome;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group w-full ${active ? 'bg-ink text-white shadow-sm shadow-ink/20 transform -translate-y-0.5' : 'text-gray-400 hover:bg-gray-50 hover:text-ink'}`}>
                                <item.icon size={18} className={`transition-transform duration-500 ${active ? 'text-accent' : 'group-hover:scale-110 group-hover:text-ink'}`} />
                                <span className={`text-xs font-black tracking-tight flex-1 text-right ${active ? 'text-white' : ''}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-50 bg-gray-50/20 space-y-2">
                    <Link href="/explore" target="_blank" className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-white hover:text-accent border border-transparent hover:border-gray-100 transition-all text-[10px] font-black uppercase tracking-widest">
                        <FiGlobe size={18} /><span>Marketplace</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-[10px] font-black uppercase tracking-widest">
                        <FiLogOut size={18} /><span>End Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Operational Surface */}
            <div className="lg:mr-72 min-h-screen relative flex flex-col min-w-0">
                <header className="bg-white/90  border-b border-gray-50 sticky top-0 z-30 w-full transition-all">
                    <div className="px-8 h-20 flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-ink p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                            <FiMenu size={22} />
                        </button>

                        <div className="flex items-center gap-6 mr-auto">
                            <ThemeToggle />
                            <Link
                                href={`/${(session.user as any)?.username}`}
                                target="_blank"
                                className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-ink px-6 py-3 border border-gray-100 rounded-2xl transition-all bg-white hover:shadow-sm hover:shadow-gray-100/50"
                            >
                                <FiExternalLink size={14} className="text-accent" />
                                <span>Preview Store</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 sm:p-12 w-full max-w-7xl mx-auto overflow-x-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </main>
            </div>
            <NotificationListener />
        </div>
    );
}
