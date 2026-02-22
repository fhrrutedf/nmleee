import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { enrollmentId } = await req.json();

        if (!enrollmentId) {
            return NextResponse.json({ error: "Enrollment ID is required" }, { status: 400 });
        }

        // Fetch enrollment and ensure the instructor owns the course
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    select: {
                        userId: true,
                        title: true,
                        isCertificateEnabled: true
                    }
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
        }

        if (enrollment.course.userId !== session.user.id) {
            // Only the instructor can issue the certificate
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (enrollment.certificateGenerated) {
            return NextResponse.json({ error: "Certificate already issued" }, { status: 400 });
        }

        // Create the certificate
        const verificationCode = uuidv4().substring(0, 8).toUpperCase();
        const certificateNumber = `CERT-${new Date().getFullYear()}-${verificationCode}`;

        const certificate = await prisma.certificate.create({
            data: {
                certificateNumber,
                studentName: enrollment.studentName,
                studentEmail: enrollment.studentEmail,
                courseName: enrollment.course.title,
                verificationCode,
                courseId: enrollment.courseId,
                enrollmentId: enrollment.id
            }
        });

        // Update enrollment
        await prisma.courseEnrollment.update({
            where: { id: enrollment.id },
            data: {
                certificateGenerated: true,
                certificateUrl: `/certificates/verify/${verificationCode}`,
                isCompleted: true, // Auto-mark completed when cert is issued
                completedAt: enrollment.completedAt || new Date()
            }
        });

        return NextResponse.json({
            success: true,
            certificate: { ...certificate, verifyUrl: `/certificates/verify/${verificationCode}` }
        });

    } catch (error) {
        console.error("[CERTIFICATE_GENERATION_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
