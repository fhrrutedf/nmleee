import QAClient from './QAClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'أسئلة وأجوبة المدرب | لوحة التحكم',
    description: 'إدارة الردود على استفسارات الطلاب وأسئلة الكورسات.',
};

export default async function QADashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true }
    });

    if (!user) {
        redirect('/login');
    }

    // Fetch the courses owned by this instructor for the filter dropdown
    const courses = await prisma.course.findMany({
        where: { userId: user.id },
        select: { id: true, title: true }
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)] overflow-hidden bg-bg-light dark:bg-bg-dark font-sans" dir="rtl">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-black text-primary-charcoal dark:text-white flex items-center gap-2">
                        أسئلة وأجوبة الطلاب
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        إدارة استفسارات الطلاب والرد عليها في واجهة محادثة موحدة.
                    </p>
                </div>
            </div>

            {/* Split Pane Interface */}
            <QAClient courses={courses} />
        </div>
    );
}
