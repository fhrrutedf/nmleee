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
            brandColor: true,
            brandSecondaryColor: true,
            brandFont: true,
            brandButtonStyle: true,
            brandLayout: true,
            storeBanner: true,
            storeTagline: true,
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
            brandSecondaryColor: true,
            brandFont: true,
            brandButtonStyle: true,
            brandLayout: true,
            storeBanner: true,
            storeTagline: true,
            facebook: true,
            twitter: true,
            instagram: true,
            website: true,
            phone: true,
            consultationPrice: true,
            role: true,
            createdAt: true,
            // Store Privacy Settings
            showProductsCount: true,
            showSalesCount: true,
            showRevenue: true,
            showRating: true,
        },
    });

    if (!creator) {
        return (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-4 text-center">
                <FiStar className="text-6xl text-gray-300 dark:text-gray-300 mb-6" />
                <h1 className="text-2xl font-bold mb-4 text-[#10B981] dark:text-gray-200">
                    لم يتم العثور على هذا المدرب/البائع أو الصفحة غير موجودة.
                </h1>
                <Link href="/" className="btn btn-primary mt-4">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    // Fetch Products, Courses, Bundles, and calculate REAL stats
    const [productsRaw, coursesRaw, bundlesRaw, ordersStats, reviewsStats, enrollmentsStats] = await Promise.all([
        prisma.product.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { reviews: true } }
            }
        }),
        prisma.course.findMany({
            where: { userId: creator.id, isActive: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.bundle.findMany({
            where: { userId: creator.id, isActive: true },
            include: {
                products: {
                    include: {
                        product: { select: { id: true, title: true, price: true, image: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        // Real sold count from orders
        prisma.order.aggregate({
            where: { 
                sellerId: creator.id,
                status: { in: ['PAID', 'COMPLETED'] }
            },
            _count: { id: true },
            _sum: { totalAmount: true }
        }),
        // Real reviews and ratings
        prisma.review.aggregate({
            where: {
                product: { userId: creator.id }
            },
            _avg: { rating: true },
            _count: { id: true }
        }),
        // Course enrollments count
        prisma.courseEnrollment.count({
            where: {
                course: { userId: creator.id }
            }
        })
    ]);

    // Calculate real stats
    const totalSold = ordersStats._count.id + enrollmentsStats;
    const averageRating = reviewsStats._avg.rating || 0;
    const totalReviews = reviewsStats._count.id;
    const totalRevenue = ordersStats._sum.totalAmount || 0;

    // Unify mapping with real stats
    const productsList = productsRaw.map(p => ({
        ...p,
        isFree: p.isFree || p.price === 0,
        reviewCount: p._count?.reviews || 0,
    }));

    const coursesList = coursesRaw.map(c => ({
        ...c,
        category: 'courses',
        isFree: c.price === 0,
    }));

    const combinedProducts = [...productsList, ...coursesList].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pass data to Client Component with REAL stats
    return (
        <ProfileClient
            creator={creator}
            products={combinedProducts}
            bundles={bundlesRaw}
            stats={{
                totalSold,
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews,
                totalRevenue
            }}
        />
    );

}
