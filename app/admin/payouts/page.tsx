import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import PayoutsClient from './PayoutsClient';

export const metadata = {
    title: 'إدارة طلبات السحب | لوحة الإدارة',
};

export default async function AdminPayoutsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
        redirect('/'); // فقط المدير يمكنه الدخول
    }

    // جلب كل الطلبات، مع الأحدث أولاً
    const payouts = await prisma.payout.findMany({
        include: {
            seller: {
                select: {
                    name: true,
                    email: true,
                    bankName: true,
                    accountName: true,
                    accountNumber: true,
                    paypalEmail: true,
                    cryptoWallet: true,
                    payoutMethod: true,
                    shamCashNumber: true,
                    vodafoneCash: true,
                    mtncashNumber: true,
                    zainCashNumber: true,
                    omtNumber: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // تحويل البيانات ليتعامل معها مكون العميل بشكل أسهل
    const formattedPayouts = payouts.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        approvedAt: p.approvedAt?.toISOString() || null,
        rejectedAt: p.rejectedAt?.toISOString() || null,
        paidAt: p.paidAt?.toISOString() || null
    }));

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">طلبات سحب الأرباح</h1>
                    <p className="text-gray-600 mt-2">إدارة ومراجعة طلبات سحب الأرباح المقدمة من البائعين</p>
                </div>

                <PayoutsClient initialPayouts={formattedPayouts} />
            </div>
        </div>
    );
}
