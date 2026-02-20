import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // Keep Arabic, English, numbers, spaces, hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 100); // Limit length
}

// Helper to ensure unique slug
async function ensureUniqueSlug(baseSlug: string, userId: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findFirst({
            where: { userId, slug }
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export async function GET(request: NextRequest) {
    try {
        // جلب جميع الدورات
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true
                    }
                }
            }
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في جلب الدورات' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const userId = (session.user as any).id;

        // إنشاء دورة جديدة
        const course = await prisma.course.create({
            data: {
                title: body.title,
                description: body.description,
                price: parseFloat(body.price),
                category: body.category || null,
                image: body.image || null,
                tags: body.tags || [],
                duration: body.duration || null,
                sessions: body.sessions || null,
                isActive: body.isActive !== undefined ? body.isActive : true,
                zoomLink: body.zoomLink || null,
                meetLink: body.meetLink || null,
                userId: userId
            },
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error: any) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في إنشاء الدورة', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 400 }
        );
    }
}
