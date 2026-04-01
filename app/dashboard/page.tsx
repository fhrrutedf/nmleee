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
            {/* Glassmorphism Welcome Section */}
            <motion.div 
                variants={item} 
                className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 p-6 md:p-12 backdrop-blur-xl shadow-2xl shadow-black/50 group"
            >
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
                            Professional Dashboard
                        </span>
                        <div className="h-px w-8 md:w-12 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                    </div>
                    
                    <h1 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight leading-[1.1] text-white break-words">
                        مرحباً بك، <span className="text-emerald-500">{session?.user?.name?.split(' ')[0]}</span>
                    </h1>
                    
                    <p className="text-gray-400 text-xs md:text-lg leading-relaxed max-w-xl font-medium">
                        إليك ملخص شامل لأداء متجرك الرقمي اليوم. نحن هنا لمساعدتك على تحويل أفكارك إلى نجاحات مستمرة.
                    </p>
                    
                    <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] md:text-[11px] font-bold text-gray-300">
                             <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             متجرك الآن متاح للعملاء
                        </div>
                    </div>
                </div>

                {/* Premium Background Graphics */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] group-hover:bg-emerald-500/15 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-700/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
                
                {/* Decorative Line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
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
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] border-r-4 border-emerald-500 pr-4">إجراءات سريعة</h2>
                        <div className="h-px flex-1 bg-white/5 mr-4"></div>
                    </div>
                    
                    {[
                        {
                            title: 'فتح متجري',
                            desc: 'معاينة متجرك كما يراه الزبائن',
                            icon: FiExternalLink,
                            href: `/${session?.user?.username || session?.user?.name}`,
                            external: true,
                            accent: 'emerald'
                        },
                        { 
                            title: 'إضافة منتج رقمي', 
                            desc: 'ملفات PDF, ZIP, قوالب جاهزة', 
                            icon: FiPackage, 
                            href: '/dashboard/products/new',
                            accent: 'emerald' 
                        },
                        { 
                            title: 'إنشاء كورس تدريبي', 
                            desc: 'دروس فيديو، اختبارات، وشهادات', 
                            icon: FiVideo, 
                            href: '/dashboard/courses/new',
                            accent: 'emerald'
                        },
                        { 
                            title: 'تعديل هوية المتجر', 
                            desc: 'الألوان، الشعار والوصف', 
                            icon: FiSettings, 
                            href: '/dashboard/settings',
                            accent: 'emerald'
                        }
                    ].map((action, idx) => {
                        const linkProps = action.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
                        return (
                        <Link 
                            key={idx} 
                            href={action.href} 
                            {...linkProps} 
                            className="flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02] transition-all group relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-black border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all shadow-xl group-hover:shadow-emerald-500/10">
                                <action.icon className="text-xl md:text-2xl" />
                            </div>
                            <div className="flex-1 text-right min-w-0">
                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors text-[13px] md:text-sm truncate">{action.title}</h3>
                                <p className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-1 truncate">{action.desc}</p>
                            </div>
                            <FiArrowUpRight className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all" />
                            
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                        );
                    })}
                    
                    {/* Platform Guidance Section */}
                    <div className="mt-8 p-6 bg-emerald-500/[0.02] rounded-2xl border border-emerald-500/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xl">🚀</span>
                                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">اختر مسارك المهني</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors group">
                                    <h4 className="font-bold text-emerald-400 text-xs mb-2 flex items-center gap-2">
                                        <FiPackage size={14} /> المنتجات الرقمية
                                    </h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        مثالية لبيع ملفات الـ PDF، القوالب الجاهزة، الكود البرمجي، أو الصور. التحميل فوري للعميل بعد إتمام الدفع.
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors group">
                                    <h4 className="font-bold text-emerald-400 text-xs mb-2 flex items-center gap-2">
                                        <FiVideo size={14} /> الدورات التدريبية
                                    </h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        أكاديمية متكاملة تشمل دروس فيديو، اختبارات، وشهادات إتمام. تتيح لك متابعة تقدم طلابك وتفاعلهم.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px]"></div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
