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
                date: new Date(date),
                time,
                type,
                status: 'PENDING',
                clientName: name,
                clientEmail: email,
                clientPhone: phone,
                notes,
                // يمكنك ربطه بمستخدم إذا كان مسجل دخول
                userId: 'temp-user-id' // استخدم session.user.id إذا متاح
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
