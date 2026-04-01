'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiTrendingUp, FiShoppingCart, FiDollarSign, FiPackage, FiCalendar, FiArrowUpRight, FiActivity, FiVideo, FiSettings, FiUsers, FiBarChart2, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiGet, handleApiError } from '@/lib/safe-fetch';
import SellerAnalytics from '@/app/components/SellerAnalytics';

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
            <motion.div variants={item} className="bg-emerald-700 text-white rounded-xl p-8 sm:p-12 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden ring-1 ring-white/10">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-black/20 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Merchant Dashboard</span>
                    <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">مرحباً، {session?.user?.name}</h1>
                    <p className="text-emerald-50 text-sm sm:text-lg leading-relaxed font-bold">
                        إليك ملخص أداء متجرك وأهم التحديثات. استمر في النمو وتحقيق النجاح.
                    </p>
                </div>
                {/* Minimalist Background Detail */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-xl -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
            </motion.div>

            {/* Analytics & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Seller Analytics Component - Detailed Stats */}
                <motion.div variants={item} className="lg:col-span-2">
                    <SellerAnalytics
                        sellerId={session?.user?.id || ''}
                        stats={{
                            totalProducts: stats.totalProducts || 0,
                            totalSales: stats.totalOrders || 0,
                            totalRevenue: stats.totalRevenue || 0,
                            totalCustomers: stats.totalStudents || 0,
                            conversionRate: 0
                        }}
                        brandColor="#10B981"
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item} className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-6 border-r-4 border-emerald-500 pr-3 ml-auto text-right">إجراءات سريعة</h2>
                    {[{
                        title: 'فتح متجري',
                        desc: 'معاينة متجرك كما يراه الزبائن',
                        icon: FiExternalLink,
                        href: `/${session?.user?.username || session?.user?.name}`,
                        external: true
                    },
                        { title: 'إضافة منتج رقمي', desc: 'ملفات PDF, ZIP, قوالب جاهزة - تحميل فوري', icon: FiPackage, href: '/dashboard/products/new' },
                        { title: 'إنشاء كورس تدريبي', desc: 'دروس فيديو, اختبارات, شهادات - أكاديمية متكاملة', icon: FiVideo, href: '/dashboard/courses/new' },
                        { title: 'تعديل هوية المتجر', desc: 'الألوان، الشعار، والوصف', icon: FiSettings, href: '/dashboard/settings' }
                    ].map((action, idx) => {
                        const linkProps = action.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
                        return (
                        <Link key={idx} href={action.href} {...linkProps} className="flex items-center gap-5 p-5 rounded-xl bg-[#0A0A0A] border border-white/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-[#111111] text-[#10B981] flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-lg shadow-black/20">
                                <action.icon className="text-xl" />
                            </div>
                            <div className="flex-1 text-right">
                                <h3 className="font-bold text-white group-hover:text-[#10B981] transition-colors text-sm">{action.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{action.desc}</p>
                            </div>
                            <FiArrowUpRight className="text-gray-500 group-hover:text-[#10B981]" />
                        </Link>
                        );
                    })}
                    
                    {/* Product vs Course Comparison */}
                    <div className="mt-6 p-5 bg-[#111111] rounded-xl border border-white/10">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">📦 المنتج vs 🎓 الدورة</p>
                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-emerald-500/20">
                                <p className="font-bold text-emerald-400 mb-1">المنتج الرقمي</p>
                                <ul className="text-gray-400 space-y-1">
                                    <li>• ملفات PDF, ZIP, Word</li>
                                    <li>• قوالب, تصاميم, كود</li>
                                    <li>• تحميل فوري بعد الشراء</li>
                                    <li>• مناسب للكتب والملفات</li>
                                </ul>
                            </div>
                            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-blue-500/20">
                                <p className="font-bold text-blue-400 mb-1">الدورة التدريبية</p>
                                <ul className="text-gray-400 space-y-1">
                                    <li>• دروس فيديو مصنفة</li>
                                    <li>• اختبارات وشهادات</li>
                                    <li>• تتبع تقدم الطالب</li>
                                    <li>• مناسب للتعليم المنهجي</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
