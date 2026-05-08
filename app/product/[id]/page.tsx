import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

const PLATFORM_NAME = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'منصة مناسة الرقمية';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manasadigital.com';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    // البحث بالـ slug أولاً، ثم بالـ id كـ fallback للروابط القديمة
    const product = await prisma.product.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
        include: { user: { select: { name: true, username: true } } }
    });

    if (!product) return { title: 'منتج غير موجود' };

    const description = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
    const imageUrl = product.image || `${SITE_URL}/og-image.png`;
    const canonicalUrl = `${SITE_URL}/product/${product.slug || product.id}`;
    const sellerName = product.user?.name || '';

    return {
        title: `${product.title} | ${sellerName ? `${sellerName} | ` : ''}${PLATFORM_NAME}`,
        description,
        keywords: [product.title, product.category || '', 'منتج رقمي', sellerName, PLATFORM_NAME].filter(Boolean),
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: `${product.title} | ${PLATFORM_NAME}`,
            description,
            url: canonicalUrl,
            siteName: PLATFORM_NAME,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: product.title }],
            type: 'website',
            locale: 'ar_AR',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.title} | ${PLATFORM_NAME}`,
            description,
            images: [imageUrl],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    // البحث بالـ slug أولاً، ثم بالـ id كـ fallback
    const product = await prisma.product.findFirst({
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

    if (!product) notFound();

    // إذا وصل بالـ id وعنده slug → سيتم التعامل معه بشكل طبيعي
    // (الـ 301 redirect يعمل في next.config.js)

    const reviews: any[] = [];

    const settings = await prisma.platformSettings.findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    // JSON-LD Schema للمنتج
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description.replace(/<[^>]*>?/gm, '').substring(0, 500),
        image: product.image || `${SITE_URL}/og-image.png`,
        url: `${SITE_URL}/product/${product.slug || product.id}`,
        ...(product.user && {
            brand: { '@type': 'Brand', name: product.user.name || PLATFORM_NAME },
            offers: {
                '@type': 'Offer',
                priceCurrency: product.currency || 'USD',
                price: product.price,
                availability: product.isActive
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                seller: { '@type': 'Organization', name: product.user.name || PLATFORM_NAME },
            },
        }),
        ...(product.averageRating && product.reviewCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.averageRating,
                reviewCount: product.reviewCount,
            },
        }),
    };

    const serializedProduct = JSON.parse(JSON.stringify(product));
    const serializedReviews = JSON.parse(JSON.stringify(reviews));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <ProductClient
                product={serializedProduct}
                reviews={serializedReviews}
                id={product.id}
                supportWhatsapp={settings?.supportWhatsapp || '963934360340'}
            />
        </>
    );
}
