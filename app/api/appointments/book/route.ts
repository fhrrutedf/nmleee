import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            name, 
            email, 
            phone, 
            date, 
            time, 
            type, 
            notes, 
            service,
            sellerId,
            duration = 60,
            price = 0,
            timezone = 'UTC'
        } = body;

        if (!sellerId || !date || !time || !email) {
            return NextResponse.json(
                { error: 'البيانات غير مكتملة' },
                { status: 400 }
            );
        }

        // Combine date and time
        const dateTimeString = `${date}T${time}`;
        const appointmentDate = new Date(dateTimeString);
        
        // Convert to UTC if timezone provided
        if (timezone !== 'UTC') {
            // Simple timezone handling - in production use a library like date-fns-tz
            const offset = getTimezoneOffset(timezone);
            appointmentDate.setMinutes(appointmentDate.getMinutes() - offset);
        }

        // Check for conflicts
        const appointmentEnd = new Date(appointmentDate.getTime() + duration * 60000);
        
        const conflictingAppointments = await prisma.appointment.findMany({
            where: {
                userId: sellerId,
                status: {
                    in: ['PENDING', 'CONFIRMED']
                },
                date: {
                    lt: appointmentEnd
                }
            }
        });

        const hasConflict = conflictingAppointments.some(apt => {
            const aptStart = new Date(apt.date);
            const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
            
            // Check overlap with 15 min buffer
            const bufferMs = 15 * 60000;
            return (
                appointmentDate < new Date(aptEnd.getTime() + bufferMs) &&
                appointmentEnd > new Date(aptStart.getTime() - bufferMs)
            );
        });

        if (hasConflict) {
            return NextResponse.json(
                { error: 'هذا الوقت محجوز بالفعل، يرجى اختيار وقت آخر' },
                { status: 409 }
            );
        }

        // إنشاء موعد
        const appointment = await prisma.appointment.create({
            data: {
                title: service || 'استشارة',
                date: appointmentDate,
                status: 'PENDING',
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                description: notes || '',
                price: price,
                duration: duration,
                userId: sellerId,
                meetingLink: type === 'online' ? '' : null
            }
        });

        return NextResponse.json({
            success: true,
            appointment: {
                id: appointment.id,
                date: appointmentDate,
                status: appointment.status
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء الموعد' },
            { status: 500 }
        );
    }
}

function getTimezoneOffset(timezone: string): number {
    // Simplified timezone offsets in minutes from UTC
    const offsets: Record<string, number> = {
        'Asia/Riyadh': 180,
        'Asia/Dubai': 240,
        'Asia/Baghdad': 180,
        'Asia/Damascus': 180,
        'Africa/Cairo': 120,
        'Europe/Istanbul': 180,
        'Europe/London': 0,
        'America/New_York': -240,
        'America/Los_Angeles': -420,
    };
    return offsets[timezone] || 0;
}
