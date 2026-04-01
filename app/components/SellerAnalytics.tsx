'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiDollarSign, FiShoppingBag, FiEye, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SellerAnalyticsProps {
    sellerId: string;
    stats: {
        totalSales: number;
        totalRevenue: number;
        totalProducts: number;
        totalCustomers: number;
        conversionRate?: number;
    };
    brandColor?: string;
}

export default function SellerAnalytics({ sellerId, stats, brandColor = '#10B981' }: SellerAnalyticsProps) {
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState('');

    useEffect(() => {
        // Generate or fetch referral code
        if (sellerId && typeof window !== 'undefined') {
            setReferralCode(`${window.location.origin}/ref/${sellerId.slice(0, 8)}`);
        }
    }, [sellerId]);

    const copyReferralLink = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success('تم نسخ رابط الإحالة!');
        setTimeout(() => setCopied(false), 2000);
    };

    const statCards = [
        { 
            icon: FiShoppingBag, 
            label: 'إجمالي المبيعات', 
            value: stats.totalSales,
            color: 'from-emerald-500/20 to-emerald-400/10',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20'
        },
        { 
            icon: FiDollarSign, 
            label: 'الإيرادات', 
            value: `$${stats.totalRevenue?.toFixed(2) || '0'}`,
            color: 'from-emerald-600/30 to-emerald-500/10',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/30'
        },
        { 
            icon: FiUsers, 
            label: 'العملاء', 
            value: stats.totalCustomers,
            color: 'from-emerald-500/20 to-emerald-400/10',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20'
        },
        { 
            icon: FiTrendingUp, 
            label: 'المنتجات', 
            value: stats.totalProducts,
            color: 'from-emerald-500/20 to-emerald-400/10',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div 
                    className="p-3 rounded-xl"
                    style={{ background: `${brandColor}20` }}
                >
                    <FiTrendingUp size={24} style={{ color: brandColor }} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">إحصائيات المتجر</h3>
                    <p className="text-sm text-gray-400">أداء متجرك خلال الفترة الحالية</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white/5 rounded-2xl p-5 border ${stat.borderColor} hover:bg-white/10 transition-colors group relative overflow-hidden`}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={stat.iconColor} size={24} />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        
                        {/* Subtle Background Glow */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    </motion.div>
                ))}
            </div>

            {/* Referral Section */}
            <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <FiUsers size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">نظام الإحالات والشراكة</h4>
                            <p className="text-xs text-gray-400 mt-0.5">شارك رابط المتجر الخاص بك واحصل على عمولات فورية</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-black/40 rounded-xl px-5 py-4 text-sm text-[#10B981] truncate font-mono border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                            {referralCode}
                        </div>
                        <button
                            onClick={copyReferralLink}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                            <span>{copied ? 'تم النسخ بنجاح' : 'نسخ الرابط'}</span>
                        </button>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
        </div>
    );
}
