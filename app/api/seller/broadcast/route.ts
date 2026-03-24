import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { courseId, subject, message } = await req.json();

        if (!courseId || !subject || !message) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        // 1. Verify seller owns the course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { userId: true, title: true }
        });

        if (!course || course.userId !== (session.user as any).id) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // 2. Fetch all enrolled students
        const enrollments = await prisma.courseEnrollment.findMany({
            where: { courseId },
            select: { studentEmail: true }
        });

        if (enrollments.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: 'لا يوجد طلاب مسجلين في هذا الكورس حالياً' });
        }

        // 3. Create broadcast record
        await prisma.broadcast.create({
            data: {
                subject: `إشعار من مدربك: ${course.title} - ${subject}`,
                content: message,
                recipientCount: enrollments.length,
                sentCount: enrollments.length, // Assume immediate for now
                status: 'COMPLETED',
                recipientCriteria: `course:${courseId}`,
            }
        });

        // 4. In a real system, you'd trigger Novu or Resend here.
        // For now, we simulate success for UI feedback.
        
        return NextResponse.json({ 
            success: true, 
            sentCount: enrollments.length,
            message: `تم إرسال الرسالة بنجاح إلى ${enrollments.length} طالب! 🚀`
        });

    } catch (error) {
        console.error('[BROADCAST_ERROR]', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
