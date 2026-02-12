import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;
        const courseId = id;

        // Verify ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { user: true },
        });

        if (!course || course.user.email !== session.user.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Fetch enrollments with student data
        const enrollments = await prisma.courseEnrollment.findMany({
            where: { courseId },
            select: {
                id: true,
                progress: true,
                isCompleted: true,
                totalWatchTime: true,
                studentName: true,
                studentEmail: true,
            },
        });

        // Calculate stats
        const totalStudents = enrollments.length;
        const completedStudents = enrollments.filter((e) => e.isCompleted).length;
        const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
        const averageProgress =
            totalStudents > 0
                ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalStudents
                : 0;
        const totalWatchTime = enrollments.reduce((sum, e) => sum + e.totalWatchTime, 0);

        return NextResponse.json({
            students: enrollments,
            stats: {
                totalStudents,
                completionRate,
                averageProgress,
                totalWatchTime,
            },
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
