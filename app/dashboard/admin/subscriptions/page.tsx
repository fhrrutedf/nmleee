'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiCalendar, FiDollarSign, FiAlertCircle, FiCheckCircle, FiTrendingUp, FiX } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface User {
    id: string;
    name: string | null;
    email: string;
    planType: string;
    planExpiresAt: string | null;
    image: string | null;
    createdAt: string;
    _count: {
        subscriptions: number;
    };
}

interface Stats {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
    byPlan: {
        FREE: number;
        GROWTH: number;
        PRO: number;
        AGENCY: number;
    };
}

export default function AdminSubscriptionsManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, expired, expiring
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchSubscriptions();
    }, [filter]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/subscriptions?filter=${filter}`);
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
                setStats(data.stats);
            } else {
                showToast.error(data.error || 'فشل جلب البيانات');
            }
        } catch (error) {
            showToast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleUpdateSubscription = async () => {
        if (!editingUser) return;
        
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}/subscription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType: editingUser.planType,
                    planExpiresAt: editingUser.planExpiresAt
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast.success('تم تحديث الاشتراك بنجاح');
                setIsEditModalOpen(false);
                setEditingUser(null);
                fetchSubscriptions();
            } else {
                showToast.error(data.error || 'فشل التحديث');
            }
        } catch (error) {
            showToast.error('حدث خطأ');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelSubscription = async (userId: string) => {
        if (!confirm('هل أنت متأكد من إلغاء اشتراك هذا المستخدم؟ سيتم إعادته للباقة المجانية.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/subscription`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (res.ok) {
                showToast.success('تم إلغاء الاشتراك');
                fetchSubscriptions();
            } else {
                showToast.error(data.error || 'فشل الإلغاء');
            }
        } catch (error) {
            showToast.error('حدث خطأ');
        }
    };

    const getStatusColor = (user: User) => {
        if (!user.planExpiresAt) return 'bg-gray-500/20 text-gray-400';
        const expiry = new Date(user.planExpiresAt);
        const now = new Date();
        const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (expiry < now) return 'bg-red-500/20 text-red-400';
        if (daysLeft <= 7) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-green-500/20 text-green-400';
    };

    const getStatusText = (user: User) => {
        if (!user.planExpiresAt) return 'لا توجد صلاحية';
        const expiry = new Date(user.planExpiresAt);
        const now = new Date();
        const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (expiry < now) return 'منتهي';
        if (daysLeft <= 7) return `ينتهي بعد ${daysLeft} أيام`;
        return 'نشط';
    };

    const getPlanTypeColor = (planType: string) => {
        switch (planType) {
            case 'FREE': return 'bg-gray-500/20 text-gray-400';
            case 'GROWTH': return 'bg-blue-500/20 text-blue-400';
            case 'PRO': return 'bg-emerald-500/20 text-emerald-400';
            case 'AGENCY': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0A0A0A] p-8 rounded-xl shadow-lg shadow-[#10B981]/20 border border-white/10">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-900/30 rounded-xl text-[#10B981]">
                        <FiUsers className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إدارة اشتراكات المستخدمين</h1>
                        <p className="text-gray-500 text-sm mt-1">مراقبة، ترقية، وإدارة باقات المشتركين</p>
                    </div>
                </div>
                <button 
                    onClick={fetchSubscriptions}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-[#10B981] rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} /> تحديث
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-bold uppercase">إجمالي المشتركين</span>
                            <FiUsers className="text-[#10B981]" />
                        </div>
                        <div className="text-3xl font-black text-white">{stats.total}</div>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-bold uppercase">الاشتراكات النشطة</span>
                            <FiCheckCircle className="text-green-400" />
                        </div>
                        <div className="text-3xl font-black text-green-400">{stats.active}</div>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-bold uppercase">تنتهي قريباً</span>
                            <FiAlertCircle className="text-yellow-400" />
                        </div>
                        <div className="text-3xl font-black text-yellow-400">{stats.expiringSoon}</div>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-bold uppercase">المنتهية</span>
                            <FiCalendar className="text-red-400" />
                        </div>
                        <div className="text-3xl font-black text-red-400">{stats.expired}</div>
                    </div>
                </div>
            )}

            {/* Plan Distribution */}
            {stats && (
                <div className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FiTrendingUp className="text-[#10B981]" /> توزيع الباقات
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-500/10 rounded-xl">
                            <div className="text-2xl font-black text-gray-400">{stats.byPlan.FREE}</div>
                            <div className="text-xs text-gray-500 mt-1">مجاني</div>
                        </div>
                        <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                            <div className="text-2xl font-black text-blue-400">{stats.byPlan.GROWTH}</div>
                            <div className="text-xs text-gray-500 mt-1">نمو</div>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 rounded-xl">
                            <div className="text-2xl font-black text-emerald-400">{stats.byPlan.PRO}</div>
                            <div className="text-xs text-gray-500 mt-1">احترافي</div>
                        </div>
                        <div className="text-center p-4 bg-purple-500/10 rounded-xl">
                            <div className="text-2xl font-black text-purple-400">{stats.byPlan.AGENCY}</div>
                            <div className="text-xs text-gray-500 mt-1">وكالة</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'الكل', count: stats?.total },
                    { id: 'active', label: 'نشط', count: stats?.active },
                    { id: 'expiring', label: 'ينتهي قريباً', count: stats?.expiringSoon },
                    { id: 'expired', label: 'منتهي', count: stats?.expired },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            filter === tab.id 
                                ? 'bg-[#10B981] text-black' 
                                : 'bg-emerald-800 text-gray-300 hover:bg-emerald-700'
                        }`}
                    >
                        {tab.label} {tab.count !== undefined && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                    لا يوجد مشتركين بهذا التصنيف
                </div>
            ) : (
                <div className="bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#111111] border-b border-white/10">
                            <tr>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">المستخدم</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">الباقة</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">الحالة</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">تاريخ الانتهاء</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center text-gray-400">
                                                {user.name ? user.name[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.name || 'بدون اسم'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getPlanTypeColor(user.planType)}`}>
                                            {user.planType}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(user)}`}>
                                            {getStatusText(user)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-400">
                                        {user.planExpiresAt 
                                            ? new Date(user.planExpiresAt).toLocaleDateString('ar-SA')
                                            : '-'
                                        }
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-2 bg-emerald-800 text-[#10B981] rounded-lg hover:bg-emerald-700 transition-colors"
                                                title="تعديل الاشتراك"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleCancelSubscription(user.id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                title="إلغاء الاشتراك"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] rounded-xl border border-[#10B981]/30 shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">✏️ تعديل اشتراك</h3>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">المستخدم</label>
                                <div className="text-white font-bold">{editingUser.name || editingUser.email}</div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">الباقة</label>
                                <select 
                                    value={editingUser.planType}
                                    onChange={e => setEditingUser({...editingUser, planType: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                >
                                    <option value="FREE">FREE (مجاني)</option>
                                    <option value="GROWTH">GROWTH (نمو)</option>
                                    <option value="PRO">PRO (احترافي)</option>
                                    <option value="AGENCY">AGENCY (وكالة)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">تاريخ الانتهاء</label>
                                <input 
                                    type="datetime-local" 
                                    value={editingUser.planExpiresAt ? new Date(editingUser.planExpiresAt).toISOString().slice(0, 16) : ''}
                                    onChange={e => setEditingUser({...editingUser, planExpiresAt: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">اتركه فارغاً لإزالة تاريخ الانتهاء</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button 
                                onClick={handleUpdateSubscription}
                                disabled={updating}
                                className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {updating ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'حفظ التغييرات'}
                            </button>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 bg-emerald-800 text-gray-300 hover:bg-gray-700 font-bold py-3 rounded-lg transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
