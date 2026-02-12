import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * Generate Certificate for Course Completion
 * POST /api/certificates/generate
 * 
 * Security Checks:
 * 1. Course must have isCertificateEnabled = true
 * 2. Student must have 100% progress
 * 3. One certificate per student per course
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { courseId, studentEmail, studentName } = await req.json();

        // Validation
        if (!courseId || !studentEmail || !studentName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. CHECK: Does course exist and has certificates enabled?
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { user: true }
        });

        if (!course) {
            return NextResponse.json(
                { error: 'الدورة غير موجودة' },
                { status: 404 }
            );
        }

        if (!course.isCertificateEnabled) {
            return NextResponse.json(
                { error: 'الشهادات غير مفعلة لهذه الدورة' },
                { status: 403 }
            );
        }

        // 2. CHECK: Student progress = 100%?
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'لم يتم العثور على تسجيلك في الدورة' },
                { status: 404 }
            );
        }

        if (enrollment.progress < 100) {
            return NextResponse.json(
                { error: `يجب إكمال الدورة 100% أولاً. تقدمك الحالي: ${enrollment.progress}%` },
                { status: 403 }
            );
        }

        // 3. CHECK: Already generated?
        if (enrollment.certificateGenerated && enrollment.certificateUrl) {
            return NextResponse.json({
                success: true,
                certificateUrl: enrollment.certificateUrl,
                message: 'الشهادة موجودة بالفعل'
            });
        }

        // 4. GENERATE Certificate (Simple HTML for now, upgrade to PDF later)
        const certificateId = `CERT-${Date.now()}-${courseId.slice(-6)}`;
        const certificateData = {
            id: certificateId,
            studentName,
            courseName: course.title,
            instructorName: course.user.name,
            completionDate: new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            issueDate: new Date().toISOString()
        };

        // For now, store data as JSON URL (upgrade to actual PDF generation later)
        const certificateUrl = `/certificates/${certificateId}`;

        // 5. UPDATE enrollment
        await prisma.courseEnrollment.update({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail
                }
            },
            data: {
                certificateGenerated: true,
                certificateUrl,
                isCompleted: true,
                completedAt: new Date()
            }
        });

        // 6. Store certificate data (simple approach for now)
        // In production, generate actual PDF and upload to cloud storage
        // For now, we'll use a simple in-memory approach

        return NextResponse.json({
            success: true,
            certificateUrl,
            certificateData,
            message: 'تم إنشاء الشهادة بنجاح! 🎉'
        });

    } catch (error) {
        console.error('Certificate generation error:', error);
        return NextResponse.json(
            { error: 'فشل إنشاء الشهادة' },
            { status: 500 }
        );
    }
}

/**
 * Get Certificate Status
 * GET /api/certificates/generate?courseId=xxx&studentEmail=xxx
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const studentEmail = searchParams.get('studentEmail');

        if (!courseId || !studentEmail) {
            return NextResponse.json(
                { error: 'Missing parameters' },
                { status: 400 }
            );
        }

        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail
                }
            },
            include: {
                course: {
                    select: {
                        title: true,
                        isCertificateEnabled: true
                    }
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { eligible: false, reason: 'not_enrolled' },
                { status: 200 }
            );
        }

        if (!enrollment.course.isCertificateEnabled) {
            return NextResponse.json(
                { eligible: false, reason: 'feature_disabled' },
                { status: 200 }
            );
        }

        if (enrollment.progress < 100) {
            return NextResponse.json({
                eligible: false,
                reason: 'incomplete',
                progress: enrollment.progress
            });
        }

        return NextResponse.json({
            eligible: true,
            certificateGenerated: enrollment.certificateGenerated,
            certificateUrl: enrollment.certificateUrl,
            completedAt: enrollment.completedAt
        });

    } catch (error) {
        console.error('Certificate status check error:', error);
        return NextResponse.json(
            { error: 'فشل التحقق من حالة الشهادة' },
            { status: 500 }
        );
    }
}
