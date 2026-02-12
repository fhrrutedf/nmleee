import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - جلب وحدات الدورة
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        videoDuration: true,
                        isPublished: true,
                        isFree: true,
                        order: true,
                    }
                },
                _count: {
                    select: { lessons: true }
                }
            }
        });

        return NextResponse.json(modules);
    } catch (error) {
        console.error('Error fetching modules:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء جلب الوحدات' }, { status: 500 });
    }
}

// POST - إضافة وحدة جديدة
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const body = await req.json();
        const { title, description, order } = body;

        if (!title) {
            return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
        }

        const { courseId } = await params;
        // Get the course to verify ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
        }

        // Get the next order number if not provided
        let moduleOrder = order;
        if (moduleOrder === undefined) {
            const lastModule = await prisma.module.findFirst({
                where: { courseId },
                orderBy: { order: 'desc' },
            });
            moduleOrder = lastModule ? lastModule.order + 1 : 0;
        }

        const module = await prisma.module.create({
            data: {
                title,
                description: description || '',
                order: moduleOrder,
                courseId,
            },
            include: {
                _count: {
                    select: { lessons: true }
                }
            }
        });

        return NextResponse.json(module, { status: 201 });
    } catch (error) {
        console.error('Error creating module:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الوحدة' }, { status: 500 });
    }
}
