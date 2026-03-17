import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
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

        // Use raw query for pending courses because Prisma Client might not be updated yet
        // @ts-ignore
        const pendingCourses = await prisma.course.findMany({
            where: {
                // @ts-ignore
                status: 'PENDING_REVIEW',
                title: { contains: search, mode: 'insensitive' }
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                modules: {
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(pendingCourses);
    } catch (error) {
        console.error('Error fetching pending courses:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
