import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import CourseClient from './CourseClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const course = await prisma.course.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!course) return { title: 'دورة غير موجودة' };

    const description = course.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
    const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'تمالين';

    return {
        title: `${course.title} | ${platformName}`,
        description,
        openGraph: {
            title: course.title,
            description,
            images: [course.image || '/og-image.png'],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: course.title,
            description,
            images: [course.image || '/og-image.png'],
        },
    };
}

export default async function CoursePage({ params }: Props) {
    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: { 
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    brandColor: true
                }
            }
        }
    });

    if (!course) notFound();

    const reviews = await prisma.review.findMany({
        where: { productId: id },
        orderBy: { createdAt: 'desc' }
    });

    // Serialize dates for client component
    const serializedCourse = JSON.parse(JSON.stringify(course));
    const serializedReviews = JSON.parse(JSON.stringify(reviews));

    return <CourseClient course={serializedCourse} reviews={serializedReviews} id={id} />;
}
