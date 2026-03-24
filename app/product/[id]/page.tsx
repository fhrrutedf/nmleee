import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!product) return { title: 'منتج غير موجود' };

    const description = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
    const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'تمالين';

    return {
        title: `${product.title} | ${platformName}`,
        description,
        openGraph: {
            title: product.title,
            description,
            images: [product.image || '/og-image.png'],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description,
            images: [product.image || '/og-image.png'],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
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

    if (!product) notFound();

    // Fetch Platform Settings for Dynamic Support Number
    const settings = await prisma.platformSettings.findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    // Serialize dates for client component
    const serializedProduct = JSON.parse(JSON.stringify(product));
    const serializedReviews = JSON.parse(JSON.stringify(reviews));

    return (
        <ProductClient 
            product={serializedProduct} 
            reviews={serializedReviews} 
            id={id} 
            supportWhatsapp={settings?.supportWhatsapp || '963934360340'} // Fallback to your number if settings not found
        />
    );
}
