import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const status = searchParams.get('status'); // 'new', 'resolved', 'all'

        // Build the where clause. Use course ownership for security
        const whereClause: any = {
            parentId: null, // Only top-level questions
            course: {
                userId: user.id
            }
        };

        if (courseId) {
            whereClause.courseId = courseId;
        }

        if (status === 'resolved') {
            whereClause.isResolved = true;
        } else if (status === 'new') {
            whereClause.isResolved = false;
        }

        const questions = await prisma.comment.findMany({
            where: whereClause,
            include: {
                course: { select: { title: true } },
                lesson: { select: { title: true, module: { select: { title: true } } } },
                _count: { select: { replies: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Q&A Fetch Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب الأسئلة' }, { status: 500 });
    }
}
