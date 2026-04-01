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
    useViewportHeight();

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
        // 🏠 Overview
        { href: '/dashboard', icon: FiHome, label: 'الرئيسية', exact: true, section: 'main' },
        
        // 📦 Content Section (Products + Courses + Bundles)
        { href: '/dashboard/products', icon: FiShoppingBag, label: 'المنتجات الرقمية', section: 'content' },
        { href: '/dashboard/courses', icon: FiVideo, label: 'الدورات التدريبية', section: 'content' },
        { href: '/dashboard/bundles', icon: FiPackage, label: 'الباقات والحزم', section: 'content' },
        
        // 💰 Sales & Customers (Orders + Appointments + Earnings + Students + QA)
        { href: '/dashboard/orders', icon: FiTrendingUp, label: 'الطلبات والمبيعات', section: 'sales' },
        { href: '/dashboard/appointments', icon: FiCalendar, label: 'المواعيد والحجز', section: 'sales' },
        { href: '/dashboard/earnings', icon: FiDollarSign, label: 'السحب والتحصيل', section: 'sales' },
        { href: '/dashboard/students', icon: FiUsers, label: 'الطلاب والمتعلمين', section: 'sales' },
        
        // 🚀 Marketing (Coupons + Affiliates + Automation)
        { href: '/dashboard/coupons', icon: FiTag, label: 'أكواد الخصم', section: 'marketing' },
        { href: '/dashboard/affiliates', icon: FiLink2, label: 'التسويق بالعمولة', section: 'marketing' },
        { href: '/dashboard/automation', icon: FiZap, label: 'الأتمتة الذكية', section: 'marketing' },
        
        // 📊 Analytics
        { href: '/dashboard/financials', icon: FiPieChart, label: 'التحليلات والإحصائيات', section: 'analytics' },
        
        // ⚙️ Settings
        { href: '/dashboard/settings', icon: FiSettings, label: 'إعدادات الحساب', section: 'settings' },
        { href: '/dashboard/billing', icon: FiCreditCard, label: 'الباقة والاشتراك', section: 'settings' },

        // 🔒 Admin Section
        { href: '/dashboard/admin', icon: FiShield, label: 'مركز التحكم الآمن', type: 'admin' },
        { href: '/dashboard/admin/users', icon: FiUsers, label: 'إدارة الأعضاء', type: 'admin' },
        { href: '/dashboard/admin/subscriptions', icon: FiCreditCard, label: 'إدارة الاشتراكات', type: 'admin' },
        { href: '/dashboard/admin/orders', icon: FiTrendingUp, label: 'المركز المالي (المبيعات)', type: 'admin' },
        { href: '/dashboard/admin/payouts', icon: FiDollarSign, label: 'سحوبات المدربين', type: 'admin' },
        { href: '/dashboard/admin/broadcast', icon: FiZap, label: '🚀 البث الجماعي', type: 'admin' },
        { href: '/dashboard/admin/platform-settings', icon: FiSettings, label: 'إعدادات المنصة', type: 'admin' },
    ];

    const menuItems = allMenuItems.filter(item =>
        !item.type || item.type === 'shared' || (item.type === 'admin' && isAdmin)
    );

    const mainItems = menuItems.filter(item => item.section === 'main');
    const contentItems = menuItems.filter(item => item.section === 'content');
    const salesItems = menuItems.filter(item => item.section === 'sales');
    const marketingItems = menuItems.filter(item => item.section === 'marketing');
    const analyticsItems = menuItems.filter(item => item.section === 'analytics');
    const settingsItems = menuItems.filter(item => item.section === 'settings');
    const adminItems = menuItems.filter(item => item.type === 'admin');

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
                                {/* Main */}
                                {mainItems.map((item) => {
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

                                {/* Products Section */}
                                <div className="mt-4 mb-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 mb-2">📦 المحتوى</div>
                                    {contentItems.map((item: any) => {
                                        const isActive = pathname.startsWith(item.href) && item.href !== '/dashboard';
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                                <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                                <span className="font-medium flex-1 text-right">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Sales Section */}
                                <div className="mt-4 mb-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 mb-2">💰 المبيعات</div>
                                    {salesItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                                <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                                <span className="font-medium flex-1 text-right">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* 🚀 التسويق */}
                                <div className="mt-4 mb-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 mb-2">🚀 التسويق</div>
                                    {marketingItems.map((item: any) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                                <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                                <span className="font-medium flex-1 text-right">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Analytics Section */}
                                <div className="mt-4 mb-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 mb-2">📊 التحليلات</div>
                                    {analyticsItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                                <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                                <span className="font-medium flex-1 text-right">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Settings Section */}
                                <div className="mt-4 mb-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-5 mb-2">⚙️ الإعدادات</div>
                                    {settingsItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                                <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                                <span className="font-medium flex-1 text-right">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Admin Section */}
                                {isAdmin && adminItems.length > 0 && (
                                    <div className="mt-4 mb-2">
                                        <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest px-5 mb-2">🔒 الإدارة</div>
                                        {adminItems.map((item) => {
                                            const isActive = pathname.startsWith(item.href);
                                            return (
                                                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-red-500/20 text-red-400 border-r-2 border-red-500' : 'text-gray-400 hover:bg-[#111111] hover:text-red-400'}`}>
                                                    <item.icon size={16} className={isActive ? 'text-red-400' : 'group-hover:text-red-400'} />
                                                    <span className="font-medium flex-1 text-right">{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
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
                    
                    <div className="text-[10px] text-[#10B981] font-bold uppercase tracking-widest mb-2">🚀 لوحة التحكم</div>
                </div>

                <nav className="px-6 space-y-1.5 overflow-y-auto flex-1 no-scrollbar pt-2 pb-10">
                    {/* Main */}
                    {mainItems.map((item) => {
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

                    {/* Products Section */}
                    <div className="mt-6 mb-2">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-6 mb-2">📦 المحتوى</div>
                        {contentItems.map((item: any) => {
                            const isActive = pathname.startsWith(item.href) && item.href !== '/dashboard';
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                    <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                    <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Sales Section */}
                    <div className="mt-4 mb-2">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-6 mb-2">💰 المبيعات</div>
                        {salesItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                    <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                    <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Growth Section */}
                    <div className="mt-4 mb-2">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-6 mb-2">🚀 التسويق</div>
                        {marketingItems.map((item: any) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                    <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                    <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Analytics Section */}
                    <div className="mt-4 mb-2">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-6 mb-2">📊 التحليلات</div>
                        {analyticsItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                    <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                    <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Settings Section */}
                    <div className="mt-4 mb-2">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-6 mb-2">⚙️ الإعدادات</div>
                        {settingsItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-emerald-700/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-gray-400 hover:bg-[#111111] hover:text-[#10B981]'}`}>
                                    <item.icon size={16} className={isActive ? 'text-emerald-400' : 'group-hover:text-[#10B981]'} />
                                    <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Admin Section */}
                    {isAdmin && adminItems.length > 0 && (
                        <div className="mt-4 mb-2">
                            <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest px-6 mb-2">🔒 الإدارة</div>
                            {adminItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href}
                                        className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group w-full text-sm ${isActive ? 'bg-red-500/20 text-red-400 border-r-2 border-red-500' : 'text-gray-400 hover:bg-[#111111] hover:text-red-400'}`}>
                                        <item.icon size={16} className={isActive ? 'text-red-400' : 'group-hover:text-red-400'} />
                                        <span className="font-medium tracking-tight flex-1 text-right">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
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
