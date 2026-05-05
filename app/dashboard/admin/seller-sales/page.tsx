'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUsers, FiTrendingUp, FiShoppingBag, FiCalendar, FiRefreshCw, FiArrowUpRight, FiSearch } from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';

export default function SellerSalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/admin/seller-sales?period=${period}`);
            setSales(data.sellers || []);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [period]);

    const filteredSales = sales.filter(s => 
        s.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.seller?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fmt = (num: number) => num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="relative">
                    <div className="absolute -right-4 top-0 w-1 h-full bg-[#10B981] rounded-full blur-sm opacity-50"></div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 rounded-lg text-[#10B981] border border-emerald-500/20">
                            <FiTrendingUp size={24} />
                        </span>
                        تقارير مبيعات التجار
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 font-medium">نظام المراقبة لمبيعات البائعين لغايات تصفية الأرباح والحسابات</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button onClick={fetchSales} className="p-3 bg-[#0A0A0A] border border-white/10 rounded-xl hover:bg-[#111111] transition-all text-gray-400 hover:text-white">
                        <FiRefreshCw className={loading ? 'animate-spin text-[#10B981]' : ''} size={18} />
                    </button>
                    <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/10">
                        {[
                            { value: '7', label: 'أسبوع' },
                            { value: '15', label: '15 يوم' },
                            { value: '30', label: 'شهر' },
                            { value: '60', label: 'شهرين' },
                        ].map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p.value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي البائعين النشطين', value: stats?.totalSellersActive || 0, icon: FiUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'أرباح البائعين الصافية', value: '$' + fmt(stats?.totalSellerEarnings || 0), icon: FiDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'عمولات المنصة', value: '$' + fmt(stats?.totalPlatformRevenue || 0), icon: FiArrowUpRight, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map(s => (
                    <div key={s.label} className={`relative overflow-hidden group ${s.bg} border border-white/10 rounded-[2rem] p-6 transition-all hover:border-white/20`}>
                        <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 opacity-70">{s.label}</p>
                            <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                        </div>
                        <s.icon size={80} className={`absolute -left-4 -bottom-4 opacity-[0.03] ${s.color} transition-transform group-hover:scale-110 group-hover:rotate-12 duration-700`} />
                    </div>
                ))}
            </div>

            {/* Sellers Sales Table */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-white/10 bg-[#111111]/50 flex gap-4 justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="ابحث عن تاجر (اسم، ايميل)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-emerald-500/20 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all text-[#10B981]"
                        />
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full border-collapse text-right">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">التاجر</th>
                                <th className="px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px] text-center">الطلبات</th>
                                <th className="px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px] text-center">إجمالي المبيعات</th>
                                <th className="px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px] text-center">عمولة المنصة</th>
                                <th className="px-8 py-5 text-[#10B981] font-bold uppercase tracking-wider text-[11px] text-center bg-emerald-900/10">مستحقات التاجر (صافي)</th>
                                <th className="px-8 py-5 text-gray-500 font-bold uppercase tracking-wider text-[10px]">أكثر المنتجات مبيعاً</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-24"><FiRefreshCw size={30} className="animate-spin text-emerald-500/30 mx-auto" /></td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-24 text-gray-500 font-bold">لا يوجد مبيعات في هذه الفترة المحددة</td></tr>
                            ) : filteredSales.map((s) => {
                                const topProducts = Object.entries(s.productsSold).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2);
                                
                                return (
                                    <tr key={s.seller.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-emerald-400 border border-white/10 text-sm">
                                                    {s.seller.name ? s.seller.name.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm mb-1">{s.seller.name}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{s.seller.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="bg-white/5 text-gray-300 font-bold px-3 py-1 rounded-full text-xs">
                                                {s.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-white font-bold">
                                            ${fmt(s.totalSalesAmount)}
                                        </td>
                                        <td className="px-8 py-6 text-center text-orange-400 font-bold">
                                            ${fmt(s.totalPlatformFee)}
                                        </td>
                                        <td className="px-8 py-6 text-center bg-emerald-900/10">
                                            <span className="text-lg font-black text-[#10B981] tracking-tighter shadow-emerald-500/20 drop-shadow-lg">
                                                ${fmt(s.totalSellerEarnings)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                {topProducts.map(([title, qty]: any, i) => (
                                                    <div key={i} className="text-[10px] flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-gray-400">{qty}</span>
                                                        <span className="text-gray-300 truncate max-w-[150px]">{title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
