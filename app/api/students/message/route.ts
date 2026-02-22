import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subject, message, studentIds, courseId } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "الموضوع والرسالة مطلوبان" }, { status: 400 });
        }

        let recipients: { id?: string; email: string }[] = [];

        if (studentIds && studentIds.length > 0) {
            // Fetch selected students
            const enrollments = await prisma.courseEnrollment.findMany({
                where: {
                    id: { in: studentIds },
                    course: { userId: session.user.id }
                }
            });
            recipients = enrollments.map(e => ({ email: e.studentEmail }));
        } else if (courseId) {
            // Fetch all students in a specific course
            const enrollments = await prisma.courseEnrollment.findMany({
                where: {
                    courseId: courseId,
                    course: { userId: session.user.id }
                }
            });
            recipients = enrollments.map(e => ({ email: e.studentEmail }));
        } else {
            // Fetch ALL students across all courses of this instructor
            const enrollments = await prisma.courseEnrollment.findMany({
                where: {
                    course: { userId: session.user.id }
                }
            });
            // remove duplicates
            const uniqueEmails = Array.from(new Set(enrollments.map(e => e.studentEmail)));
            recipients = uniqueEmails.map(email => ({ email }));
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: "لم يتم العثور على طلاب مطابقين" }, { status: 404 });
        }

        // 1. Save Notifications in the Database (INTERNAL)
        const notifications = recipients.map(recipient => ({
            type: "INTERNAL",
            title: subject,
            content: message,
            senderId: session.user.id,
            receiverEmail: recipient.email,
        }));

        await prisma.notification.createMany({
            data: notifications
        });

        // 2. Here we could integrate with Resend to actually send an email
        // Example logic:
        // const resend = new Resend(process.env.RESEND_API_KEY);
        // await resend.emails.send({ ... });

        return NextResponse.json({
            success: true,
            message: `تم إرسال الرسالة بنجاح إلى ${recipients.length} طالب.`
        });

    } catch (error) {
        console.error("[STUDENT_MESSAGE_ERROR]", error);
        return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
    }
}
