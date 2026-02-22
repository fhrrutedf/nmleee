import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentsClient from "./StudentsClient";
import { FiUsers } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch students enrolled in courses owned by the user
    const enrollments = await prisma.courseEnrollment.findMany({
        where: {
            course: {
                userId: session.user.id,
            },
        },
        include: {
            course: {
                select: {
                    title: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const students = enrollments.map((en) => ({
        id: en.id,
        name: en.studentName,
        email: en.studentEmail,
        courseTitle: en.course.title,
        progress: en.progress,
        isCompleted: en.isCompleted,
        completedAt: en.completedAt?.toISOString() || null,
        joinedAt: en.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-action-blue/10 flex items-center justify-center">
                        <FiUsers className="text-xl text-action-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white">إدارة الطلاب والشهادات</h1>
                        <p className="text-text-muted mt-1 text-sm">عرض وتحليل بيانات طلابك وإصدار الشهادات والتواصل معهم</p>
                    </div>
                </div>
            </div>

            <StudentsClient initialStudents={students} />
        </div>
    );
}
