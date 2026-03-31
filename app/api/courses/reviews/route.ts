import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Get reviews for a course
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: {
                courseId: courseId,
                isApproved: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            averageRating: Math.round(avgRating * 10) / 10,
            totalCount: reviews.length
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// Create a review (student must be enrolled)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, rating, comment } = await request.json();

        if (!courseId || !rating || !comment) {
            return NextResponse.json(
                { error: 'Course ID, rating, and comment required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if student is enrolled
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                courseId_studentEmail: {
                    courseId,
                    studentEmail: session.user.email
                }
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'You must be enrolled to review this course' },
                { status: 403 }
            );
        }

        // Check if already reviewed
        const existingReview = await prisma.review.findFirst({
            where: {
                courseId,
                studentEmail: session.user.email
            }
        });

        if (existingReview) {
            // Update existing review
            const updated = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    comment,
                    isApproved: true
                }
            });

            // Update course average
            await updateCourseAverage(courseId);

            return NextResponse.json({
                success: true,
                review: updated,
                message: 'تم تحديث تقييمك'
            });
        }

        // Create new review
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                name: session.user.name || 'طالب',
                studentEmail: session.user.email,
                courseId,
                isApproved: true
            }
        });

        // Update course average rating
        await updateCourseAverage(courseId);

        return NextResponse.json({
            success: true,
            review,
            message: 'تم إضافة تقييمك بنجاح'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}

// Delete review
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get('id');

        if (!reviewId) {
            return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Can only delete own review
        if (review.studentEmail !== session.user.email) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        // Update course average
        await updateCourseAverage(review.courseId);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}

async function updateCourseAverage(courseId: string) {
    const reviews = await prisma.review.findMany({
        where: {
            courseId,
            isApproved: true
        }
    });

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await prisma.course.update({
        where: { id: courseId },
        data: {
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length
        }
    });
}
