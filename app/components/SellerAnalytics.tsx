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
        if (sellerId) {
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
            color: 'from-blue-500 to-blue-400'
        },
        { 
            icon: FiDollarSign, 
            label: 'الإيرادات', 
            value: `$${stats.totalRevenue?.toFixed(2) || '0'}`,
            color: 'from-emerald-500 to-emerald-400'
        },
        { 
            icon: FiUsers, 
            label: 'العملاء', 
            value: stats.totalCustomers,
            color: 'from-purple-500 to-purple-400'
        },
        { 
            icon: FiTrendingUp, 
            label: 'المنتجات', 
            value: stats.totalProducts,
            color: 'from-orange-500 to-orange-400'
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
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="text-white" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </p>
                        <p className="text-xs text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Referral Section */}
            <div className="bg-gradient-to-r from-white/5 to-transparent rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <FiUsers className="text-[#10B981]" />
                    <h4 className="font-bold text-white">نظام الإحالات</h4>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                    شارك رابط المتجر الخاص بك واحصل على عمولة من كل عملية شراء
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-gray-300 truncate font-mono">
                        {referralCode}
                    </div>
                    <button
                        onClick={copyReferralLink}
                        className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#7c3aed] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                        {copied ? 'تم النسخ' : 'نسخ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
