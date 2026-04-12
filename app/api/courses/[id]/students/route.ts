import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { id: courseId } = await params;

        // Verify ownership
        const course = await prisma.course.findFirst({
            where: { id: courseId, user: { email: session.user.email } },
            select: { id: true },
        });

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة أو لا تملك صلاحية' }, { status: 403 });
        }

        const enrollments = await prisma.courseEnrollment.findMany({
            where: { courseId },
            include: {
                lessonProgress: {
                    select: { isCompleted: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate lesson count
        const lessonCount = await prisma.lesson.count({
            where: { module: { courseId } },
        });

        const students = enrollments.map((enrollment) => {
            const completedLessons = enrollment.lessonProgress.filter(
                (lp) => lp.isCompleted
            ).length;
            const progressPercent = lessonCount > 0
                ? Math.round((completedLessons / lessonCount) * 100)
                : enrollment.progress;

            return {
                id: enrollment.id,
                studentName: enrollment.studentName,
                studentEmail: enrollment.studentEmail,
                progress: progressPercent,
                completedLessons,
                totalLessons: lessonCount,
                isCompleted: enrollment.isCompleted,
                completedAt: enrollment.completedAt,
                lastAccessedAt: enrollment.lastAccessedAt,
                enrolledAt: enrollment.createdAt,
                certificateGenerated: enrollment.certificateGenerated,
            };
        });

        return NextResponse.json({
            students,
            total: students.length,
            completed: students.filter((s) => s.isCompleted).length,
            lessonCount,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
