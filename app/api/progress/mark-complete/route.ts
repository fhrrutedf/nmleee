import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { courseId, lessonId } = await req.json();

        if (!courseId || !lessonId) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        // Check if user has access to this course
        const hasAccess = await prisma.order.findFirst({
            where: {
                customerEmail: session.user.email,
                status: 'PAID',
                items: {
                    some: {
                        courseId,
                    },
                },
            },
        });

        if (!hasAccess) {
            return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
        }

        // Mark lesson as complete
        // Note: You'll need to create a LessonProgress model first
        // For now, we'll just return success

        // TODO: Create LessonProgress record
        /*
        await prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId,
            },
          },
          create: {
            userId: session.user.id,
            lessonId,
            courseId,
            completed: true,
            completedAt: new Date(),
          },
          update: {
            completed: true,
            completedAt: new Date(),
          },
        });
        */

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking complete:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
