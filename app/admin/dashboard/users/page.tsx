'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    FiShield
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
    _count: {
        products: number;
        sellerOrders: number;
        orders: number;
    };
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

    const fetchUsers = async () => {
        setLoading(true);
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

    return (
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-primary-charcoal dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-action-blue/10 text-action-blue flex items-center justify-center">
                            <FiUsers />
                        </div>
                        إدارة المستخدمين
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        عرض، بحث، والتحكم في حسابات البائعين والعملاء.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-gray-400 text-xs">إجمالي</span>
                        <span className="text-primary-charcoal dark:text-white text-lg">{stats.totalUsers}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-purple-500 text-xs">بائع نشط</span>
                        <span className="text-purple-600 dark:text-purple-400 text-lg">{stats.activeSellers}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-green-500 text-xs">عميل</span>
                        <span className="text-green-600 dark:text-green-400 text-lg">{stats.totalCustomers}</span>
                    </div>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="bg-white dark:bg-card-white rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
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
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/50 focus:border-action-blue transition-all text-primary-charcoal dark:text-white"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-action-blue transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            <FiFilter className="text-action-blue" />
                            الفئة:
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-primary-charcoal dark:text-white cursor-pointer pr-4"
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
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-action-blue rounded-full animate-spin mb-4"></div>
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
                                                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700" alt={user.name} />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        {user.isVerified && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-card-white rounded-full p-0.5" title="حساب موثق">
                                                                <FiCheckCircle className="text-blue-500 w-4 h-4" />
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
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    user.role === 'SELLER' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
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
                                                        <span className="text-action-blue" title="إجمالي الأرباح">${user.totalEarnings.toFixed(2)}</span>
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
                                                    <button className="p-2 rounded-lg text-gray-400 hover:text-action-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                        <FiMoreVertical size={18} />
                                                    </button>
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
    );
}
