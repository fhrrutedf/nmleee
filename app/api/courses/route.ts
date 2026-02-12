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
        const courses = await prisma.product.findMany({
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

        // Generate slug from title
        const baseSlug = generateSlug(body.title);
        const uniqueSlug = await ensureUniqueSlug(baseSlug, userId);

        // إنشاء دورة جديدة (كمنتج)
        const course = await prisma.product.create({
            data: {
                title: body.title,
                slug: uniqueSlug,
                description: body.description,
                price: parseFloat(body.price),
                category: body.category || null,
                image: body.image || null,
                fileUrl: body.fileUrl || null,
                fileType: body.fileType || 'video',
                tags: body.tags || [],
                features: body.features || [],
                duration: body.duration || null,
                sessions: body.sessions || null,
                isActive: body.isActive !== undefined ? body.isActive : true,
                isFree: parseFloat(body.price) === 0,
                userId: userId
            },
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error: any) {
        console.error('Error creating course:', error);

        let errorMessage = 'حدث خطأ في إنشاء الدورة';

        if (error.code === 'P2002') {
            errorMessage = 'يوجد دورة بنفس العنوان بالفعل. جرب عنواناً مختلفاً.';
        }

        return NextResponse.json(
            { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 400 }
        );
    }
}
