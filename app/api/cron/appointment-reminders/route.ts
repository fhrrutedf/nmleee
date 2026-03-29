import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

// This route is called by Vercel Cron every 5 minutes
// It checks for appointments starting in the next 30-45 minutes and sends notifications
export async function GET(request: NextRequest) {
    // Security: only allow Vercel Cron or internal calls
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    // Increase window to 45 minutes to catch appointments missed in short windows
    const maxFuture = new Date(now.getTime() + 45 * 60 * 1000);

    try {
        // Find appointments starting soon that haven't been notified yet
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: now,
                    lte: maxFuture,
                },
                status: 'CONFIRMED',
                isNotified: false, // Core Fix: Prevent duplicate spam
            },
            include: {
                user: {
                    select: { 
                        name: true, 
                        email: true, 
                        timezone: true,
                        phone: true,
                        logoUrl: true 
                    }
                }
            }
        });

        let sentCount = 0;

        for (const appointment of appointments) {
            if (!appointment.customerEmail) continue;

            // 1. Dynamic Timezone Support
            const sellerTimeZone = appointment.user.timezone || 'UTC';
            const appointmentTime = new Date(appointment.date).toLocaleString('ar-SA', {
                timeZone: sellerTimeZone,
                dateStyle: 'full',
                timeStyle: 'short',
            });

            // 2. Fallback Logic for Meeting Link
            const hasMeetingLink = !!appointment.meetingLink;
            const contactInfo = appointment.user.phone ? `يمكنك التواصل مع البائع عبر واتساب: ${appointment.user.phone}` : 'يرجى انتظار رسالة من البائع قريباً.';
            
            // 3. Email Content with Branding
            const platformLogo = appointment.user.logoUrl || 'https://noaof.vercel.app/logo.png'; // Fallback to main logo if available

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'no-reply@tmleen.com', // Professional Branding
                to: appointment.customerEmail,
                subject: `🔔 تذكير بموعدك القريب: ${appointment.title}`,
                html: `
                    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 20px;">
                        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 15px;">
                            <h2 style="color: white; margin: 0; font-size: 26px;">⏰ تذكير بالموعد | تمالين</h2>
                        </div>
                        
                        <div style="padding: 10px 20px;">
                            <p style="font-size: 18px; line-height: 1.6;">مرحباً <strong>${appointment.customerName || 'عزيزي العميل'}</strong>،</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569;">هذا تذكير بموعدك المرتقب مع <strong>${appointment.user.name}</strong>.</p>
                            
                            <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 25px 0; border: 1px solid #e2e8f0; border-right: 5px solid #0ea5e9;">
                                <p style="margin: 8px 0; font-size: 16px;"><strong>📌 العنوان:</strong> ${appointment.title}</p>
                                <p style="margin: 8px 0; font-size: 16px;"><strong>🕒 الوقت:</strong> ${appointmentTime} <span style="font-size: 12px; color: #94a3b8;">(${sellerTimeZone})</span></p>
                                <p style="margin: 8px 0; font-size: 16px;"><strong>⏳ المدة:</strong> ${appointment.duration} دقيقة</p>
                            </div>

                            ${hasMeetingLink ? `
                                <div style="text-align: center; margin: 35px 0;">
                                    <a href="${appointment.meetingLink}" 
                                       style="background: #2563eb; color: white; padding: 18px 45px; border-radius: 12px; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4); display: inline-block;">
                                        🚀 الدخول المباشر للاجتماع
                                    </a>
                                </div>
                            ` : `
                                <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #fdba74; margin: 25px 0;">
                                    <p style="margin: 0; color: #9a3412; font-weight: bold;">⚠️ ملاحظة هامة:</p>
                                    <p style="margin: 10px 0 0 0; color: #7c2d12; font-size: 14px;">لم يتم إنشاء رابط الاجتماع حتى الآن. ${contactInfo}</p>
                                </div>
                            `}
                            
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                                <p style="color: #94a3b8; font-size: 13px;">تم إرسال هذا البريد تلقائياً من نظام المواعيد في منصة <strong>تمالين</strong>.</p>
                                <p style="color: #cbd5e1; font-size: 11px;">© 2026 تمالين. جميع الحقوق محفوظة.</p>
                            </div>
                        </div>
                    </div>
                `,
            });

            // 4. Mark as notified so we don't send again
            await prisma.appointment.update({
                where: { id: appointment.id },
                data: { isNotified: true }
            });

            sentCount++;
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
