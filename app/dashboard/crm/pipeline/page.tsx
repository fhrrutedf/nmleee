'use client';

import { useState, useEffect } from 'react';
import { 
    FiDollarSign, FiPlus, FiCalendar, FiUser,
    FiPhone, FiMail, FiMessageSquare, FiChevronRight
} from 'react-icons/fi';

interface Deal {
    id: string;
    title: string;
    description?: string;
    value: number;
    currency: string;
    stage: string;
    probability: number;
    expectedCloseDate?: string;
    closedAt?: string;
    createdAt: string;
    contact: {
        id: string;
        name: string;
        email: string;
    };
    _count: {
        tasks: number;
        communications: number;
    };
}

const stages = [
    { id: 'lead', name: 'Lead', color: 'bg-yellow-500/20 border-yellow-500/30' },
    { id: 'qualified', name: 'مؤهل', color: 'bg-blue-500/20 border-blue-500/30' },
    { id: 'proposal', name: 'عرض سعر', color: 'bg-purple-500/20 border-purple-500/30' },
    { id: 'negotiation', name: 'تفاوض', color: 'bg-orange-500/20 border-orange-500/30' },
    { id: 'won', name: 'تم الفوز', color: 'bg-emerald-500/20 border-emerald-500/30' },
    { id: 'lost', name: 'تم الخسارة', color: 'bg-red-500/20 border-red-500/30' }
];

export default function CRMPipelinePage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/crm/deals');
            if (response.ok) {
                const data = await response.json();
                setDeals(data);
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageDeals = (stageId: string) => {
        return deals.filter(d => d.stage === stageId);
    };

    const getStageValue = (stageId: string) => {
        return getStageDeals(stageId).reduce((sum, d) => sum + d.value, 0);
    };

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = getStageValue('won');

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="border-b border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <FiDollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Pipeline المبيعات</h1>
                                <p className="text-sm text-gray-400">إدارة الفرص والصفقات</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium"
                        >
                            <FiPlus className="w-5 h-5" />
                            إضافة صفقة
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-gray-400">إجمالي الصفقات</p>
                        <p className="text-3xl font-bold text-white mt-1">{deals.length}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-gray-400">القيمة المتوقعة</p>
                        <p className="text-3xl font-bold text-white mt-1">${totalValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-emerald-400">القيمة المحققة</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">${wonValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-gray-400">معدل الفوز</p>
                        <p className="text-3xl font-bold text-white mt-1">
                            {deals.length > 0 ? Math.round((getStageDeals('won').length / deals.length) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Pipeline Board */}
            <div className="max-w-7xl mx-auto px-6 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-4 overflow-x-auto">
                        {stages.map((stage) => {
                            const stageDeals = getStageDeals(stage.id);
                            const stageValue = getStageValue(stage.id);
                            
                            return (
                                <div key={stage.id} className="min-w-[200px]">
                                    {/* Stage Header */}
                                    <div className={`p-4 rounded-xl border ${stage.color} mb-4`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-white">{stage.name}</h3>
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-sm text-white">
                                                {stageDeals.length}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">${stageValue.toLocaleString()}</p>
                                    </div>

                                    {/* Deals */}
                                    <div className="space-y-3">
                                        {stageDeals.map((deal) => (
                                            <div 
                                                key={deal.id}
                                                className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium text-white text-sm line-clamp-2">
                                                        {deal.title}
                                                    </h4>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                        <span className="text-xs text-emerald-400">
                                                            {deal.contact.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 truncate">
                                                        {deal.contact.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-white">
                                                        ${deal.value.toLocaleString()}
                                                    </span>
                                                    {deal.probability > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            {deal.probability}%
                                                        </span>
                                                    )}
                                                </div>

                                                {deal.expectedCloseDate && deal.stage !== 'won' && deal.stage !== 'lost' && (
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                        <FiCalendar className="w-3 h-3" />
                                                        <span>
                                                            {new Date(deal.expectedCloseDate).toLocaleDateString('ar-EG')}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FiPhone className="w-3 h-3" />
                                                        {deal._count.communications}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FiMessageSquare className="w-3 h-3" />
                                                        {deal._count.tasks}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
