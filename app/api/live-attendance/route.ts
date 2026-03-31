import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Get attendance for a course/lesson (instructor view)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const lessonId = searchParams.get('lessonId');

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        // Verify instructor owns this course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { userId: true }
        });

        if (!course || course.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const where: any = { courseId };
        if (lessonId) where.lessonId = lessonId;

        const attendance = await prisma.liveAttendance.findMany({
            where,
            orderBy: { joinedAt: 'desc' },
            include: {
                course: { select: { title: true } },
                lesson: { select: { title: true } }
            }
        });

        // Calculate stats
        const stats = {
            totalStudents: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            late: attendance.filter(a => a.status === 'late').length,
            left: attendance.filter(a => a.status === 'left').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            averageDuration: attendance.length > 0 
                ? Math.round(attendance.reduce((sum, a) => sum + a.duration, 0) / attendance.length)
                : 0
        };

        return NextResponse.json({ attendance, stats });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}

// Student joins live session
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId } = await request.json();

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        // Verify student is enrolled
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail: session.user.email
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'You must be enrolled to join this session' },
                { status: 403 }
            );
        }

        // Check if already has active attendance
        const existing = await prisma.liveAttendance.findFirst({
            where: {
                courseId,
                lessonId: lessonId || null,
                studentEmail: session.user.email,
                leftAt: null
            }
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already joined',
                attendance: existing
            });
        }

        // Create new attendance record
        const attendance = await prisma.liveAttendance.create({
            data: {
                courseId,
                lessonId: lessonId || null,
                studentEmail: session.user.email,
                studentName: session.user.name || 'طالب',
                joinedAt: new Date(),
                status: 'joined'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Joined successfully',
            attendance
        }, { status: 201 });

    } catch (error) {
        console.error('Error joining session:', error);
        return NextResponse.json(
            { error: 'Failed to join session' },
            { status: 500 }
        );
    }
}

// Student leaves session or instructor updates status
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, action, status } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
        }

        const attendance = await prisma.liveAttendance.findUnique({
            where: { id },
            include: { course: { select: { userId: true } } }
        });

        if (!attendance) {
            return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
        }

        // Can update if student owns it or instructor owns the course
        const isStudent = attendance.studentEmail === session.user.email;
        const isInstructor = attendance.course.userId === session.user.id;

        if (!isStudent && !isInstructor) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        let updateData: any = {};

        if (action === 'leave') {
            const now = new Date();
            const joinedAt = new Date(attendance.joinedAt);
            const durationMs = now.getTime() - joinedAt.getTime();
            const durationMinutes = Math.floor(durationMs / 60000);

            updateData = {
                leftAt: now,
                duration: durationMinutes,
                status: durationMinutes >= 30 ? 'present' : 'left'
            };
        } else if (action === 'update_status' && isInstructor && status) {
            updateData = { status };
        } else if (action === 'heartbeat') {
            // Just update the updatedAt to track active users
            updateData = { updatedAt: new Date() };
        }

        const updated = await prisma.liveAttendance.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            attendance: updated
        });

    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json(
            { error: 'Failed to update attendance' },
            { status: 500 }
        );
    }
}

// Instructor starts/ends session
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId, action } = await request.json();

        if (!courseId || !action) {
            return NextResponse.json({ error: 'Course ID and action required' }, { status: 400 });
        }

        // Verify instructor owns this course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { userId: true, title: true }
        });

        if (!course || course.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        if (action === 'start_session') {
            // Mark all existing attendance records with session start
            await prisma.liveAttendance.updateMany({
                where: {
                    courseId,
                    lessonId: lessonId || null,
                    sessionStart: null
                },
                data: {
                    sessionStart: new Date()
                }
            });

            // Notify enrolled students
            const enrollments = await prisma.courseEnrollment.findMany({
                where: { courseId },
                select: { studentEmail: true, studentName: true }
            });

            await Promise.all(
                enrollments.map(e =>
                    prisma.notification.create({
                        data: {
                            type: 'INTERNAL',
                            title: `🔴 البث المباشر بدأ: ${course.title}`,
                            content: `انضم الآن للجلسة المباشرة!`,
                            senderId: session.user.id,
                            receiverEmail: e.studentEmail,
                            isRead: false
                        }
                    })
                )
            );

            return NextResponse.json({
                success: true,
                message: 'Session started and notifications sent'
            });
        } else if (action === 'end_session') {
            const now = new Date();

            // Get all active attendance records
            const activeRecords = await prisma.liveAttendance.findMany({
                where: {
                    courseId,
                    lessonId: lessonId || null,
                    leftAt: null
                }
            });

            // Close all active sessions
            for (const record of activeRecords) {
                const joinedAt = new Date(record.joinedAt);
                const durationMs = now.getTime() - joinedAt.getTime();
                const durationMinutes = Math.floor(durationMs / 60000);

                await prisma.liveAttendance.update({
                    where: { id: record.id },
                    data: {
                        leftAt: now,
                        sessionEnd: now,
                        duration: durationMinutes,
                        status: durationMinutes >= 30 ? 'present' : 'left'
                    }
                });
            }

            return NextResponse.json({
                success: true,
                message: `Session ended. ${activeRecords.length} students marked as present/left`
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error managing session:', error);
        return NextResponse.json(
            { error: 'Failed to manage session' },
            { status: 500 }
        );
    }
}
