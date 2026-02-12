import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - التحقق من شهادة
export async function GET(
    req: NextRequest,
    { params }: { params: { certificateNumber: string } }
) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { certificateNumber: params.certificateNumber },
            include: {
                course: {
                    select: {
                        title: true,
                        user: {
                            select: {
                                name: true,
                                username: true,
                            }
                        }
                    }
                }
            }
        });

        if (!certificate) {
            return NextResponse.json({ error: 'الشهادة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json({
            valid: certificate.isVerified,
            certificate: {
                number: certificate.certificateNumber,
                studentName: certificate.studentName,
                courseName: certificate.courseName,
                issueDate: certificate.issueDate,
                instructorName: certificate.course.user.name,
            }
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء التحقق من الشهادة' }, { status: 500 });
    }
}
