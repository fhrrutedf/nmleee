import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/students — جلب المدربين مع عدد طلابهم، أو طلاب مدرب محدد
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const trainerId = req.nextUrl.searchParams.get('trainerId');

        if (trainerId) {
            // Get students for a specific trainer
            const enrollments = await prisma.courseEnrollment.findMany({
                where: {
                    course: { userId: trainerId },
                },
                include: {
                    course: {
                        select: { title: true, id: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                students: enrollments.map(e => ({
                    id: e.id,
                    name: e.studentName,
                    email: e.studentEmail,
                    courseTitle: e.course.title,
                    courseId: e.course.id,
                    progress: e.progress,
                    isCompleted: e.isCompleted,
                    completedAt: e.completedAt,
                    joinedAt: e.createdAt,
                })),
            });
        }

        // Get all trainers who have courses with students
        const trainers = await prisma.user.findMany({
            where: {
                courses: {
                    some: {
                        enrollments: { some: {} },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                avatar: true,
                courses: {
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: { enrollments: true },
                        },
                    },
                },
            },
        });

        const result = trainers.map(t => ({
            id: t.id,
            name: t.name,
            username: t.username,
            email: t.email,
            avatar: t.avatar,
            totalStudents: t.courses.reduce((sum, c) => sum + c._count.enrollments, 0),
            courses: t.courses
                .filter(c => c._count.enrollments > 0)
                .map(c => ({
                    id: c.id,
                    title: c.title,
                    studentCount: c._count.enrollments,
                })),
        }));

        return NextResponse.json({ trainers: result });
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
