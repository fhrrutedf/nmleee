import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // URL parsing for search/filter/pagination
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || 'ALL'; // ALL, BUYER, SELLER
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Construct where clause
        const whereClause: Prisma.UserWhereInput = {};

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role !== 'ALL') {
            whereClause.role = role as any; // Cast 'SELLER' or 'CUSTOMER'
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    avatar: true,
                    isActive: true,
                    createdAt: true,
                    isVerified: true,
                    totalEarnings: true,
                    _count: {
                        select: {
                            products: true,
                            sellerOrders: true,
                            orders: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            },
            stats: {
                totalUsers: await prisma.user.count(),
                activeSellers: await prisma.user.count({ where: { role: 'SELLER', isActive: true } }),
                totalCustomers: await prisma.user.count({ where: { role: 'CUSTOMER' } })
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب المستخدمين' }, { status: 500 });
    }
}
