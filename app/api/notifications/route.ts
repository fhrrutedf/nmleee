import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Get notifications for current user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Support both userId and email for students
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { receiverId: session.user.id },
                    { receiverEmail: session.user.email }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                OR: [
                    { receiverId: session.user.id },
                    { receiverEmail: session.user.email }
                ],
                isRead: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// Mark notification as read
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, markAll } = await req.json();

        if (markAll) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: {
                    OR: [
                        { receiverId: session.user.id },
                        { receiverEmail: session.user.email }
                    ],
                    isRead: false
                },
                data: { isRead: true }
            });
        } else if (id) {
            // Mark single as read
            await prisma.notification.update({
                where: { id },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// Create notification (for instructor to notify students of new lesson/reply)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId, title, content, notificationType = 'LESSON_ADDED' } = await request.json();

        // Get course and instructor info
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { title: true, userId: true }
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Get all enrolled students
        const enrollments = await prisma.courseEnrollment.findMany({
            where: { courseId },
            select: { studentEmail: true, studentName: true }
        });

        if (enrollments.length === 0) {
            return NextResponse.json({ error: 'No enrolled students' }, { status: 400 });
        }

        // Create notification for each student
        const notifications = await Promise.all(
            enrollments.map(enrollment =>
                prisma.notification.create({
                    data: {
                        type: 'INTERNAL',
                        title: title || `درس جديد: ${course.title}`,
                        content: content || `تم إضافة درس جديد في دورة ${course.title}`,
                        senderId: session.user.id,
                        receiverEmail: enrollment.studentEmail,
                        isRead: false
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            sentCount: notifications.length,
            message: `تم إرسال الإشعار لـ ${notifications.length} طالب`
        });

    } catch (error) {
        console.error('Error creating notifications:', error);
        return NextResponse.json(
            { error: 'Failed to create notifications' },
            { status: 500 }
        );
    }
}
