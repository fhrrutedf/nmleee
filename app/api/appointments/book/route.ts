import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, date, time, type, notes, service } = body;

        // إنشاء موعد
        const appointment = await prisma.appointment.create({
            data: {
                title: `موعد ${service}`,
                date: new Date(date), // Ensure this includes time if needed, or combine with `time` var logic if desired
                status: 'PENDING',
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                description: `${notes || ''} - Time: ${time} - Type: ${type}`,
                price: 0, // Default price
                duration: 60, // Default duration
                userId: '000000000000000000000000' // Placeholder valid ObjectId to pass validation if any, though "temp-user-id" might be string-valid. keeping string.
            }
        });

        // إرسال إشعار للبائع (اختياري)
        // await sendNotification(...)

        return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Failed to create appointment' },
            { status: 500 }
        );
    }
}
