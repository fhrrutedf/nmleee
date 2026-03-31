'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiSave, FiTag, FiCheckCircle, FiActivity } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    isActive: boolean;
    planType: string;
    _count?: {
        subscriptions: number;
    };
}

export default function AdminPlansManagement() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    
    // New Plan Form State
    const [newPlan, setNewPlan] = useState({
        name: '',
        description: '',
        price: 0,
        interval: 'month',
        features: ['إضافة كورسات غير محدودة'],
        isActive: true,
        planType: 'GROWTH'
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans');
            const data = await res.json();
            if (res.ok) {
                setPlans(data);
            }
        } catch (error) {
            showToast.error('فشل جلب باقات الاشتراك');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlan.name || newPlan.price < 0) {
            showToast.error('الرجاء التأكد من اسم الباقة والسعر');
            return;
        }
        
        setCreating(true);
        try {
            const res = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlan)
            });
            
            if (res.ok) {
                showToast.success('تم إنشاء الباقة بنجاح');
                setNewPlan({ name: '', description: '', price: 0, interval: 'month', features: [''], isActive: true, planType: 'GROWTH' });
                fetchPlans(); // Refresh the list
            } else {
                const data = await res.json();
                showToast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            showToast.error('فشل في الاتصال لتوليد الباقة');
        } finally {
            setCreating(false);
        }
    };

    const handleFeatureChange = (index: number, val: string) => {
        const feats = [...newPlan.features];
        feats[index] = val;
        setNewPlan({ ...newPlan, features: feats });
    };

    const addFeatureField = () => {
        setNewPlan({ ...newPlan, features: [...newPlan.features, ''] });
    };

    const removeFeatureField = (index: number) => {
        const feats = newPlan.features.filter((_, i) => i !== index);
        setNewPlan({ ...newPlan, features: feats });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0A0A0A] dark:bg-gray-900 p-8 rounded-xl shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-900/30 rounded-xl text-[#10B981]">
                        <FiTag className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">إدارة باقات الاشتراك السحابية (SaaS)</h1>
                        <p className="text-gray-500 text-sm mt-1">قم بتصميم الميزات والتسعير لبيع المنصة للمدربين والتجار</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Available Plans List */}
                <div className="lg:col-span-8 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiActivity className="text-[#10B981]" /> الباقات المُصدرة حالياً ({plans.length})
                    </h2>
                    
                    {plans.length === 0 ? (
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            لا يوجد باقات حالياً. قم بإنشاء إحداها لبدء بيع العضويات!
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id} className="bg-[#0A0A0A] p-6 rounded-xl border border-white/10 hover:border-[#10B981]/50 transition-colors relative shadow-lg">
                                    {!plan.isActive && <div className="absolute top-4 left-4 text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold">معطلة</div>}
                                    
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1 h-10">{plan.description}</p>
                                    </div>
                                    
                                    <div className="text-3xl font-black text-[#10B981] mb-6">
                                        ${plan.price} <span className="text-sm text-gray-500 font-normal">/ {plan.interval === 'month' ? 'شهر' : 'سنة'}</span>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1 min-h-[120px]">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex gap-2 text-sm text-gray-300">
                                                <FiCheckCircle className="text-[#10B981] mt-1 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                                        <div className="text-xs text-gray-500 font-bold">
                                            المدربون المشتركون
                                        </div>
                                        <div className="text-[#10B981] font-black font-mono bg-emerald-900/30 px-3 py-1 rounded">
                                            {plan._count?.subscriptions || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Plan Creation Widget */}
                <div className="lg:col-span-4">
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#10B981]/30 shadow-lg shadow-[#10B981]/10 sticky top-8">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">📝 بناء باقة جديدة</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">اسم الباقة (مثال: Growth)</label>
                                <input 
                                    type="text" 
                                    value={newPlan.name}
                                    onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">نوع الباقة (PlanType)</label>
                                <select 
                                    value={newPlan.planType}
                                    onChange={e => setNewPlan({...newPlan, planType: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                >
                                    <option value="FREE">FREE (مجاني)</option>
                                    <option value="GROWTH">GROWTH (نمو)</option>
                                    <option value="PRO">PRO (احترافي)</option>
                                    <option value="AGENCY">AGENCY (وكالة)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">السعر (USD)</label>
                                <input 
                                    type="number" 
                                    value={newPlan.price}
                                    onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-left font-mono focus:border-[#10B981] outline-none"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">دورة التجديد</label>
                                <select 
                                    value={newPlan.interval}
                                    onChange={e => setNewPlan({...newPlan, interval: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                >
                                    <option value="month">شهري (Month)</option>
                                    <option value="year">سنوي (Year)</option>
                                    <option value="lifetime">مدى الحياة (Lifetime)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-2">الوصف السريع</label>
                                <input 
                                    type="text" 
                                    value={newPlan.description}
                                    onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#10B981] outline-none"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-400 block mb-2 flex items-center justify-between">
                                    <span>الميزات المدرجة</span>
                                    <button onClick={addFeatureField} className="text-[#10B981] hover:text-emerald-400 text-xs bg-emerald-900/30 px-2 py-1 rounded flex items-center gap-1">
                                        <FiPlus /> إضافة
                                    </button>
                                </label>
                                <div className="space-y-2">
                                    {newPlan.features.map((feat, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={feat}
                                                onChange={e => handleFeatureChange(idx, e.target.value)}
                                                placeholder="مثال: إنشاء 5 كورسات"
                                                className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#10B981] outline-none"
                                            />
                                            {idx > 0 && (
                                                <button onClick={() => removeFeatureField(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg shrink-0">
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleCreatePlan}
                            disabled={creating}
                            className="w-full mt-6 bg-[#10B981] hover:bg-emerald-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {creating ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <FiSave />}
                            تنشيط وإطلاق الباقة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
