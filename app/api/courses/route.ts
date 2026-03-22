import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

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

// Helper to ensure unique slug across both products and courses for a user
async function ensureUniqueSlug(baseSlug: string, userId: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        // Check products
        const existingProduct = await prisma.product.findFirst({
            where: { userId, slug }
        });

        // Check courses
        const existingCourse = await prisma.course.findFirst({
            where: { userId, slug }
        });

        if (!existingProduct && !existingCourse) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const sellerId = searchParams.get('sellerId');
        const q = searchParams.get('q');
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        // Build the where clause
        const where: any = {};

        if (sellerId) {
            where.userId = sellerId;
            where.isActive = true;
        } else if (session?.user && !q && !category && !tag) {
            // Only defaults to dashboard view if it's a simple request from dashboard
            where.userId = (session.user as any).id;
        } else {
            where.isActive = true;
        }

        // Add search filters
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ];
        }

        if (category) {
            where.category = category;
        }

        if (tag) {
            where.tags = { has: tag };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const courses = await prisma.course.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true
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

        // Generate unique slug
        const baseSlug = generateSlug(body.title);
        const slug = await ensureUniqueSlug(baseSlug, userId);

        // إنشاء دورة جديدة
        const course = await prisma.course.create({
            data: {
                slug,
                title: body.title,
                description: body.description,
                price: body.price ? parseFloat(body.price.toString()) : 0,
                category: body.category || null,
                image: body.image || null,
                tags: body.tags || [],
                duration: body.duration || null,
                sessions: body.sessions ? parseInt(body.sessions.toString()) : null,
                isActive: body.isActive !== undefined ? body.isActive : true,
                zoomLink: body.zoomLink || null,
                meetLink: body.meetLink || null,
                trailerUrl: body.trailerUrl || null,
                attachments: body.attachments || [],
                format: body.format || 'recorded',
                originalPrice: body.originalPrice ? parseFloat(body.originalPrice.toString()) : null,
                enablePPP: body.enablePPP || false,
                prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites : (typeof body.prerequisites === 'string' && body.prerequisites ? body.prerequisites.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
                upsellCourseId: body.upsellCourseId || null,
                upsellPrice: body.upsellPrice ? parseFloat(body.upsellPrice.toString()) : null,
                offerExpiresAt: body.offerExpiresAt ? new Date(body.offerExpiresAt) : null,
                userId: userId,
                status: 'APPROVED'
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
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
