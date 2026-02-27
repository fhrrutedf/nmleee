'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FiTrendingUp, FiShoppingCart, FiDollarSign, FiUsers, FiPackage, FiCalendar, FiActivity, FiVideo, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalAppointments: 0,
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
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="bg-gradient-to-r from-primary-charcoal to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">مرحباً، {session?.user?.name}! 👋</h1>
                    <p className="text-gray-300 max-w-xl">
                        إليك نظرة عامة على أداء متجرك اليوم. لديك فرص جديدة لتحقيق المبيعات، دعنا نستثمرها!
                    </p>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-action-blue/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'إجمالي الأرباح', value: `${stats.totalRevenue.toLocaleString('ar-EG')} ج.م`, icon: FiDollarSign, badge: 'إرباح', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { title: 'إجمالي الطلبات', value: stats.totalOrders, icon: FiShoppingCart, badge: 'طلب', color: 'text-action-blue', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { title: 'المنتجات النشطة', value: stats.totalProducts, icon: FiPackage, badge: 'نشط', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { title: 'المواعيد القادمة', value: stats.totalAppointments, icon: FiCalendar, badge: 'قريباً', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
                ].map((stat, idx) => (
                    <motion.div variants={item} key={idx} className="card group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={`text-xl ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                                {stat.badge}
                            </span>
                        </div>
                        <h3 className="text-text-muted text-sm font-medium mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-primary-charcoal dark:text-white">
                            {loading ? '...' : stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Area */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity / Chart Placeholder */}
                <motion.div variants={item} className="lg:col-span-2 card min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FiActivity className="text-action-blue" /> النظرة العامة
                        </h2>
                        <select className="bg-bg-light dark:bg-gray-800 border-none rounded-lg text-sm px-3 py-1 text-text-muted focus:ring-0">
                            <option>آخر 7 أيام</option>
                            <option>هذا الشهر</option>
                        </select>
                    </div>

                    {/* Empty State Illustration for Chart */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <FiActivity className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-primary-charcoal mb-2">لا توجد بيانات كافية للرسم البياني</h3>
                        <p className="text-text-muted max-w-sm mx-auto">
                            ستظهر هنا إحصائياتك التفصيلية بمجرد البدء في استقبال الطلبات وحجز المواعيد.
                        </p>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="space-y-4">
                    <h2 className="text-xl font-bold text-primary-charcoal mb-4">إجراءات سريعة</h2>
                    {[
                        { title: 'إضافة منتج جديد', desc: 'بيع كتاب، ملف، أو قالب', icon: FiPackage, href: '/dashboard/products/new', color: 'bg-blue-500' },
                        { title: 'إنشاء دورة تدريبية', desc: 'شارك خبرتك مع العالم', icon: FiVideo, href: '/dashboard/courses/new', color: 'bg-purple-500' },
                        { title: 'تخصيص المتجر', desc: 'تعديل الألوان والشعار', icon: FiSettings, href: '/dashboard/settings', color: 'bg-orange-500' }
                    ].map((action, idx) => (
                        <Link key={idx} href={action.href} className="flex items-center gap-4 p-4 rounded-xl bg-card-white border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                            <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                                <action.icon className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-charcoal dark:text-white group-hover:text-action-blue transition-colors">{action.title}</h3>
                                <p className="text-xs text-text-muted">{action.desc}</p>
                            </div>
                            <div className="mr-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                <FiArrowUpRight className="text-text-muted" />
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
