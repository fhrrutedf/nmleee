import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@/lib/db';
import ProfileClient from './ProfileClient';
import { FiStar } from 'react-icons/fi';
import Link from 'next/link';

type Props = {
    params: Promise<{ username: string }>
}

// 1. Dynamic SEO (Open Graph / Meta Tags)
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const rawUsername = (await params).username;
    const decodedUsername = decodeURIComponent(rawUsername);
    const username = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername;

    const creator = await prisma.user.findUnique({
        where: { username },
        select: {
            name: true,
            bio: true,
            avatar: true,
            coverImage: true,
            brandColor: true
        }
    });

    if (!creator) {
        return {
            title: 'البائع غير موجود | تمكين',
            description: 'عذراً، هذا البائع غير مسجل في منصة تمكين.',
        }
    }

    const previousImages = (await parent).openGraph?.images || [];
    const siteTitle = `${creator.name} | متجر المنتجات والدورات`;
    const siteDescription = creator.bio || `اكتشف أفضل المنتجات والدورات التدريبية المقدمة من ${creator.name} حصرياً على منصة تمكين.`;

    return {
        title: siteTitle,
        description: siteDescription,
        themeColor: creator.brandColor || '#0ea5e9',
        openGraph: {
            title: siteTitle,
            description: siteDescription,
            url: `https://tmleen.com/${username}`,
            siteName: 'منصة تمكين',
            images: [
                creator.avatar || creator.coverImage || '',
                ...previousImages,
            ].filter(Boolean),
            type: 'profile',
        },
        twitter: {
            card: 'summary_large_image',
            title: siteTitle,
            description: siteDescription,
            images: [creator.avatar || creator.coverImage || ''],
        }
    }
}

// 2. Server Component For Data Fetching
export default async function CreatorProfilePage({ params }: Props) {
    const rawUsername = (await params).username;
    const decodedUsername = decodeURIComponent(rawUsername);
    const username = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername;

    // Fetch Creator
    const creator = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            bio: true,
            avatar: true,
            coverImage: true,
            brandColor: true,
            facebook: true,
            twitter: true,
            instagram: true,
            website: true,
            phone: true,
            country: true,
            consultationPrice: true,
            role: true,
            createdAt: true,
        },
    });

    if (!creator) {
        return (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
                <FiStar className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-primary-charcoal dark:text-gray-200">
                    لم يتم العثور على هذا المدرب/البائع أو الصفحة غير موجودة.
                </h1>
                <Link href="/" className="btn btn-primary mt-4">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    // Fetch Products & Courses
    const [productsRaw, coursesRaw] = await Promise.all([
        prisma.product.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.course.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: { createdAt: 'desc' },
        })
    ]);

    // Unify mapping
    const productsList = productsRaw.map(p => ({
        ...p,
        isFree: p.isFree || p.price === 0,
    }));

    const coursesList = coursesRaw.map(c => ({
        ...c,
        category: 'courses', // Force category for courses to easily filter in client
        isFree: c.price === 0,
    }));

    const combinedProducts = [...productsList, ...coursesList].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pass data to Client Component
    return (
        <ProfileClient
            creator={creator}
            products={combinedProducts}
        />
    );
}
