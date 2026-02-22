'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiPackage,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiPlayCircle,
    FiImage,
    FiEyeOff
} from 'react-icons/fi';
import Link from 'next/link';

interface ProductData {
    id: string;
    title: string;
    price: number;
    isActive: boolean;
    isFree: boolean;
    createdAt: string;
    itemType: 'PRODUCT' | 'COURSE';
    soldCount?: number;
    user: {
        name: string;
        email: string;
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

export default function ProductsManagement() {
    const { data: session } = useSession();
    const router = useRouter();

    const [items, setItems] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        totalItems: 0,
        totalProducts: 0,
        totalCourses: 0,
        activeItems: 0
    });

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchItems();
    }, [session, page, typeFilter, statusFilter, searchQuery]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/admin/products', window.location.origin);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', '10');
            url.searchParams.append('type', typeFilter);
            url.searchParams.append('status', statusFilter);
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setItems(data.items);
                setTotalPages(data.pagination.totalPages);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchItems();
    };

    const toggleItemStatus = async (itemId: string, itemType: string, currentStatus: boolean) => {
        // API call to toggle status
        alert(`جاري العمل على هذه الميزة: تغيير حالة ${itemType === 'PRODUCT' ? 'المنتج' : 'الدورة'} ${itemId}`);
    };

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
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                            <FiPackage />
                        </div>
                        إدارة المحتوى والمنتجات
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium ml-14">
                        مراجعة، تعليق، ومتابعة المنتجات والدورات المعروضة على المنصة.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden text-sm font-bold divide-x divide-x-reverse divide-gray-100 dark:divide-gray-800">
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-gray-400 text-xs">إجمالي</span>
                        <span className="text-primary-charcoal dark:text-white text-lg">{stats.totalItems}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-action-blue text-xs">منتج رقمي</span>
                        <span className="text-blue-600 dark:text-blue-400 text-lg">{stats.totalProducts}</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center">
                        <span className="text-purple-500 text-xs">دورة تدريبية</span>
                        <span className="text-purple-600 dark:text-purple-400 text-lg">{stats.totalCourses}</span>
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
                            placeholder="ابحث باسم المنتج أو الدورة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-primary-charcoal dark:text-white"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors">
                            <FiSearch size={18} />
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {/* Type Filter */}
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            <FiFilter className="text-purple-500" />
                            النوع:
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-primary-charcoal dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="PRODUCT">منتجات رقمية</option>
                                <option value="COURSE">دورات</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                            الحالة:
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="bg-transparent border-none focus:outline-none text-primary-charcoal dark:text-white cursor-pointer pr-4"
                            >
                                <option value="ALL">الكل</option>
                                <option value="ACTIVE">نشط ومعروض</option>
                                <option value="INACTIVE">موقوف</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {loading && items.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                            جاري تحميل المحتوى...
                        </div>
                    ) : (
                        <table className="w-full text-right whitespace-nowrap">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50">
                                    <th className="font-bold py-4 px-6">المنتج / الدورة</th>
                                    <th className="font-bold py-4 px-6">البائع</th>
                                    <th className="font-bold py-4 px-6 text-center">السعر</th>
                                    <th className="font-bold py-4 px-6 text-center">المبيعات</th>
                                    <th className="font-bold py-4 px-6 text-center">الحالة</th>
                                    <th className="font-bold py-4 px-6 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <FiPackage size={48} className="mb-4 text-gray-200 dark:text-gray-800" />
                                                <p className="font-bold">لم يتم العثور على محتوى مطول للبحث</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <motion.tr variants={itemVariants} key={item.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.itemType === 'COURSE' ? 'bg-purple-50 text-purple-500 dark:bg-purple-900/20' : 'bg-blue-50 text-action-blue dark:bg-blue-900/20'}`}>
                                                        {item.itemType === 'COURSE' ? <FiPlayCircle size={20} /> : <FiImage size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                                                            {item.title}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 font-bold tracking-widest uppercase">
                                                            {item.itemType === 'COURSE' ? 'دورة تدريبية' : 'منتج رقمي'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-700 dark:text-gray-300">
                                                    {item.user.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.user.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {item.isFree ? (
                                                    <span className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs">مجاني</span>
                                                ) : (
                                                    <span className="font-black text-primary-charcoal dark:text-white">${item.price.toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-bold text-gray-500">
                                                {item.soldCount || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${item.isActive
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {item.isActive ? 'معروض' : 'مخفي/موقوف'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={item.itemType === 'COURSE' ? `/course/${item.id}` : `/product/${item.id}`}
                                                        target="_blank"
                                                        className="p-2 rounded-lg text-gray-400 hover:text-action-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="عرض في المتجر"
                                                    >
                                                        <FiEyeOff size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleItemStatus(item.id, item.itemType, item.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${item.isActive
                                                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            }`}
                                                        title={item.isActive ? 'إخفاء أو إيقاف المحتوى' : 'تفعيل وعرض المحتوى'}
                                                    >
                                                        {item.isActive ? <FiXCircle size={18} /> : <FiCheckCircle size={18} />}
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
