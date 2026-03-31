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

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'all'; // all, active, expired, expiring

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        let whereClause: any = {
            planType: { not: 'FREE' } // Exclude free users by default
        };

        if (filter === 'active') {
            whereClause = {
                ...whereClause,
                planExpiresAt: { gt: now }
            };
        } else if (filter === 'expired') {
            whereClause = {
                ...whereClause,
                planExpiresAt: { lt: now }
            };
        } else if (filter === 'expiring') {
            whereClause = {
                ...whereClause,
                planExpiresAt: {
                    gt: now,
                    lt: sevenDaysFromNow
                }
            };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                planType: true,
                planExpiresAt: true,
                createdAt: true,
                _count: {
                    select: {
                        subscriptions: true
                    }
                }
            },
            orderBy: {
                planExpiresAt: 'asc'
            }
        });

        // Calculate statistics
        const stats = {
            total: users.length,
            active: users.filter(u => u.planExpiresAt && new Date(u.planExpiresAt) > now).length,
            expired: users.filter(u => u.planExpiresAt && new Date(u.planExpiresAt) < now).length,
            expiringSoon: users.filter(u => {
                if (!u.planExpiresAt) return false;
                const expDate = new Date(u.planExpiresAt);
                return expDate > now && expDate < sevenDaysFromNow;
            }).length,
            byPlan: {
                FREE: users.filter(u => u.planType === 'FREE').length,
                GROWTH: users.filter(u => u.planType === 'GROWTH').length,
                PRO: users.filter(u => u.planType === 'PRO').length,
                AGENCY: users.filter(u => u.planType === 'AGENCY').length,
            }
        };

        return NextResponse.json({ users, stats });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
