import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total statistics
        const [
            totalAppointments,
            thisMonthAppointments,
            lastMonthAppointments,
            upcomingAppointments,
            completedAppointments,
            cancelledAppointments,
            totalRevenue,
            averageDuration
        ] = await Promise.all([
            // Total count
            prisma.appointment.count({
                where: { userId }
            }),
            
            // This month
            prisma.appointment.count({
                where: {
                    userId,
                    createdAt: { gte: startOfMonth }
                }
            }),
            
            // Last month
            prisma.appointment.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    }
                }
            }),
            
            // Upcoming (confirmed/pending and future date)
            prisma.appointment.count({
                where: {
                    userId,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: { gte: now }
                }
            }),
            
            // Completed
            prisma.appointment.count({
                where: {
                    userId,
                    status: 'COMPLETED'
                }
            }),
            
            // Cancelled
            prisma.appointment.count({
                where: {
                    userId,
                    status: 'CANCELLED'
                }
            }),
            
            // Total revenue
            prisma.appointment.aggregate({
                where: { userId },
                _sum: { price: true }
            }),
            
            // Average duration
            prisma.appointment.aggregate({
                where: { userId },
                _avg: { duration: true }
            })
        ]);

        // Recent appointments
        const recentAppointments = await prisma.appointment.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                date: true,
                status: true,
                price: true,
                customerName: true
            }
        });

        // Conversion rate
        const conversionRate = totalAppointments > 0 
            ? Math.round((completedAppointments / totalAppointments) * 100) 
            : 0;

        // Monthly trend (last 6 months)
        const monthlyTrend = await getMonthlyTrend(userId);

        return NextResponse.json({
            overview: {
                total: totalAppointments,
                thisMonth: thisMonthAppointments,
                lastMonth: lastMonthAppointments,
                growth: calculateGrowth(thisMonthAppointments, lastMonthAppointments),
                upcoming: upcomingAppointments,
                completed: completedAppointments,
                cancelled: cancelledAppointments,
                conversionRate,
                totalRevenue: totalRevenue._sum.price || 0,
                averageDuration: Math.round(averageDuration._avg.duration || 0)
            },
            recentAppointments,
            monthlyTrend
        });

    } catch (error) {
        console.error('Error fetching appointment stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}

async function getMonthlyTrend(userId: string) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const count = await prisma.appointment.count({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });
        
        const revenue = await prisma.appointment.aggregate({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            _sum: { price: true }
        });
        
        months.push({
            month: startOfMonth.toLocaleString('ar-SA', { month: 'short' }),
            count,
            revenue: revenue._sum.price || 0
        });
    }
    
    return months;
}

function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}
