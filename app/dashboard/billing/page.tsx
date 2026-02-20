import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiCalendar, FiClock, FiCreditCard } from 'react-icons/fi';
import CancelSubscriptionButton from './CancelSubscriptionButton';
import Link from 'next/link';

export const metadata = {
    title: 'إدارة الفواتير والاشتراكات | لوحة التحكم',
};

export default async function BillingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) redirect('/login');

    const subscriptions = await prisma.subscription.findMany({
        where: { customerId: user.id },
        include: { plan: true },
        orderBy: { createdAt: 'desc' }
    });

    const activeSubscription = subscriptions.find(s => ['active', 'trialing'].includes(s.status));
    const pastSubscriptions = subscriptions.filter(s => s.id !== activeSubscription?.id);

    // Format date properly
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">إدارة الباقات والاشتراكات</h1>

            {/* Current Active Subscription Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-action-blue/10 text-action-blue rounded-xl flex items-center justify-center">
                        <FiCreditCard className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">باقة الاشتراك الحالية</h2>
                        <p className="text-gray-500 text-sm">تفاصيل الخطة المفعلة حالياً على حسابك</p>
                    </div>
                </div>

                {activeSubscription ? (
                    <div className="border border-green-100 bg-green-50/30 rounded-xl p-6 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full -z-10 opacity-50"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{activeSubscription.plan.name}</h3>
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold leading-none flex items-center gap-1">
                                        <FiCheckCircle /> نشط
                                    </span>
                                </div>
                                <div className="text-gray-600 mb-4 whitespace-pre-wrap">{activeSubscription.plan.description}</div>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <FiCalendar className="text-action-blue" />
                                        <span>تاريخ البدء: {formatDate(activeSubscription.currentPeriodStart)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FiClock className="text-orange-500" />
                                        <span>التجديد/الانتهاء: {formatDate(activeSubscription.currentPeriodEnd)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-200">
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    ${activeSubscription.plan.price} <span className="text-sm text-gray-500 font-normal">/ {activeSubscription.plan.interval === 'month' ? 'شهرياً' : 'سنوياً'}</span>
                                </div>
                                <CancelSubscriptionButton
                                    subscriptionId={activeSubscription.id}
                                    isCanceled={activeSubscription.cancelAtPeriodEnd}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiXCircle className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">ليس لديك اشتراك نشط</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            أنت تستخدم الخطة المجانية حالياً. قم بترقية حزمة حسابك للاستفادة من كامل المميزات.
                        </p>
                        <Link
                            href="/pricing"
                            className="inline-block bg-action-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            تصفح خطط الأسعار
                        </Link>
                    </div>
                )}
            </div>

            {/* Past Subscriptions */}
            {pastSubscriptions.length > 0 && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">سجل الاشتراكات السابقة</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium rounded-r-lg">الخطة</th>
                                    <th className="px-4 py-3 font-medium">الحالة</th>
                                    <th className="px-4 py-3 font-medium">الفترة من</th>
                                    <th className="px-4 py-3 font-medium rounded-l-lg">إلى</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pastSubscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 font-medium text-gray-900">{sub.plan.name}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium 
                                                ${sub.status === 'cancelled' || sub.status === 'canceled' ? 'bg-red-50 text-red-600' :
                                                    sub.status === 'past_due' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-gray-100 text-gray-600'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">{formatDate(sub.currentPeriodStart)}</td>
                                        <td className="px-4 py-4 text-gray-500">{formatDate(sub.currentPeriodEnd)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
