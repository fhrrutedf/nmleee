import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// This route is called by Vercel Cron every 5 minutes
// It checks for appointments starting in the next 30 minutes and sends Meet links
export async function GET(request: NextRequest) {
    // Security: only allow Vercel Cron or internal calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const in25Minutes = new Date(now.getTime() + 25 * 60 * 1000);

    try {
        // Find appointments starting in 25-30 minutes that haven't been notified
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: in25Minutes,
                    lte: in30Minutes,
                },
                status: 'CONFIRMED',
                meetLink: { not: null },
                // Only send if not already notified (we'll add this field later)
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        let sentCount = 0;

        for (const appointment of appointments) {
            if (!appointment.customerEmail || !appointment.meetLink) continue;

            // Format appointment time
            const appointmentTime = new Date(appointment.date).toLocaleString('ar-SA', {
                timeZone: 'Asia/Riyadh',
                dateStyle: 'full',
                timeStyle: 'short',
            });

            // Send email to customer
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                to: appointment.customerEmail,
                subject: `🔔 تذكير: موعدك بعد 30 دقيقة - ${appointment.title}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #D41295, #7c3aed); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">⏰ تذكير بالموعد</h1>
                        </div>
                        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
                            <p style="font-size: 18px; color: #0f172a;">مرحباً <strong>${appointment.customerName || 'عزيزي العميل'}</strong>!</p>
                            <p style="color: #475569;">موعدك مع <strong>${appointment.user.name}</strong> بعد <strong>30 دقيقة</strong>.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #e2e8f0;">
                                <p style="margin: 5px 0;"><strong>📋 الموضوع:</strong> ${appointment.title}</p>
                                <p style="margin: 5px 0;"><strong>📅 الوقت:</strong> ${appointmentTime}</p>
                                <p style="margin: 5px 0;"><strong>⏱️ المدة:</strong> ${appointment.duration} دقيقة</p>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${appointment.meetLink}" 
                                   style="background: #4285F4; color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block;">
                                    🎥 انضم للاجتماع عبر Google Meet
                                </a>
                            </div>
                            
                            <p style="color: #94a3b8; font-size: 14px; text-align: center;">
                                إذا لم تتمكن من الحضور، يرجى التواصل مسبقاً.
                            </p>
                        </div>
                    </div>
                `,
            });

            sentCount++;
            console.log(`✅ Reminder sent to ${appointment.customerEmail} for appointment ${appointment.id}`);
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${sentCount} reminders`,
            checked: appointments.length,
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
