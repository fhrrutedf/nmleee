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
            return NextResponse.json({ error: 'يجب تسجيل الدخول للاشتراك' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const body = await request.json();
        const { planId, name, price } = body;

        if (!planId || !price) {
            return NextResponse.json({ error: 'بيانات الخطة غير مكتملة' }, { status: 400 });
        }

        // البحث عن أو إنشاء SubscriptionPlan في قاعدة البيانات لتتبعها لاحقاً
        let dbPlan = await prisma.subscriptionPlan.findFirst({
            where: { name: name }
        });

        if (!dbPlan) {
            // إنشاء خطة وهمية لتسجيلها في النظام إذا لم تكن موجودة وربطها بالمدير
            // أو للمستقبل، لكن مؤقتاً نحفظ المسمى لغرض التوثيق
            dbPlan = await prisma.subscriptionPlan.create({
                data: {
                    name: name,
                    description: `خطة ${name}`,
                    price: parseFloat(price),
                    interval: 'month',
                    userId: user.id // Should ideally be an admin ID, but fallback to current user for local tracking
                }
            });
        }

        // إنشاء جلسة اشتراك في Stripe
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            mode: 'subscription',
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // أو 'egp' حسب عملتك الأساسية للاشتراكات، سأجعلها egp بناءً على ما سبق
                        product_data: {
                            name: `اشتراك ${name}`,
                            description: 'تجديد شهري من المنصة',
                        },
                        unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents/piastres
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
                planId: dbPlan.id,
                planName: name
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    planId: dbPlan.id,
                    planName: name
                }
            }
        });

        return NextResponse.json({ url: stripeSession.url });

    } catch (error: any) {
        console.error('Error creating subscription session:', error);
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء الاتصال ببوابة الدفع' },
            { status: 500 }
        );
    }
}
