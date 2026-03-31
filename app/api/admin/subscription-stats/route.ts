import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Get all subscription-related orders
        const subscriptionOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        itemType: 'subscription'
                    }
                },
                status: { in: ['PAID', 'COMPLETED'] }
            },
            include: {
                items: {
                    where: { itemType: 'subscription' }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        planType: true,
                        planExpiresAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats
        const stats = {
            totalRevenue: 0,
            monthlyRecurring: 0,
            totalSubscribers: 0,
            newThisMonth: 0,
            byPlan: {
                FREE: 0,
                GROWTH: 0,
                PRO: 0,
                AGENCY: 0
            },
            expiringSoon: 0,
            churned: 0
        };

        const uniqueUsers = new Set();

        // Get all users with subscriptions for accurate counts
        const allSubscribers = await prisma.user.findMany({
            where: {
                planType: { not: 'FREE' }
            },
            select: {
                planType: true,
                planExpiresAt: true,
                createdAt: true
            }
        });

        allSubscribers.forEach(user => {
            stats.byPlan[user.planType as keyof typeof stats.byPlan]++;
            stats.totalSubscribers++;
            
            if (user.planExpiresAt && new Date(user.planExpiresAt) < sevenDaysFromNow && new Date(user.planExpiresAt) > now) {
                stats.expiringSoon++;
            }
            
            if (user.createdAt >= thirtyDaysAgo) {
                stats.newThisMonth++;
            }
        });

        // Calculate revenue from orders
        subscriptionOrders.forEach(order => {
            stats.totalRevenue += order.totalAmount || 0;
        });

        // Recent subscriptions (last 20)
        const recentSubscriptions = subscriptionOrders.slice(0, 20).map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            user: order.user,
            amount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            planName: 'اشتراك منصة'
        }));

        // Upcoming expirations
        const upcomingExpirations = allSubscribers
            .filter(u => u.planExpiresAt && new Date(u.planExpiresAt) > now && new Date(u.planExpiresAt) < sevenDaysFromNow)
            .length;

        return NextResponse.json({
            stats,
            recentSubscriptions,
            upcomingExpirations
        });
    } catch (error) {
        console.error('Error fetching subscription stats:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
