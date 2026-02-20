import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const body = await request.json();
        const { subscriptionId } = body;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'رقم الاشتراك مطلوب' }, { status: 400 });
        }

        // تحقق من أن الاشتراك يخص المستخدم الحالي
        const userSubscription = await prisma.subscription.findFirst({
            where: {
                id: subscriptionId,
                customerId: user.id
            }
        });

        if (!userSubscription || !userSubscription.stripeSubscriptionId) {
            return NextResponse.json({ error: 'اشتراك غير صالح أو لا تملك صلاحية تعديله' }, { status: 403 });
        }

        // إلغاء التجديد التلقائي في Stripe
        const updatedSubscription = await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        // سنترك Webhook يتولى عملية تحديث قاعدة البيانات،
        // ولكن يمكن التحديث محلياً لسرعة استجابة الواجهة
        await prisma.subscription.update({
            where: { id: userSubscription.id },
            data: {
                cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
            }
        });

        return NextResponse.json({ success: true, message: 'تم إيقاف التجديد التلقائي بنجاح' });

    } catch (error: any) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء الاتصال ببوابة الدفع' },
            { status: 500 }
        );
    }
}
