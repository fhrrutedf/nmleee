'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    FiDownload, FiSearch, FiFilter, FiUser, 
    FiChevronDown, FiCalendar, FiSmartphone, 
    FiActivity, FiTarget, FiStar 
} from 'react-icons/fi';
import { apiGet } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Customer {
    email: string;
    name: string;
    phone: string;
    ordersCount: number;
    totalSpent: number;
    firstPurchase: string;
    lastPurchase: string;
    products: string[];
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Filters
    const [dateRange, setDateRange] = useState('all'); // all, 7d, 30d, custom
    const [selectedProduct, setSelectedProduct] = useState('all');

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange !== 'all' && dateRange !== 'custom') {
                const start = new Date();
                const days = dateRange === '7d' ? 7 : 30;
                start.setDate(start.getDate() - days);
                params.append('startDate', start.toISOString());
            }
            if (selectedProduct !== 'all') {
                params.append('productId', selectedProduct);
            }

            const data = await apiGet(`/api/seller/customers?${params.toString()}`);
            setCustomers(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('فشل تحميل قائمة العملاء');
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedProduct]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const exportToCSV = () => {
        const headers = ['البريد الإلكتروني', 'الاسم', 'الهاتف', 'عدد الطلبات', 'إجمالي الإنفاق', 'المنتجات المشغولة', 'أول شراء', 'آخر شراء'];
        const rows = customers.map((c) => [
            c.email,
            c.name,
            c.phone,
            c.ordersCount,
            c.totalSpent.toFixed(2),
            `"${c.products.join(' | ')}"`,
            new Date(c.firstPurchase).toLocaleDateString('ar-EG'),
            new Date(c.lastPurchase).toLocaleDateString('ar-EG'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        // UTF-8 BOM for Excel compatibility with Arabic
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `crm_customers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('تم تحميل البيانات بنجاح 📥');
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    // Get unique products for filter dropdown
    const allProducts = Array.from(new Set(customers.flatMap(c => c.products)));

    const fmt = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="min-h-screen bg-[#070707] text-gray-200">
            {/* Header Area */}
            <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900/10 to-transparent pt-12 pb-16 px-6">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Customer Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">إدارة العملاء (CRM)</h1>
                        <p className="text-gray-400 mt-2 text-lg">تتبع وسجل بيانات المشترين لتحسين استراتيجيات المبيعات الخاصة بك</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold ${showFilters ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                            <FiFilter /> فلترة متقدمة
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="bg-white text-black hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95"
                        >
                            <FiDownload /> تصدير للـ Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 pb-20 relative z-20">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'إجمالي العملاء', val: customers.length, icon: FiUser, color: 'emerald' },
                        { label: 'متوسط الإنفاق / عميل', val: `${fmt(customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0)} $`, icon: FiActivity, color: 'blue' },
                        { label: 'معدل الطلب المتكرر', val: `${((customers.filter(c => c.ordersCount > 1).length / (customers.length || 1)) * 100).toFixed(1)}%`, icon: FiTarget, color: 'purple' },
                        { label: 'كبار العملاء (VIP)', val: customers.filter(c => c.totalSpent > 500).length, icon: FiStar, color: 'amber' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-tight mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.val}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Search & Advanced Filters */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث باسم العميل، بريده، أو رقم هاتفه..."
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-white font-medium"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-6 mt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <FiCalendar /> المدة الزمنية
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'all', label: 'الكل' },
                                                { id: '7d', label: 'آخر أسبوع' },
                                                { id: '30d', label: 'آخر شهر' }
                                            ].map(opt => (
                                                <button 
                                                    key={opt.id}
                                                    onClick={() => setDateRange(opt.id)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${dateRange === opt.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <FiStar /> الفلترة حسب المنتج
                                        </label>
                                        <select 
                                            value={selectedProduct}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="all">جميع المنتجات والكورسات</option>
                                            {allProducts.map((p, i) => (
                                                <option key={i} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Customers Table */}
                <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-widest text-[10px]">المشتري التفاصيل</th>
                                    <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-widest text-[10px]">النشاط البيعي</th>
                                    <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-widest text-[10px]">الإنفاق الإجمالي</th>
                                    <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-widest text-[10px]">تاريخ الانضمام</th>
                                    <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-widest text-[10px]">المنتجات المشتراة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                                            <p className="text-gray-500 mt-4 font-bold">جاري تحميل سجلات العميل...</p>
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center text-gray-500">
                                            <div className="mb-4 flex justify-center"><FiUser size={48} className="text-white/10" /></div>
                                            <p className="font-bold text-white/50">{searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا يوجد عملاء مسجلون حالياً'}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer, idx) => (
                                        <motion.tr 
                                            key={customer.email} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-6 border-b border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                                                        {customer.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{customer.name}</p>
                                                        <p className="text-xs text-gray-500 font-inter">{customer.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-b border-white/5">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                    <span className="text-white">{customer.ordersCount}</span> طلبات مبيعات
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 border-b border-white/5">
                                                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-black text-sm">
                                                    ${customer.totalSpent.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 border-b border-white/5">
                                                <p className="text-xs text-gray-400 font-bold mb-1 flex items-center gap-2">
                                                    <FiCalendar /> {new Date(customer.firstPurchase).toLocaleDateString('ar-EG')}
                                                </p>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Joined Platform</p>
                                            </td>
                                            <td className="px-6 py-6 border-b border-white/5 max-w-xs">
                                                <div className="flex flex-wrap gap-1">
                                                    {customer.products.slice(0, 2).map((p, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-400 whitespace-nowrap">
                                                            {p}
                                                        </span>
                                                    ))}
                                                    {customer.products.length > 2 && (
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-gray-400">
                                                            +{customer.products.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
