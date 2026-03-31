'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    FiUsers, FiPlus, FiSearch, FiFilter, FiTag, 
    FiPhone, FiMail, FiMoreVertical, FiEdit2, FiTrash2,
    FiDollarSign, FiClipboard, FiMessageSquare
} from 'react-icons/fi';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: string;
    source: string;
    notes?: string;
    lastContactedAt?: string;
    createdAt: string;
    tags: { id: string; name: string; color: string }[];
    _count: {
        deals: number;
        tasks: number;
        communications: number;
    };
}

const statusColors: Record<string, string> = {
    lead: 'bg-yellow-500/20 text-yellow-400',
    prospect: 'bg-blue-500/20 text-blue-400',
    customer: 'bg-emerald-500/20 text-emerald-400',
    churned: 'bg-red-500/20 text-red-400'
};

const statusLabels: Record<string, string> = {
    lead: 'lead محتمل',
    prospect: ' prospect مهتم',
    customer: 'عميل',
    churned: 'متوقف'
};

export default function CRMContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [statusFilter]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter) params.append('status', statusFilter);
            
            const response = await fetch(`/api/crm/contacts?${params}`);
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchContacts();
    };

    const stats = {
        total: contacts.length,
        leads: contacts.filter(c => c.status === 'lead').length,
        prospects: contacts.filter(c => c.status === 'prospect').length,
        customers: contacts.filter(c => c.status === 'customer').length
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="border-b border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <FiUsers className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">جهات الاتصال</h1>
                                <p className="text-sm text-gray-400">إدارة عملائك وال prospects</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium"
                        >
                            <FiPlus className="w-5 h-5" />
                            إضافة جهة اتصال
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-gray-400">الإجمالي</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-yellow-400">Leads</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.leads}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-blue-400">Prospects</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.prospects}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-emerald-400">العملاء</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.customers}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-6 pb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="البحث بالاسم أو البريد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                    >
                        <option value="">كل الحالات</option>
                        <option value="lead">Lead</option>
                        <option value="prospect">Prospect</option>
                        <option value="customer">عميل</option>
                        <option value="churned">متوقف</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-[#111111] border border-white/10 rounded-xl text-white hover:border-emerald-500/50 transition-colors"
                    >
                        <FiFilter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Contacts List */}
            <div className="max-w-7xl mx-auto px-6 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-500"></div>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-20">
                        <FiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">لا توجد جهات اتصال</h3>
                        <p className="text-gray-400 mb-6">ابدأ بإضافة جهات اتصال جديدة</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
                        >
                            إضافة جهة اتصال
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">جهة الاتصال</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الوسوم</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الأنشطة</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">آخر تواصل</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((contact) => (
                                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                                                    <span className="text-emerald-400 font-semibold">
                                                        {contact.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{contact.name}</p>
                                                    <p className="text-sm text-gray-400">{contact.email}</p>
                                                    {contact.company && (
                                                        <p className="text-xs text-gray-500">{contact.company}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                                                {statusLabels[contact.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {contact.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-0.5 rounded text-xs"
                                                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {contact.tags.length > 3 && (
                                                    <span className="px-2 py-0.5 rounded text-xs text-gray-400">
                                                        +{contact.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <FiDollarSign className="w-4 h-4" />
                                                    {contact._count.deals}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiClipboard className="w-4 h-4" />
                                                    {contact._count.tasks}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiMessageSquare className="w-4 h-4" />
                                                    {contact._count.communications}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-400">
                                                {contact.lastContactedAt 
                                                    ? new Date(contact.lastContactedAt).toLocaleDateString('ar-EG')
                                                    : 'لم يتم التواصل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                    <FiEdit2 className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                    <FiTrash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
