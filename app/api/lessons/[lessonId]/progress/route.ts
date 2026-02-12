import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - تحديث تقدم الدرس
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const body = await req.json();
        const { enrollmentId, watchedDuration, isCompleted } = body;

        if (!enrollmentId) {
            return NextResponse.json({ error: 'معرف التسجيل مطلوب' }, { status: 400 });
        }

        const { lessonId } = await params;

        // Check if progress record exists
        const existingProgress = await prisma.lessonProgress.findUnique({
            where: {
                lessonId_enrollmentId: {
                    lessonId,
                    enrollmentId,
                }
            }
        });

        let progress;
        if (existingProgress) {
            // Update existing progress
            progress = await prisma.lessonProgress.update({
                where: {
                    lessonId_enrollmentId: {
                        lessonId,
                        enrollmentId,
                    }
                },
                data: {
                    ...(watchedDuration !== undefined && { watchedDuration }),
                    ...(typeof isCompleted === 'boolean' && { isCompleted }),
                    lastWatchedAt: new Date(),
                },
            });
        } else {
            // Create new progress record
            progress = await prisma.lessonProgress.create({
                data: {
                    lessonId,
                    enrollmentId,
                    watchedDuration: watchedDuration || 0,
                    isCompleted: isCompleted || false,
                },
            });
        }

        // Update course enrollment progress
        if (isCompleted) {
            await updateCourseProgress(enrollmentId);
        }

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تحديث التقدم' }, { status: 500 });
    }
}

// Helper function to update course progress
async function updateCourseProgress(enrollmentId: string) {
    try {
        const enrollment = await prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: true,
                            }
                        }
                    }
                },
                lessonProgress: true,
            }
        });

        if (!enrollment) return;

        // Calculate total lessons
        const totalLessons = enrollment.course.modules.reduce(
            (sum, module) => sum + module.lessons.length,
            0
        );

        // Calculate completed lessons
        const completedLessons = enrollment.lessonProgress.filter(
            (progress) => progress.isCompleted
        ).length;

        // Calculate progress percentage
        const progressPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // Update enrollment
        await prisma.courseEnrollment.update({
            where: { id: enrollmentId },
            data: {
                progress: progressPercentage,
                isCompleted: progressPercentage === 100,
                completedAt: progressPercentage === 100 ? new Date() : null,
                lastAccessedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Error updating course progress:', error);
    }
}
