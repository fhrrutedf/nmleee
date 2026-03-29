'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiMail,
    FiActivity,
    FiShield,
    FiRefreshCw,
    FiAward
} from 'react-icons/fi';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    totalEarnings: number;
    planType?: string;
    _count: {
        products: number;
        sellerOrders: number;
        orders: number;
    };
    verificationRequests?: { id: string }[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function UsersManagement() {
    const { data: session } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Plan Modal State
    const [planModal, setPlanModal] = useState<{ userId: string; userName: string; currentPlan: string } | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('FREE');
    const [planDuration, setPlanDuration] = useState('1');
    const [savingPlan, setSavingPlan] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSellers: 0,
        totalCustomers: 0
    });

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchUsers();
    }, [session, page, roleFilter, searchQuery]); // Re-fetch when these change

    // Real-time polling
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchUsers(false); // Silent reload
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, session, page, roleFilter, searchQuery]);

    const fetchUsers = async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setIsRefreshing(true);
        try {
            const url = new URL('/api/admin/users', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('role', roleFilter);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchUsers();
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        // Implement status toggle API call in future task
        alert(`جاري العمل على هذه الميزة: تغيير حالة المستخدم ${userId}`);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openPlanModal = (user: UserData) => {
        setPlanModal({ userId: user.id, userName: user.name, currentPlan: user.planType || 'FREE' });
        setSelectedPlan(user.planType || 'FREE');
        setPlanDuration('1');
    };

    const savePlan = async () => {
        if (!planModal) return;
        setSavingPlan(true);
        try {
            const res = await fetch(`/api/admin/users/${planModal.userId}/plan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType: selectedPlan, durationMonths: planDuration }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ ${data.message}`);
                setPlanModal(null);
                fetchUsers(true);
            } else {
                alert(`❌ ${data.error}`);
            }
        } catch {
            alert('❌ حدث خطأ');
        } finally {
            setSavingPlan(false);
        }
    };

    const planBadge = (planType?: string) => {
        switch (planType) {
            case 'GROWTH': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-bold bg-accent-50 text-accent-600 dark:bg-blue-900/20 dark:text-blue-400">🚀 GROWTH</span>;
            case 'PRO': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-bold bg-purple-50 text-ink dark:bg-purple-900/20 dark:text-purple-400">👑 PRO</span>;
            default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">🆓 FREE</span>;
        }
    };

    return (
        <>
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-ink dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <FiUsers />
                        </div>
                        إدارة المستخدمين
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        عرض، بحث، والتحكم في حسابات البائعين والعملاء.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-gray-400 text-xs">إجمالي</span>
                        <span className="text-ink dark:text-white text-lg">{stats.totalUsers}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-purple-500 text-xs">بائع نشط</span>
                        <span className="text-ink dark:text-purple-400 text-lg">{stats.activeSellers}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-green-500 text-xs">عميل</span>
                        <span className="text-green-600 dark:text-green-400 text-lg">{stats.totalCustomers}</span>
                    </div>
                </div>

                {/* Auto Refresh Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`btn text-sm py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl transition-all ${autoRefresh ? 'bg-green-100 text-green-700 hover:bg-green-200 border-none' : 'border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50'}`}
                        title="تحديث تلقائي (لحظي)"
                    >
                        تحديث لحظي
                        {autoRefresh && <span className="relative flex h-2 w-2 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-xl h-2 w-2 bg-green-500"></span>
                        </span>}
                    </button>
                    <button onClick={() => fetchUsers(true)} className="btn bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                        <FiRefreshCw className={loading || isRefreshing ? 'animate-spin text-accent' : 'text-gray-500 w-4 h-4'} />
                    </button>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="bg-white dark:bg-card-white rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
            >
                {/* Controls Bar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col lg:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-ink dark:text-white"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            <FiFilter className="text-accent" />
                            الفئة:
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-ink dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الجميع</option>
                                <option value="SELLER">البائعين</option>
                                <option value="CUSTOMER">العملاء</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {loading && users.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-xl animate-spin mb-4"></div>
                            جاري تحميل حسابات المستخدمين...
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50">
                                    <th className="font-bold py-4 px-6">المستخدم</th>
                                    <th className="font-bold py-4 px-6">الدور</th>
                                    <th className="font-bold py-4 px-6 text-center">الإحصائيات</th>
                                    <th className="font-bold py-4 px-6 text-center">تاريخ الانضمام</th>
                                    <th className="font-bold py-4 px-6 text-center">الحالة</th>
                                    <th className="font-bold py-4 px-6 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiUsers size={48} className="mb-4 text-gray-200 dark:text-gray-800" />
                                                <p className="font-bold">لم يتم العثور على مستخدمين</p>
                                                <p className="text-sm">جرب تغيير شروط البحث أو الفلتر</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <motion.tr variants={itemVariants} key={user.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-700" alt={user.name} />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        {user.isVerified && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-card-white rounded-xl p-0.5" title="حساب موثق">
                                                                <FiCheckCircle className="text-accent-500 w-4 h-4" />
                                                            </div>
                                                        )}
                                                        {user.verificationRequests && user.verificationRequests.length > 0 && (
                                                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-xl p-0.5 " title="هناك طلب توثيق بانتظار المراجعة">
                                                                <FiActivity className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <FiMail size={12} /> {user.email}
                                                        </div>
                                                    </div>
                                                    {user.role === 'SELLER' && planBadge(user.planType)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    user.role === 'SELLER' ? 'bg-purple-50 text-ink dark:bg-purple-900/20 dark:text-purple-400' :
                                                        'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                                    }`}>
                                                    {user.role === 'ADMIN' && <FiShield size={10} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {user.role === 'SELLER' ? (
                                                    <div className="flex flex-col gap-1 items-center justify-center text-xs text-gray-500 font-bold">
                                                        <span title="مبيعات البائع">📦 {user._count.sellerOrders} طلب</span>
                                                        <span className="text-accent" title="إجمالي الأرباح">${user.totalEarnings.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-bold">
                                                        🛒 {user._count.orders} مشتريات
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-bold text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${user.isActive
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {user.isActive ? 'نشط' : 'موقوف'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {user.role === 'SELLER' && (
                                                        <button
                                                            onClick={() => openPlanModal(user)}
                                                            className="p-2 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                            title="إدارة الباقة"
                                                        >
                                                            <FiAward size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isActive
                                                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                            : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            }`}
                                                        title={user.isActive ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                                                    >
                                                        {user.isActive ? <FiXCircle size={18} /> : <FiCheckCircle size={18} />}
                                                    </button>
                                                    <button className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-accent-50 dark:hover:bg-blue-900/20 transition-colors">
                                                        <FiMoreVertical size={18} />
                                                    </button>
                                                    {user.verificationRequests && user.verificationRequests.length > 0 && (
                                                        <Link 
                                                            href="/dashboard/admin/verification" 
                                                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all font-bold text-xs"
                                                            title="مراجعة التوثيق"
                                                        >
                                                            مراجعة
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 flex justify-center mt-auto">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span className="text-sm font-bold text-gray-500 px-4">
                                صفحة {page} من {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>

        {/* Plan Management Modal */}
        {planModal && (
            <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4" onClick={() => setPlanModal(null)}>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-ink dark:text-white mb-2 flex items-center gap-2">
                        <FiAward className="text-purple-500" /> إدارة باقة المستخدم
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">{planModal.userName} — الباقة الحالية: <strong>{planModal.currentPlan}</strong></p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الباقة الجديدة</label>
                            <select
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="FREE">🆓 FREE — مجانية (عمولة 10%)</option>
                                <option value="GROWTH">🚀 GROWTH — رواد (عمولة 5%)</option>
                                <option value="PRO">👑 PRO — تميز (عمولة 2%)</option>
                            </select>
                        </div>

                        {selectedPlan !== 'FREE' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">مدة الاشتراك (شهور)</label>
                                <select
                                    value={planDuration}
                                    onChange={(e) => setPlanDuration(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="1">شهر واحد</option>
                                    <option value="3">3 أشهر</option>
                                    <option value="6">6 أشهر</option>
                                    <option value="12">سنة كاملة</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={savePlan}
                            disabled={savingPlan || selectedPlan === planModal.currentPlan}
                            className="flex-1 bg-ink text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingPlan ? 'جاري الحفظ...' : 'تحديث الباقة'}
                        </button>
                        <button
                            onClick={() => setPlanModal(null)}
                            className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
