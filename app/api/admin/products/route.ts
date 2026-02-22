import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

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

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || 'ALL'; // ALL, PRODUCT, COURSE
        const statusStr = searchParams.get('status') || 'ALL'; // ALL, ACTIVE, INACTIVE
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Construct where clauses
        const textSearch = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' as any } },
                { user: { name: { contains: search, mode: 'insensitive' as any } } },
            ]
        } : {};

        let isActiveFilter = {};
        if (statusStr === 'ACTIVE') isActiveFilter = { isActive: true };
        if (statusStr === 'INACTIVE') isActiveFilter = { isActive: false };

        let products: any[] = [];
        let courses: any[] = [];
        let totalCount = 0;

        if (type === 'ALL' || type === 'PRODUCT') {
            const [pList, pCount] = await Promise.all([
                prisma.product.findMany({
                    where: { ...textSearch, ...isActiveFilter },
                    select: {
                        id: true, title: true, price: true, isActive: true, createdAt: true, isFree: true, soldCount: true,
                        user: { select: { name: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.product.count({ where: { ...textSearch, ...isActiveFilter } })
            ]);
            products = pList.map(p => ({ ...p, itemType: 'PRODUCT' }));
            totalCount += pCount;
        }

        if (type === 'ALL' || type === 'COURSE') {
            const [cList, cCount] = await Promise.all([
                prisma.course.findMany({
                    where: { ...textSearch, ...isActiveFilter },
                    select: {
                        id: true, title: true, price: true, isActive: true, createdAt: true,
                        user: { select: { name: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.course.count({ where: { ...textSearch, ...isActiveFilter } })
            ]);
            // Map courses to match product structure for table
            courses = cList.map(c => ({
                ...c,
                itemType: 'COURSE',
                isFree: c.price === 0,
                soldCount: 0 // Courses don't have soldCount currently, they have enrollments or we just use 0
            }));
            totalCount += cCount;
        }

        // Combine and paginate manually since they come from different tables
        let combined = [...products, ...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const paginatedItems = combined.slice(skip, skip + limit);

        return NextResponse.json({
            items: paginatedItems,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            },
            stats: {
                totalItems: await prisma.product.count() + await prisma.course.count(),
                totalProducts: await prisma.product.count(),
                totalCourses: await prisma.course.count(),
                activeItems: await prisma.product.count({ where: { isActive: true } }) + await prisma.course.count({ where: { isActive: true } })
            }
        });

    } catch (error) {
        console.error('Error fetching admin products:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
