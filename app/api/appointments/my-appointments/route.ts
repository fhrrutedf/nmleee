import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: جلب جميع المواعيد للمستخدم الحالي
export async function GET(request: Request) {
    try {
        // للاختبار: جلب جميع المواعيد
        // في الإنتاج: استخدم session للفلترة حسب المستخدم
        const appointments = await prisma.appointment.findMany({
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب المواعيد' },
            { status: 500 }
        );
    }
}
