'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiRefreshCw, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface User {
    id: string;
    name: string | null;
    email: string;
    planType: string;
    planExpiresAt: string | null;
    createdAt: string;
    _count: { subscriptions: number };
}

interface Stats {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
    byPlan: { FREE: number; GROWTH: number; PRO: number; AGENCY: number };
}

const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-gray-600/30 text-gray-300',
    GROWTH: 'bg-blue-600/30 text-blue-300',
    PRO: 'bg-emerald-600/30 text-emerald-300',
    AGENCY: 'bg-purple-600/30 text-purple-300'
};

export default function AdminSubscriptionsManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => { fetchSubscriptions(); }, [filter]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/subscriptions?filter=${filter}`);
            const data = await res.json();
            if (res.ok) { setUsers(data.users); setStats(data.stats); }
        } catch { showToast.error('فشل جلب البيانات'); }
        finally { setLoading(false); }
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}/subscription`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType: editingUser.planType, planExpiresAt: editingUser.planExpiresAt })
            });
            if (res.ok) { showToast.success('تم التحديث'); setEditingUser(null); fetchSubscriptions(); }
        } catch { showToast.error('فشل التحديث'); }
    };

    const handleCancel = async (userId: string) => {
        if (!confirm('إلغاء الاشتراك؟')) return;
        try {
            const res = await fetch(`/api/admin/users/${userId}/subscription`, { method: 'DELETE' });
            if (res.ok) { showToast.success('تم الإلغاء'); fetchSubscriptions(); }
        } catch { showToast.error('فشل الإلغاء'); }
    };

    const getStatus = (user: User) => {
        if (!user.planExpiresAt) return { label: 'منتهي', color: 'bg-red-600/30 text-red-300' };
        const days = Math.floor((new Date(user.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { label: 'منتهي', color: 'bg-red-600/30 text-red-300' };
        if (days <= 7) return { label: `${days} يوم`, color: 'bg-yellow-600/30 text-yellow-300' };
        return { label: 'نشط', color: 'bg-emerald-600/30 text-emerald-300' };
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiUsers className="text-emerald-400" />
                    الاشتراكات
                </h1>
                <button onClick={fetchSubscriptions} className="p-2 text-gray-400 hover:text-white">
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#111] p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-gray-500">المشتركين</div>
                    </div>
                    <div className="bg-[#111] p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
                        <div className="text-xs text-gray-500">النشطين</div>
                    </div>
                    <div className="bg-[#111] p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.expiringSoon}</div>
                        <div className="text-xs text-gray-500">تنتهي قريباً</div>
                    </div>
                    <div className="bg-[#111] p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
                        <div className="text-xs text-gray-500">المنتهية</div>
                    </div>
                </div>
            )}

            {/* Plans */}
            {stats && (
                <div className="flex gap-2">
                    {Object.entries(stats.byPlan).map(([plan, count]) => (
                        <div key={plan} className={`flex-1 p-2 rounded-lg text-center ${PLAN_COLORS[plan]}`}>
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs opacity-70">{plan}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'active', 'expiring', 'expired'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            filter === f ? 'bg-emerald-600 text-white' : 'bg-[#111] text-gray-400 hover:bg-[#222]'
                        }`}
                    >
                        {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : f === 'expiring' ? 'ينتهي قريباً' : 'منتهي'}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
            ) : users.length === 0 ? (
                <div className="text-center py-10 text-gray-500">لا يوجد مشتركين</div>
            ) : (
                <div className="bg-[#111] rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1a1a1a] text-xs text-gray-500">
                            <tr>
                                <th className="py-2 px-3 text-right">المستخدم</th>
                                <th className="py-2 px-3 text-center">الباقة</th>
                                <th className="py-2 px-3 text-center">الحالة</th>
                                <th className="py-2 px-3 text-center">الانتهاء</th>
                                <th className="py-2 px-3 text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => {
                                const status = getStatus(user);
                                return (
                                    <tr key={user.id} className="hover:bg-white/5">
                                        <td className="py-2 px-3">
                                            <div className="font-medium text-white">{user.name || 'بدون اسم'}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${PLAN_COLORS[user.planType]}`}>
                                                {user.planType}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center text-gray-400 text-xs">
                                            {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('ar-SA') : '-'}
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setEditingUser(user)} className="p-1.5 text-emerald-400 hover:bg-emerald-600/20 rounded">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button onClick={() => handleCancel(user.id)} className="p-1.5 text-red-400 hover:bg-red-600/20 rounded">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] rounded-lg w-full max-w-sm">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="font-bold text-white">تعديل اشتراك</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white"><FiX size={18} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">الباقة</label>
                                <select 
                                    value={editingUser.planType}
                                    onChange={e => setEditingUser({...editingUser, planType: e.target.value})}
                                    className="w-full bg-[#222] border border-white/10 rounded px-3 py-2 text-white text-sm"
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="GROWTH">GROWTH</option>
                                    <option value="PRO">PRO</option>
                                    <option value="AGENCY">AGENCY</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">تاريخ الانتهاء</label>
                                <input 
                                    type="datetime-local" 
                                    value={editingUser.planExpiresAt ? new Date(editingUser.planExpiresAt).toISOString().slice(0, 16) : ''}
                                    onChange={e => setEditingUser({...editingUser, planExpiresAt: e.target.value})}
                                    className="w-full bg-[#222] border border-white/10 rounded px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 flex gap-2">
                            <button onClick={handleUpdate} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-sm font-medium">حفظ</button>
                            <button onClick={() => setEditingUser(null)} className="flex-1 bg-[#222] hover:bg-[#333] text-gray-400 py-2 rounded text-sm font-medium">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
