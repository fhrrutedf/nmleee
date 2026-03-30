'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShoppingCart, FiSearch, FiFilter,
    FiClock, FiEye, FiRefreshCw, FiCheckCircle, FiXCircle, FiX, FiCpu, FiList, FiZap, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OrderItem {
    id: string;
    product?: { title: string; itemType?: string };
    course?: { title: string };
    bundle?: { title: string };
    price: number;
}

interface OrderData {
    id: string;
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    platformFee: number;
    sellerEarnings: number;
    status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED';
    paymentMethod: string;
    paymentProvider: string | null;
    paymentId: string | null;
    transactionRef: string | null;
    paymentProof: string | null;
    senderPhone: string | null;
    cryptoPaidAmount: number | null;
    cryptoAddress: string | null;
    createdAt: string;
    user: { name: string; email: string };
    seller: { name: string; email: string; username?: string } | null;
    items: OrderItem[];
}

const TABS = [
    { id: 'PENDING_MANUAL', label: 'بانتظار الاعتماد', icon: '⚠️' },
    { id: 'ALL', label: 'الكل', icon: '' },
    { id: 'crypto', label: 'العملات الرقمية', icon: '🪙' },
    { id: 'spaceremit', label: 'سبيس ريميت', icon: '💳' },
    { id: 'stripe', label: 'سترايب', icon: '🌍' },
    { id: 'shamcash', label: 'شام كاش', icon: '🇸🇾' },
    { id: 'manual', label: 'الحوالات اليدوية', icon: '🏦' },
    { id: 'subscriptions', label: 'الاشتراكات', icon: '💎' }
];

export default function AdminOrdersManagement() {
    const { data: session } = useSession();
    const router = useRouter();

    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // UI Modals
    const [proofImage, setProofImage] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({
        totalOrders: 0,
        paidOrders: 0,
        pendingManual: 0,
        totalRevenue: { _sum: { totalAmount: 0 } }
    });

    // Smart Match (SMS Verification) Interface State
    const [showSmartMatch, setShowSmartMatch] = useState(false);
    const [smsText, setSmsText] = useState('');
    const [extractedRefs, setExtractedRefs] = useState<string[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [session, page, statusFilter, activeTab, searchQuery]);

    // Real-time polling
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchOrders(false); // Silent reload
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, session, page, statusFilter, activeTab, searchQuery]);

    const fetchOrders = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setIsRefreshing(true);
        try {
            const url = new URL('/api/admin/orders', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            if (activeTab === 'subscriptions') {
                url.searchParams.append('type', 'subscription');
                url.searchParams.append('gateway', 'ALL');
            } else if (activeTab === 'PENDING_MANUAL') {
                url.searchParams.append('gateway', 'manual');
                url.searchParams.append('status', 'PENDING');
            } else {
                url.searchParams.append('gateway', activeTab);
                url.searchParams.append('status', statusFilter);
            }

            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.totalPages);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); 
        fetchOrders();
    };

    const handleApproveManifest = async (orderId: string) => {
        if (!confirm('هل أنت متأكد من الموافقة على تحويل هذا الطلب إلى مكتمل؟')) return;
        try {
            const res = await fetch(`/api/admin/manual-orders/${orderId}/approve`, { method: 'POST' });
            if (res.ok) {
                toast.success('تمت الموافقة وتفعيل الكورسات ورصيد البائع!');
                fetchOrders();
            } else {
                toast.error('حدث خطأ أثناء الموافقة');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال بالشبكة');
        }
    };

    const handleRejectManifest = async (orderId: string) => {
        const reason = prompt('يرجى إدخال سبب الرفض (مثال: الإيصال غير صالح أو الرقم خطأ):');
        if (!reason) return;
        try {
            const res = await fetch(`/api/admin/manual-orders/${orderId}/reject`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectionReason: reason })
            });
            if (res.ok) {
                toast.success('تم رفض الحوالة وإلغاء الطلب!');
                fetchOrders();
            } else {
                toast.error('حدث خطأ أثناء الرفض');
            }
        } catch (e) {
            toast.error('خطأ في الشبكة');
        }
    };

    // Smart Match Logic
    const extractRefs = () => {
        const regex = /[A-Za-z0-9]{6,20}/g;
        const matches = smsText.match(regex);
        if (matches) {
            const uniqueRefs = Array.from(new Set(matches)).filter(m => /\d/.test(m));
            setExtractedRefs(uniqueRefs);
            toast.success(`تم استخراج ${uniqueRefs.length} كود مرجعي`);
        } else {
            setExtractedRefs([]);
            toast.error('لم يتم العثور على أكواد في النص');
        }
    };

    const runSmartMatch = async () => {
        if (extractedRefs.length === 0) return;
        setIsMatching(true);
        setMatchResult(null);
        try {
            const res = await fetch('/api/admin/verify-transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ references: extractedRefs })
            });
            const data = await res.json();
            setMatchResult(data);
            if (data.success && data.matchedCount > 0) {
                toast.success(`تم تفعيل ${data.matchedCount} طلب بنجاح ✅`);
                setSmsText('');
                setExtractedRefs([]);
                fetchOrders();
            } else {
                toast.error('لم يتم العثور على طلبات مطابقة لهذه الأكواد');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال بنظام المطابقة');
        } finally {
            setIsMatching(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
            case 'PAID':
            case 'COMPLETED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/50';
            case 'REFUNDED': return 'bg-red-500/100/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/50';
            default: return 'bg-[#111111] text-gray-300 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'معلق/بانتظار الدفع';
            case 'PAID': return 'مدفوع';
            case 'COMPLETED': return 'مكتمل';
            case 'REFUNDED': return 'مسترجع';
            default: return status;
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full relative">
            {/* Smart Match Interface (Overlay) */}
            <AnimatePresence>
                {showSmartMatch && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8 overflow-hidden z-50 relative"
                    >
                        <div className="bg-[#0A0A0A] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl shadow-emerald-900/40">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <FiCpu className="text-emerald-500 animate-pulse" /> نظام المطابقة الذكي (Smart Match)
                                </h3>
                                <button onClick={() => setShowSmartMatch(false)} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                        هذا النظام يقوم باستخراج الأرقام المرجعية تلقائياً من رسائل الـ SMS أو إشعارات الدفع. قم بلصق النص كاملاً وسنقوم بالباقي.
                                    </p>
                                    <textarea
                                        value={smsText}
                                        onChange={(e) => setSmsText(e.target.value)}
                                        placeholder="مثال: تم تحويل مبلغ 15.00$ بواسطة زين كاش... المرجع: 789456123"
                                        className="w-full h-40 bg-[#111111] border border-white/10 rounded-2xl p-5 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700 shadow-inner"
                                    />
                                    <button
                                        onClick={extractRefs}
                                        disabled={!smsText.trim()}
                                        className="mt-4 w-full py-4 bg-[#0A0A0A] border border-emerald-500/20 text-[#10B981] rounded-2xl font-bold hover:bg-emerald-900/20 transition-all disabled:opacity-30 tracking-widest text-xs"
                                    >
                                        استخراج البيانات المرجعية
                                    </button>
                                </div>
                                
                                <div className="w-full lg:w-96 bg-[#111111] rounded-3xl p-6 border border-white/5 flex flex-col shadow-xl">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                                        <span>الأكواد المكتشفة</span>
                                        <span className="bg-emerald-500/10 text-[#10B981] px-2 py-1 rounded-lg text-[10px]">{extractedRefs.length}</span>
                                    </h4>
                                    
                                    <div className="flex-1 overflow-y-auto max-h-48 space-y-3 mb-6 scrollbar-hide">
                                        {extractedRefs.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3 border-2 border-dashed border-white/5 rounded-2xl py-8">
                                                <FiList size={32} className="opacity-20" />
                                                <span className="text-[10px] uppercase font-bold tracking-tighter">بانتظار استخراج البيانات...</span>
                                            </div>
                                        ) : (
                                            extractedRefs.map((ref, idx) => (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={idx} 
                                                    className="bg-[#0A0A0A] p-3 rounded-xl border border-emerald-500/20 text-xs font-mono text-emerald-300 flex justify-between items-center shadow-lg shadow-[#10B981]/10"
                                                >
                                                    <span>{ref}</span>
                                                    <FiCheckCircle className="text-emerald-500" />
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={runSmartMatch}
                                        disabled={extractedRefs.length === 0 || isMatching}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isMatching ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                                        {isMatching ? 'جاري المطابقة والاعتماد...' : 'اعتماد الحوالات المكتشفة'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#10B981] dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white-500/10 text-[#10B981] flex items-center justify-center">
                            <FiDollarSign size={24} />
                        </div>
                        المركز المالي الموحد
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        نظام إدارة الإيرادات، اشتراكات الـ SaaS، والمطابقة الذكية للحوالات اليدوية.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex bg-[#0A0A0A] dark:bg-card-white border border-white/10 dark:border-gray-800 rounded-xl shadow-lg shadow-[#10B981]/20 overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                        <div className="px-5 py-3 flex flex-col items-center">
                            <span className="text-gray-400 text-xs">إجمالي</span>
                            <span className="text-[#10B981] dark:text-white text-lg">{stats.totalOrders}</span>
                        </div>
                        <div className="px-5 py-3 flex flex-col items-center">
                            <span className="text-green-500 text-xs">مكتمل ومدفوع</span>
                            <span className="text-green-600 dark:text-green-400 text-lg">{stats.paidOrders}</span>
                        </div>
                        <div className="px-5 py-3 flex flex-col items-center text-center">
                            <span className="text-orange-500 text-[11px] leading-tight">حوالات يدوية<br />(قيد المراجعة)</span>
                            <span className="text-orange-600 dark:text-orange-400 text-lg">{stats.pendingManual}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`btn text-sm py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl transition-all ${autoRefresh ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 'border border-emerald-500/20 dark:border-gray-800 text-gray-500 hover:bg-[#111111]'}`}
                        >
                            تحديث لحظي
                            {autoRefresh && <span className="relative flex h-2 w-2 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-xl h-2 w-2 bg-green-500"></span>
                            </span>}
                        </button>
                        <button
                            onClick={() => setShowSmartMatch(!showSmartMatch)}
                            className={`btn text-sm py-2 px-4 shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-1.5 rounded-xl transition-all ${showSmartMatch ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-800 transition-colors'}`}
                        >
                            <FiCpu /> المطابقة الذكية (SMS)
                        </button>
                        <button onClick={() => fetchOrders(true)} className="btn bg-[#0A0A0A] border border-white/10 py-2 px-3 rounded-xl hover:bg-[#111111]">
                            <FiRefreshCw className={loading || isRefreshing ? 'animate-spin text-[#10B981]' : 'text-gray-500 w-4 h-4'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gateway Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(1); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'bg-emerald-700 text-white shadow-lg shadow-[#10B981]/20 transform -translate-y-1'
                                : 'bg-[#0A0A0A] text-gray-400 border border-white/10 hover:bg-[#111111] hover:text-[#10B981]'
                        }`}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-[#0A0A0A] rounded-xl border border-white/10 shadow-lg shadow-[#10B981]/20 overflow-hidden flex flex-col min-h-[500px]">
                {/* Controls Bar */}
                <div className="p-6 border-b border-white/10 bg-[#111111]/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder="ابحث برقم الطلب، اسم العميل، اسم البائع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-emerald-500/20 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-emerald-600 transition-all text-[#10B981]"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#10B981] transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-[#0A0A0A] px-4 py-2 rounded-xl border border-emerald-500/20">
                            <FiFilter className="text-[#10B981]" />
                            الحالة:
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-[#10B981] cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="PENDING">معلق/بانتظار الدفع</option>
                                <option value="PAID">مدفوع ومكتمل</option>
                                <option value="REFUNDED">مسترجع</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto flex-1">
                    {loading && orders.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-accent rounded-xl animate-spin mb-4"></div>
                            جاري جلب المعلومات المالية...
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap lg:whitespace-normal min-w-[1000px]">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-white/10 bg-[#111111]/80">
                                    <th className="font-bold py-4 px-6">الطلب والتاريخ</th>
                                    <th className="font-bold py-4 px-6">العميل & معلومات الاتصال</th>
                                    <th className="font-bold py-4 px-6">تفاصيل الاستلام (البوابة)</th>
                                    <th className="font-bold py-4 px-6 text-center">الإجمالي والصافي</th>
                                    <th className="font-bold py-4 px-6 text-center">المنتجات</th>
                                    <th className="font-bold py-4 px-6 text-center">الحالة / إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiShoppingCart size={48} className="mb-4 text-gray-200 opacity-20" />
                                                <p className="font-bold">لا توجد حركات مالية مسجلة بهذه الفلاتر</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b border-white/10 hover:bg-[#111111]/50 transition-colors">
                                            {/* Order & Date */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="font-mono text-xs font-bold text-gray-300 mb-1">
                                                    #{order.orderNumber}
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1 font-bold mb-2">
                                                    <FiClock size={10} /> {formatDate(order.createdAt)}
                                                </div>
                                                <div className="inline-flex items-center px-2 py-[2px] rounded text-[9px] font-bold uppercase border border-emerald-500/30 text-[#10B981] bg-emerald-900/20">
                                                    {order.paymentMethod === 'manual' ? 'حوالة يدوية' : order.paymentMethod}
                                                </div>
                                            </td>
                                            
                                            {/* Customer & Contacts */}
                                            <td className="py-4 px-6 align-top max-w-[200px]">
                                                <div className="font-bold text-white mb-0.5">{order.user.name}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mb-1">{order.user.email}</div>
                                                {/* Specifically injected for Manual/SpaceRemit where phone tracking is critical */}
                                                {(order.senderPhone || activeTab === 'manual' || activeTab === 'spaceremit') && (
                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                        <span className="text-[10px] text-gray-500 block mb-0.5">هاتف الحوالة:</span>
                                                        <span className="text-xs font-mono font-bold text-emerald-400" dir="ltr">{order.senderPhone || 'غير مدرج'}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Payment Gateway Specific Metadata */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="bg-[#111111] rounded-lg p-2 border border-white/5 space-y-2">
                                                    
                                                    {/* Stripe/General TXID */}
                                                    {(order.paymentId || order.transactionRef) && activeTab !== 'manual' && (
                                                        <div>
                                                            <div className="text-[9px] text-gray-500 uppercase tracking-wider">Transaction / Payment ID</div>
                                                            <div className="text-[11px] font-mono text-gray-300 truncate w-40">{order.paymentId || order.transactionRef}</div>
                                                        </div>
                                                    )}

                                                    {/* Crypto Details */}
                                                    {(activeTab === 'crypto' || order.cryptoPaidAmount) && (
                                                        <>
                                                            {order.cryptoAddress && (
                                                              <div>
                                                                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">Wallet Address</div>
                                                                  <div className="text-[11px] font-mono text-gray-300 truncate w-40">{order.cryptoAddress}</div>
                                                              </div>
                                                            )}
                                                            {order.cryptoPaidAmount && (
                                                              <div>
                                                                  <div className="text-[9px] text-gray-500 uppercase tracking-wider">Paid Crypto</div>
                                                                  <div className="text-[11px] font-mono text-[#10B981]">{order.cryptoPaidAmount} USDT</div>
                                                              </div>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Manual Transfer Details */}
                                                    {activeTab === 'manual' && (
                                                        <>
                                                            <div>
                                                                <div className="text-[9px] text-gray-500 uppercase tracking-wider">رقم إيصال الحوالة المرجعي:</div>
                                                                <div className="text-[11px] font-mono font-bold text-orange-400">{order.transactionRef || 'بدون رقم تحويل'}</div>
                                                            </div>
                                                            {order.paymentProof ? (
                                                                <button onClick={() => setProofImage(order.paymentProof)} className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 px-2 bg-emerald-900/30 text-[#10B981] border border-emerald-500/20 rounded-md text-[10px] font-bold hover:bg-emerald-800 transition-colors">
                                                                    <FiEye size={12}/> عرض صورة الإيصال المرفق
                                                                </button>
                                                            ) : (
                                                                <div className="mt-2 py-1.5 text-center bg-red-900/10 text-red-500 border border-red-500/10 rounded-md text-[10px] font-bold">
                                                                    لم يرفق العميل صورة
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Financial Split */}
                                            <td className="py-4 px-6 align-top text-center">
                                                <div className="font-bold text-lg text-white mb-2">
                                                    ${order.totalAmount.toFixed(2)}
                                                </div>
                                                
                                                <div className="flex flex-col gap-1 text-[10px] items-center">
                                                    <div className="flex justify-between w-full max-w-[120px] bg-[#111111] px-2 py-1 rounded">
                                                        <span className="text-gray-500">حصة البائع:</span>
                                                        <span className="font-bold text-[#10B981]">${order.sellerEarnings?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className="flex justify-between w-full max-w-[120px] bg-[#111111] px-2 py-1 rounded">
                                                        <span className="text-gray-500">رسوم المنصة:</span>
                                                        <span className="font-bold text-gray-300">${order.platformFee?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Products Block */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="text-xs text-gray-400 whitespace-normal">
                                                    {order.items.map((i, idx) => (
                                                        <div key={idx} className="mb-1 bg-[#111111] px-2 py-1 rounded border border-white/5 truncate max-w-[150px]" title={i.product?.title || i.course?.title || i.bundle?.title || (i.product?.itemType === 'subscription' ? 'باقة اشتراك المنصة' : 'طلب')}>
                                                            <span className="text-emerald-500 mr-1">•</span>
                                                            {i.product?.title || i.course?.title || i.bundle?.title || (i.product?.itemType === 'subscription' ? 'اشتراك منصة 💎' : 'منتج')}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-500 mt-2 text-center border-t border-white/5 pt-1">
                                                    للبائع: {order.seller?.name || 'المنصة'}
                                                </div>
                                            </td>

                                            {/* Actions & Status */}
                                            <td className="py-4 px-6 align-top text-center">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest border border-white/10 ${getStatusStyle(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                
                                                {order.paymentMethod === 'manual' && order.status === 'PENDING' && (
                                                    <div className="mt-4 flex flex-col gap-2">
                                                        <button onClick={() => handleApproveManifest(order.id)} className="flex items-center justify-center gap-1 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-lg shadow-emerald-500/20">
                                                            <FiCheckCircle size={14}/> تأكيد واستلام
                                                        </button>
                                                        <button onClick={() => handleRejectManifest(order.id)} className="flex items-center justify-center gap-1 w-full py-1.5 bg-red-900/20 border border-red-500/30 text-red-500 hover:bg-red-900/40 rounded-lg text-[10px] font-bold transition-all">
                                                            <FiXCircle size={12}/> رفض وتجاهل
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-white/10 bg-[#111111]/30 flex justify-center mt-auto">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#0A0A0A] border border-emerald-500/20 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                            >السابق</button>
                            <span className="text-sm font-bold text-gray-500 px-4">صفحة {page} من {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#0A0A0A] border border-emerald-500/20 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                            >التالي</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Proof Image Modal */}
            <AnimatePresence>
                {proofImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setProofImage(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-3xl w-full bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-white/10" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#111111]">
                                <h3 className="font-bold text-white text-sm">مراجعة إيصال التحويل المرفق</h3>
                                <button onClick={() => setProofImage(null)} className="w-8 h-8 bg-black/50 hover:bg-red-500 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all">
                                    <FiX size={16} />
                                </button>
                            </div>
                            <div className="p-4 bg-checkboard flex justify-center items-center overflow-auto max-h-[70vh]">
                                <img src={proofImage} alt="إيصال الدفع" className="max-w-full max-h-full object-contain rounded-lg" />
                            </div>
                            <div className="p-4 bg-[#111111] border-t border-white/10 flex justify-between items-center">
                                <a href={proofImage} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-2 px-4 py-2 bg-emerald-900/30 rounded-lg">
                                    <FiEye size={14} /> فتح الصورة بنافذة خارجية للتدقيق
                                </a>
                                <p className="text-[10px] text-gray-500">تم رفعه عبر العميل كإثبات سداد</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
