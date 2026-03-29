'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiTrendingUp, FiShoppingCart, FiDollarSign, FiPackage, FiCalendar, FiArrowUpRight, FiActivity, FiVideo, FiSettings, FiUsers, FiBarChart2 } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalAppointments: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalStudents: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiGet('/api/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', handleApiError(error));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { y: 10, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-12"
        >
            {/* Professional Welcome Section */}
            <motion.div variants={item} className="bg-emerald-700 rounded-xl p-8 sm:p-12 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden ring-1 ring-white/10">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-surface/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Merchant Dashboard</span>
                    <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">مرحباً، {session?.user?.name}</h1>
                    <p className="text-gray-400 text-sm sm:text-lg leading-relaxed font-bold">
                        إليك ملخص أداء متجرك وأهم التحديثات. استمر في النمو وتحقيق النجاح.
                    </p>
                </div>
                {/* Minimalist Background Detail */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/5 rounded-xl -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
            </motion.div>

            {/* High-Contrast Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'إجمالي الأرباح', value: `${(stats.totalRevenue || 0).toLocaleString('en-US')} $`, icon: FiDollarSign, badge: 'Revenue', color: 'text-emerald-600', bg: 'bg-emerald-700-light' },
                    { title: 'إجمالي المبيعات', value: stats.totalOrders || 0, icon: FiShoppingCart, badge: 'Sales', color: 'text-emerald-600', bg: 'bg-gray-50' },
                    { title: 'المنتجات النشطة', value: stats.totalProducts || 0, icon: FiPackage, badge: 'Inventory', color: 'text-emerald-600', bg: 'bg-gray-50' },
                    { title: 'عدد الطلاب', value: stats.totalStudents || 0, icon: FiUsers, badge: 'Students', color: 'text-emerald-600', bg: 'bg-gray-50' }
                ].map((stat, idx) => (
                    <motion.div variants={item} key={idx} className="bg-white border border-gray-100 p-6 rounded-xl hover:border-gray-200 transition-all shadow-lg shadow-emerald-600/20 group">
                        <div className="flex justify-between items-center mb-6">
                            <div className={`${stat.bg} p-3 rounded-xl border border-transparent group-hover:border-gray-200 transition-all`}>
                                <stat.icon className={`text-xl ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.badge}</span>
                        </div>
                        <h3 className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">{stat.title}</h3>
                        <p className="text-2xl font-bold text-emerald-600 font-inter tracking-tight">
                            {loading ? '—' : stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Analytics & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Analytics Snapshot */}
                <motion.div variants={item} className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-8 shadow-lg shadow-emerald-600/20 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <FiBarChart2 className="text-emerald-600 text-2xl" />
                            <h2 className="text-xl font-bold text-emerald-600">تحليلات الأداء</h2>
                        </div>
                        <select className="bg-gray-50 border-none rounded-xl text-[11px] font-bold px-4 py-2 text-gray-500 focus:ring-1 focus:ring-gray-200 cursor-pointer">
                            <option>آخر 7 أيام</option>
                            <option>هذا الشهر</option>
                        </select>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8 border-2 border-dashed border-gray-50 rounded-xl">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                            <FiActivity className="text-2xl text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-emerald-600 mb-2">في انتظار المزيد من البيانات</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto font-bold">
                            سنقوم بتحليل مبيعاتك وتفاعلات طلابك فور بدء النشاط على متجرك.
                        </p>
                    </div>
                </motion.div>

                {/* Corporate Quick Actions */}
                <motion.div variants={item} className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 border-r-4 border-ink pr-3 ml-auto text-right">إجراءات سريعة</h2>
                    {[
                        { title: 'إضافة منتج رقمي', desc: 'كتب، ملفات، قوالب جاهزة', icon: FiPackage, href: '/dashboard/products/new' },
                        { title: 'إنشاء كورس جديد', desc: 'سجل محاضراتك وأنشئ أكاديميتك', icon: FiVideo, href: '/dashboard/courses/new' },
                        { title: 'تعديل هوية المتجر', desc: 'الألوان، الشعار، والوصف', icon: FiSettings, href: '/dashboard/brand' }
                    ].map((action, idx) => (
                        <Link key={idx} href={action.href} className="flex items-center gap-5 p-5 rounded-xl bg-white border border-gray-100 hover:border-emerald-600/20 hover:shadow-lg shadow-emerald-600/20 hover:shadow-accent/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-lg shadow-emerald-600/20">
                                <action.icon className="text-xl" />
                            </div>
                            <div className="flex-1 text-right">
                                <h3 className="font-bold text-emerald-600 group-hover:text-emerald-600 transition-colors text-sm">{action.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{action.desc}</p>
                            </div>
                            <FiArrowUpRight className="text-gray-300 group-hover:text-emerald-600" />
                        </Link>
                    ))}
                    
                    <div className="mt-8 p-6 bg-emerald-700-light rounded-xl border border-emerald-600/10">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">نصيحة اليوم</p>
                        <p className="text-xs text-emerald-600 font-bold leading-relaxed">
                            تحديث صور المنتجات الرقمية يزيد من معدل التحويل بنسبة تصل إلى 25%.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
