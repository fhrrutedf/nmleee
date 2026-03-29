'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    isActive: boolean;
    _count: {
        subscriptions: number;
    };
}

export default function SubscriptionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            fetchPlans();
        }
    }, [status, router]);

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/subscriptions/plans');
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;

        try {
            const response = await fetch(`/api/subscriptions/plans/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPlans();
            } else {
                const data = await response.json();
                toast.error(data.error || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-ink"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111111] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">خطط الاشتراك</h1>
                        <p className="mt-2 text-gray-400">
                            أنشئ خطط اشتراك شهرية أو سنوية للوصول إلى محتواك
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/subscriptions/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 text-white transition-colors"
                    >
                        <FiPlus />
                        خطة جديدة
                    </button>
                </div>

                {/* Plans Grid */}
                {plans.length === 0 ? (
                    <div className="text-center py-12 bg-[#0A0A0A] rounded-lg shadow">
                        <div className="text-gray-400 text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            لا توجد خطط اشتراك
                        </h3>
                        <p className="text-gray-400 mb-6">
                            ابدأ بإنشاء خطة اشتراك لتقديم محتوى حصري لمشتركيك
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/subscriptions/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 text-white transition-colors"
                        >
                            <FiPlus />
                            إنشاء خطة جديدة
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-[#0A0A0A] rounded-lg shadow-md p-6 hover:shadow-lg shadow-[#10B981]/20 transition-shadow"
                            >
                                {/* Plan Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-xl ${plan.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-emerald-800 text-gray-800'
                                            }`}
                                    >
                                        {plan.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-[#10B981]">
                                            {plan.price} $
                                        </span>
                                        <span className="text-gray-400">
                                            / {plan.interval === 'month' ? 'شهر' : 'سنة'}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">المميزات:</h4>
                                    <ul className="space-y-1">
                                        {plan.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                                                <span className="text-green-500 mt-1">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-sm text-gray-500">
                                                +{plan.features.length - 3} مميزات أخرى
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <FiUsers className="text-[#10B981]" />
                                        <span>{plan._count.subscriptions} مشترك</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push(`/dashboard/subscriptions/${plan.id}/edit`)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <FiEdit2 size={16} />
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => deletePlan(plan.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
