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
import { revertImpersonation } from '@/app/actions/impersonate';

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

    const handleRevertImpersonation = async () => {
        if (!session?.user) return;
        try {
            await revertImpersonation();
            window.location.href = '/dashboard/admin';
        } catch (error) {
            console.error('Failed to revert impersonation', error);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?callbackUrl=${callbackUrl}`);
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <div className="animate-spin rounded-xl h-10 w-10 border-2 border-white/10 border-t-accent mx-auto"></div>
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
        { href: '/dashboard/admin/orders', icon: FiTrendingUp, label: 'المركز المالي (المبيعات)', type: 'admin' },
        { href: '/dashboard/admin/payouts', icon: FiDollarSign, label: 'سحوبات المدربين', type: 'admin' },
        { href: '/dashboard/admin/broadcast', icon: FiZap, label: '🚀 البث الجماعي', type: 'admin' },
        { href: '/dashboard/admin/platform-settings', icon: FiSettings, label: 'إعدادات المنصة', type: 'admin' },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.type === workspace || item.type === 'shared' || (item.type === 'admin' && isAdmin)
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] transition-colors duration-300 relative selection:bg-emerald-700 text-white flex flex-col">
            <header className="h-safe-top bg-[#0A0A0A] w-full" />
            
            {(session.user as any)?.isImpersonating && (
                <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-2 z-[100] relative flex items-center justify-center gap-4 shadow-lg shadow-red-500/20">
                    <span>🕵️‍♂️ أنت تتصفح حالياً كـ {session.user.name}</span>
                    <button onClick={handleRevertImpersonation} className="bg-black/20 hover:bg-black/40 px-3 py-1 rounded-lg transition-colors border border-white/10">العودة كمدير</button>
                </div>
            )}

            <div className="flex flex-1 relative overflow-hidden">
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60  z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar - Institutional Grade */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60  z-[60] lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-72 bg-[#0A0A0A] z-[70] lg:hidden flex flex-col shadow-lg shadow-[#10B981]/20"
                        >
                            <div className="p-8 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">ت</div>
                                    <span className="font-bold text-[#10B981]">تمالين</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-[#111111] rounded-lg text-gray-400">
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
                                            className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group w-full ${active ? 'bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-black/20' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                            <item.icon size={18} className={`${active ? 'text-white' : 'group-hover:text-[#10B981]'}`} />
                                            <span className="text-xs font-bold tracking-tight flex-1 text-right">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-6 border-t border-white/10 bg-[#111111]/50 space-y-2">
                                <Link href="/explore" className="flex items-center gap-3 px-5 py-3 text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
                                    <FiGlobe size={16}/> <span>Marketplace</span>
                                </Link>
                                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-5 py-3 text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">
                                    <FiLogOut size={16}/> <span>End Session</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar - Institutional Grade */}
            <aside className="hidden lg:flex fixed inset-y-0 right-0 bg-[#0A0A0A] border-l border-white/10 z-50 w-72 flex-col">
                <div className="p-10">
                    <div className="flex items-center gap-3 mb-10">
                         <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[#10B981]/20 shadow-black/20">ت</div>
                         <h1 className="text-xl font-bold text-[#10B981] tracking-tighter">تمالين</h1>
                    </div>
                    
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-4 bg-[#111111] px-3 py-1.5 rounded-lg inline-block border border-white/5">{session.user?.name}</p>
                    
                    {/* Professional Workspace Switcher */}
                    <div className="bg-[#111111] p-1 rounded-[1.25rem] border border-white/10 flex">
                        <button onClick={() => handleWorkspaceChange('store')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${workspace === 'store' ? 'bg-[#0A0A0A] text-[#10B981] shadow-lg shadow-[#10B981]/20 shadow-black/5 outline outline-1 outline-white/10' : 'text-gray-400 hover:text-[#10B981]'}`}>
                             المتجر
                        </button>
                        <button onClick={() => handleWorkspaceChange('academy')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${workspace === 'academy' ? 'bg-[#0A0A0A] text-[#10B981] shadow-lg shadow-[#10B981]/20 shadow-black/5 outline outline-1 outline-white/10' : 'text-gray-400 hover:text-[#10B981]'}`}>
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
                                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group w-full ${active ? 'bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 shadow-black/20 transform -translate-y-0.5' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                <item.icon size={18} className={`transition-transform duration-500 ${active ? 'text-white' : 'group-hover:scale-110 group-hover:text-[#10B981]'}`} />
                                <span className={`text-xs font-bold tracking-tight flex-1 text-right ${active ? 'text-white' : ''}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5 bg-[#111111]/20 space-y-2">
                    <Link href="/explore" target="_blank" className="flex items-center gap-4 px-6 py-4 rounded-xl text-gray-400 hover:bg-[#0A0A0A] hover:text-[#10B981] border border-transparent hover:border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest">
                        <FiGlobe size={18} /><span>Marketplace</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-4 px-6 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-[10px] font-bold uppercase tracking-widest">
                        <FiLogOut size={18} /><span>End Session</span>
                    </button>
                </div>
            </aside>

            <div className="lg:mr-72 flex-1 relative flex flex-col min-w-0 bg-[#0A0A0A]">
                <header className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 w-full transition-all">
                    <div className="px-8 h-20 flex items-center justify-between">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#10B981] p-3 bg-[#111111] rounded-xl hover:bg-emerald-800">
                            <FiMenu size={22} />
                        </button>

                        <div className="flex items-center gap-6 mr-auto">
                            <ThemeToggle />
                            <Link
                                href={`/${(session.user as any)?.username}`}
                                target="_blank"
                                className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white px-6 py-3 border border-white/10 rounded-xl transition-all bg-[#111111] hover:shadow-lg hover:shadow-[#10B981]/10"
                            >
                                <FiExternalLink size={14} className="text-[#10B981]" />
                                <span>Preview Store</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 sm:p-12 w-full max-w-7xl mx-auto overflow-x-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 bg-[#0A0A0A]">
                    {children}
                </main>
            </div>
            </div>
            <NotificationListener />
        </div>
    );
}
