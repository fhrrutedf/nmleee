import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Generate and download certificate PDF
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get certificate with related data
        const certificate = await prisma.certificate.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        title: true,
                        user: {
                            select: {
                                name: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        // Verify the student
        if (certificate.studentEmail !== session.user.email) {
            return NextResponse.json({ error: 'Not your certificate' }, { status: 403 });
        }

        // Generate PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]); // A4 Landscape

        const { width, height } = page.getSize();

        // Load fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Background
        page.drawRectangle({
            x: 0,
            y: 0,
            width,
            height,
            color: rgb(0.97, 0.97, 0.97)
        });

        // Border
        page.drawRectangle({
            x: 20,
            y: 20,
            width: width - 40,
            height: height - 40,
            borderWidth: 4,
            borderColor: rgb(0.06, 0.73, 0.49), // Emerald color
            color: rgb(1, 1, 1)
        });

        // Title
        page.drawText('شهادة إتمام', {
            x: width / 2 - 80,
            y: height - 100,
            size: 40,
            font: helveticaBold,
            color: rgb(0.06, 0.73, 0.49)
        });

        page.drawText('Certificate of Completion', {
            x: width / 2 - 120,
            y: height - 140,
            size: 20,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4)
        });

        // Student name
        page.drawText('تُمنح هذه الشهادة لـ', {
            x: width / 2 - 100,
            y: height - 200,
            size: 16,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5)
        });

        page.drawText('This certificate is presented to', {
            x: width / 2 - 130,
            y: height - 225,
            size: 12,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5)
        });

        // Student Name (Large)
        page.drawText(certificate.studentName, {
            x: width / 2 - (certificate.studentName.length * 8),
            y: height - 280,
            size: 32,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1)
        });

        // Course Info
        page.drawText('لإتمام دورة', {
            x: width / 2 - 60,
            y: height - 340,
            size: 16,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5)
        });

        page.drawText('For successfully completing', {
            x: width / 2 - 110,
            y: height - 365,
            size: 12,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5)
        });

        // Course Name
        page.drawText(certificate.course.title, {
            x: width / 2 - (certificate.course.title.length * 6),
            y: height - 420,
            size: 28,
            font: helveticaBold,
            color: rgb(0.06, 0.73, 0.49)
        });

        // Date
        const dateStr = new Date(certificate.issueDate).toLocaleDateString('ar-SA');
        page.drawText(`تاريخ الإصدار: ${dateStr}`, {
            x: width / 2 - 80,
            y: 100,
            size: 14,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4)
        });

        // Certificate Number
        page.drawText(`رقم الشهادة: ${certificate.certificateNumber}`, {
            x: width / 2 - 100,
            y: 70,
            size: 12,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5)
        });

        // Verification Code
        page.drawText(`رمز التحقق: ${certificate.verificationCode}`, {
            x: width / 2 - 90,
            y: 45,
            size: 10,
            font: helvetica,
            color: rgb(0.6, 0.6, 0.6)
        });

        // Instructor
        if (certificate.course.user?.name) {
            page.drawText(`المعلم: ${certificate.course.user.name}`, {
                x: 60,
                y: 100,
                size: 12,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4)
            });
        }

        // Platform
        page.drawText('منصة تمالين', {
            x: width - 150,
            y: 100,
            size: 14,
            font: helveticaBold,
            color: rgb(0.06, 0.73, 0.49)
        });

        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save();

        // Return PDF
        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`
            }
        });

    } catch (error) {
        console.error('Error generating certificate:', error);
        return NextResponse.json(
            { error: 'Failed to generate certificate' },
            { status: 500 }
        );
    }
}
