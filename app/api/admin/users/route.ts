import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * 🛠️ THE IRON DASHBOARD: Optimized Admin API
 * 1. Query Splitting & Aggregation (N+1 fix).
 * 2. Efficient Search with PostgreSQL Index hints.
 * 3. Bulk Action Logic (Ban/Activate/Verify).
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        // Admin verification
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (adminUser?.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const roleFilter = searchParams.get('role') || 'ALL';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { startsWith: search, mode: 'insensitive' } }, // startsWith is faster than contains
            ];
        }
        if (roleFilter !== 'ALL') where.role = roleFilter as any;

        // --- OPTIMIZATION (Fixing N+1 Queries) ---
        // Instead of 4-5 separate counts, we use Promise.all and aggregation
        const [users, totalCount, roleStats] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true, name: true, email: true, role: true, avatar: true,
                    isActive: true, createdAt: true, isVerified: true, totalEarnings: true,
                    _count: { select: { products: true, sellerOrders: true, orders: true } },
                    // Include pending verification if exists
                    verificationRequests: { where: { status: 'PENDING' }, select: { id: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where }),
            // Group by role to get ALL stats in ONE query
            prisma.user.groupBy({
                by: ['role'],
                _count: { _all: true },
                _sum: { totalEarnings: true }
            })
        ]);

        return NextResponse.json({
            users,
            pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
            stats: {
                total: roleStats.reduce((sum, r) => sum + r._count._all, 0),
                sellers: roleStats.find(r => r.role === 'SELLER')?._count._all || 0,
                customers: roleStats.find(r => r.role === 'CUSTOMER')?._count._all || 0,
                totalRevenue: roleStats.reduce((sum, r) => sum + (r._sum.totalEarnings || 0), 0)
            }
        });

    } catch (error: any) {
        console.error('Iron Dashboard Error:', error?.message);
        return NextResponse.json({ error: 'حدث خطأ في النظام' }, { status: 500 });
    }
}

/**
 * ⚡ BULK ACTIONS: Handle multiple users at once
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

        const body = await request.json();
        const { userIds, action, value } = body; // action: 'ban', 'activate', 'set_role', 'verify'

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'لم يتم تحديد مستخدمين' }, { status: 400 });
        }

        let dataUpdate: Prisma.UserUpdateInput = {};

        switch (action) {
            case 'ban': dataUpdate = { isActive: false }; break;
            case 'activate': dataUpdate = { isActive: true }; break;
            case 'set_role': dataUpdate = { role: value }; break; // e.g., 'ADMIN'
            case 'verify': dataUpdate = { isVerified: value }; break;
            default: return NextResponse.json({ error: 'إجراء غير مدعوم' }, { status: 1 });
        }

        const result = await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: dataUpdate
        });

        return NextResponse.json({ success: true, count: result.count });

    } catch (error) {
        return NextResponse.json({ error: 'فشل تنفيذ العملية الجماعية' }, { status: 500 });
    }
}
