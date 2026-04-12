'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    FiDownload, FiSearch, FiFilter, FiUser, 
    FiCalendar, FiActivity, FiBriefcase, FiArrowRight
} from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AdminCustomer {
    email: string;
    name: string;
    phone: string;
    ordersCount: number;
    totalSpent: number;
    firstPurchase: string;
    lastPurchase: string;
    associatedSellers: string[];
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<AdminCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Global Filters
    const [dateRange, setDateRange] = useState('all');
    const [sellerFilter, setSellerFilter] = useState('all');

    const fetchAllCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange !== 'all') {
                const start = new Date();
                const days = dateRange === '7d' ? 7 : 30;
                start.setDate(start.getDate() - days);
                params.append('startDate', start.toISOString());
            }
            const data = await apiGet(`/api/admin/customers?${params.toString()}`);
            setCustomers(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('فشل تحميل قاعدة بيانات المشتركين');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAllCustomers();
    }, [fetchAllCustomers]);

    const exportToCSV = () => {
        const headers = ['البريد الإلكتروني', 'الاسم', 'الهاتف', 'عدد الطلبات', 'إجمالي المشتريات', 'البائعين المرتبطين', 'تاريخ الانضمام'];
        const rows = customers.map((c) => [
            c.email,
            c.name,
            c.phone,
            c.ordersCount,
            c.totalSpent.toFixed(2),
            `"${c.associatedSellers.join(' | ')}"`,
            new Date(c.firstPurchase).toLocaleDateString('ar-EG'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `global_crm_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('تم تصدير قاعدة البيانات بنجاح 🌐');
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const totalLTV = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            <div className="max-w-7xl mx-auto pt-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                                <FiUser size={24} />
                            </div>
                            مركز إدارة العملاء (Global CRM)
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">رقة تتبع لجميع المشترين في المنصة وتحليل سلوكهم الشرائي</p>
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2 shadow-2xl shadow-emerald-500/20"
                    >
                        <FiDownload /> تصدير الملف الشامل
                    </button>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FiUser size={120} />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">إجمالي قاعدة البيانات</p>
                        <h3 className="text-4xl font-black">{customers.length} <span className="text-lg text-gray-500 font-medium">عميل</span></h3>
                    </div>
                    <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FiActivity size={120} />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">إجمالي المبيعات (LTV)</p>
                        <h3 className="text-4xl font-black">${totalLTV.toLocaleString()}</h3>
                    </div>
                    <div className="bg-[#0D0D0D] border border-white/5 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FiBriefcase size={120} />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">متوسط الربح / عميل</p>
                        <h3 className="text-4xl font-black">${(totalLTV / (customers.length || 1)).toFixed(1)}</h3>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث في كامل المنصة باسم العميل أو بريده..."
                            className="w-full pl-12 pr-4 py-4 bg-[#0D0D0D] border border-white/5 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        />
                    </div>
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-[#0D0D0D] border border-white/5 rounded-2xl px-6 py-4 font-bold text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">كل الأوقات</option>
                        <option value="7d">آخر أسبوع</option>
                        <option value="30d">آخر شهر</option>
                    </select>
                </div>

                {/* Main Ledger */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-[2rem] overflow-hidden shadow-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-8 py-6 text-gray-500 font-black uppercase text-[10px] tracking-widest">العميل</th>
                                    <th className="px-8 py-6 text-gray-500 font-black uppercase text-[10px] tracking-widest text-center">العمليات</th>
                                    <th className="px-8 py-6 text-gray-500 font-black uppercase text-[10px] tracking-widest">الإنفاق</th>
                                    <th className="px-8 py-6 text-gray-500 font-black uppercase text-[10px] tracking-widest">البائعين</th>
                                    <th className="px-8 py-6 text-gray-500 font-black uppercase text-[10px] tracking-widest">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-24 text-center text-emerald-500 font-black animate-pulse">جاري جلب البيانات الضخمة...</td></tr>
                                ) : filteredCustomers.map((cust, i) => (
                                    <motion.tr 
                                        key={cust.email}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center font-black text-emerald-500 border border-white/5">
                                                    {cust.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg">{cust.name}</p>
                                                    <p className="text-xs text-gray-500 font-inter">{cust.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-black">{cust.ordersCount} طلبات</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-emerald-500 font-black text-lg">${cust.totalSpent.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                                                {cust.associatedSellers.slice(0, 3).map((seller, j) => (
                                                    <div key={j} title={seller} className="w-8 h-8 rounded-full bg-emerald-900 border-2 border-[#0D0D0D] flex items-center justify-center text-[10px] font-black uppercase">
                                                        {seller.charAt(0)}
                                                    </div>
                                                ))}
                                                {cust.associatedSellers.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#0D0D0D] flex items-center justify-center text-[10px] font-black">
                                                        +{cust.associatedSellers.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="text-gray-500 hover:text-white transition-colors group flex items-center gap-2 font-bold text-sm">
                                                التفاصيل <FiArrowRight className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
