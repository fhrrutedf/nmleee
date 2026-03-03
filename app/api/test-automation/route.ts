import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // 1. Find or Create the test user
        const user = await prisma.user.upsert({
            where: { email: 'ahmad@test.com' },
            update: { role: 'ADMIN' },
            create: {
                name: 'Ahmed Test',
                email: 'ahmad@test.com',
                username: 'ahmedtest' + Math.floor(Math.random() * 1000),
                role: 'ADMIN'
            }
        });

        // 2. Create a Free Course
        const course = await prisma.course.create({
            data: {
                title: 'دورة الاختبار المجانية (تم إنشاؤها آلياً)',
                description: 'دورة تجريبية بسعر 0 لاختبار نظام الشراء بالكامل.',
                price: 0,
                userId: user.id,
                category: 'برمجة',
                isActive: true
            }
        });

        return NextResponse.json({
            success: true,
            message: "تم إنشاء الدورة بنجاح",
            courseId: course.id,
            userEmail: user.email
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
