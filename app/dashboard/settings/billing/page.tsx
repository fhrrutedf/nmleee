'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiActivity, FiArrowLeft, FiClock } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
}

interface UserSubscription {
    status: string;
    currentPeriodEnd: string;
    plan: {
        id: string;
        name: string;
    };
}

export default function SellerBillingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch public plans listed on platform
                const resPlans = await fetch('/api/plans/public');
                if (resPlans.ok) {
                    const data = await resPlans.json();
                    setPlans(data);
                }

                // Fetch user's current subscription
                const resSub = await fetch('/api/user/subscription');
                if (resSub.ok) {
                    const dataSub = await resSub.json();
                    // if they have active sub
                    if (dataSub && dataSub.id) {
                        setCurrentSub(dataSub);
                    }
                }
            } catch (error) {
                console.error("Error loading billing data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        sessionStorage.setItem('direct_checkout_items', JSON.stringify([{
            itemType: 'subscription',
            productId: plan.id, // Using productId to hold planId to avoid schema breaks
            planId: plan.id,
            price: plan.price,
            title: `اشتراك منصة - ${plan.name}`,
            sellerId: 'platform' // Flags this as a platform payment
        }]));
        router.push(`/checkout?direct=true`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Context Widget - Current Sub */}
            <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">الفواتير والاشتراكات</h1>
                    <p className="text-gray-400">تحكم بباقة متجرك وميزاته الأساسية والمتقدمة</p>
                </div>
                
                {currentSub ? (
                    <div className="bg-[#111] border border-[#10B981]/30 px-6 py-4 rounded-xl text-left rtl:text-right w-full md:w-auto flex items-center gap-6">
                        <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">الخطة الحالية المفعّلة</p>
                            <h3 className="text-xl font-black text-[#10B981]">{currentSub.plan.name}</h3>
                        </div>
                        <div className="w-px h-10 bg-white/10 mx-2"></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">تاريخ التجديد</p>
                            <div className="flex items-center gap-2 text-white font-mono font-bold">
                                <FiClock className="text-[#10B981]" />
                                {new Date(currentSub.currentPeriodEnd).toLocaleDateString('en-GB')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-900/10 border border-red-500/30 px-6 py-4 rounded-xl text-red-500 flex items-center gap-3">
                        <FiActivity className="text-xl" />
                        <div>
                            <p className="font-bold">حسابك لا يمتلك أي اشتراك نشط</p>
                            <p className="text-xs text-red-400 mt-1">يجب تفعيل باقة لتبدأ بإضافة وبيع منتجاتك</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Table */}
            <div>
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">باقات مصممة لنمو تجارتك 🚀</h2>
                    <p className="text-gray-400 text-lg">لا عمولات خفية. اختر الخطة التي تناسب حجم مبيعاتك.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const isCurrent = currentSub?.plan?.id === plan.id;
                        return (
                            <div 
                                key={plan.id} 
                                className={`relative flex flex-col bg-[#0A0A0A] rounded-3xl p-8 border hover:-translate-y-2 transition-transform duration-300 shadow-xl ${
                                    plan.price > 0 ? 'border-[#10B981]/50 shadow-[#10B981]/10' : 'border-white/10'
                                }`}
                            >
                                {plan.price > 0 && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-black text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full">
                                        الخيار الأمثل
                                    </div>
                                )}
                                
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{plan.description}</p>
                                </div>
                                
                                <div className="mb-8 border-b border-white/10 pb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white">${plan.price}</span>
                                        <span className="text-gray-500 font-bold">/ {plan.interval === 'month' ? 'شهر' : 'سنة'}</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-3 text-gray-300">
                                            <FiCheckCircle className="text-[#10B981] text-lg shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={isCurrent}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        isCurrent 
                                            ? 'bg-white/5 text-gray-400 cursor-not-allowed border border-white/10' 
                                            : plan.price > 0
                                                ? 'bg-[#10B981] text-black hover:bg-emerald-400 shadow-lg shadow-[#10B981]/20'
                                                : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {isCurrent ? 'باقتك الحالية ✔️' : 'اشترك الآن'}
                                    {!isCurrent && <FiArrowLeft />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
