import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');
        const duration = parseInt(searchParams.get('duration') || '30');

        if (!userId || !date) {
            return NextResponse.json(
                { error: 'userId and date are required' },
                { status: 400 }
            );
        }

        // Get user's availability settings
        const availability = await prisma.availability.findMany({
            where: {
                userId: userId,
                isActive: true
            }
        });

        if (!availability.length) {
            return NextResponse.json(
                { error: 'لا يوجد أوقات متاحة لهذا المستخدم' },
                { status: 404 }
            );
        }

        // Get day of week for the requested date
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();

        // Find availability for this day
        const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
        
        if (!dayAvailability) {
            return NextResponse.json([]);
        }

        // Get existing appointments for this date
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                userId: userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ['PENDING', 'CONFIRMED']
                }
            }
        });

        // Generate time slots
        const slots = generateTimeSlots(
            dayAvailability.startTime,
            dayAvailability.endTime,
            duration,
            existingAppointments,
            requestedDate
        );

        return NextResponse.json(slots);

    } catch (error) {
        console.error('Error generating time slots:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الأوقات المتاحة' },
            { status: 500 }
        );
    }
}

function generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    existingAppointments: any[],
    date: Date
) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Add 15 min buffer between appointments
    const bufferMinutes = 15;
    const totalSlotTime = duration + bufferMinutes;
    
    while (currentHour * 60 + currentMinute + duration <= endTotalMinutes) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        
        // Check if slot conflicts with existing appointment
        const slotStart = currentHour * 60 + currentMinute;
        const slotEnd = slotStart + duration;
        
        const isConflict = existingAppointments.some(apt => {
            const aptDate = new Date(apt.date);
            const aptStart = aptDate.getHours() * 60 + aptDate.getMinutes();
            const aptEnd = aptStart + apt.duration;
            
            // Check overlap
            return (slotStart < aptEnd && slotEnd > aptStart);
        });
        
        if (!isConflict) {
            slots.push({
                time: timeString,
                available: true
            });
        }
        
        // Move to next slot
        currentMinute += totalSlotTime;
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
        }
    }
    
    return slots;
}
