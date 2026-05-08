import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import CourseClient from './CourseClient';
import { notFound } from 'next/navigation';

const PLATFORM_NAME = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'منصة مناسة الرقمية';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manasadigital.com';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const course = await prisma.course.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
        include: { user: { select: { name: true, username: true } } }
    });

    if (!course) return { title: 'دورة غير موجودة' };

    const description = course.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
    const imageUrl = course.image || `${SITE_URL}/og-image.png`;
    const canonicalUrl = `${SITE_URL}/course/${course.slug || course.id}`;
    const instructorName = course.user?.name || '';

    return {
        title: `${course.title} | ${instructorName ? `${instructorName} | ` : ''}${PLATFORM_NAME}`,
        description,
        keywords: [course.title, course.category || '', 'دورة تدريبية', 'كورس', instructorName, PLATFORM_NAME].filter(Boolean),
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: `${course.title} | ${PLATFORM_NAME}`,
            description,
            url: canonicalUrl,
            siteName: PLATFORM_NAME,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: course.title }],
            type: 'website',
            locale: 'ar_AR',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${course.title} | ${PLATFORM_NAME}`,
            description,
            images: [imageUrl],
        },
    };
}

export default async function CoursePage({ params }: Props) {
    const { slug } = await params;

    const course = await prisma.course.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
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
        where: { productId: course.id },
        orderBy: { createdAt: 'desc' }
    });

    // JSON-LD Schema للكورس
    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description.replace(/<[^>]*>?/gm, '').substring(0, 500),
        url: `${SITE_URL}/course/${course.slug || course.id}`,
        image: course.image || `${SITE_URL}/og-image.png`,
        provider: {
            '@type': 'Organization',
            name: course.user?.name || PLATFORM_NAME,
            url: course.user?.username ? `${SITE_URL}/@${course.user.username}` : SITE_URL,
        },
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: course.format === 'live' ? 'synchronous' : 'asynchronous',
            offers: {
                '@type': 'Offer',
                priceCurrency: course.currency || 'USD',
                price: course.price,
                availability: course.isActive
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
            },
        },
        ...(course.averageRating && course.reviewCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: course.averageRating,
                reviewCount: course.reviewCount,
            },
        }),
    };

    const serializedCourse = JSON.parse(JSON.stringify(course));
    const serializedReviews = JSON.parse(JSON.stringify(reviews));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
            />
            <CourseClient course={serializedCourse} reviews={serializedReviews} id={course.id} />
        </>
    );
}
