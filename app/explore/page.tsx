import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiFilter, FiStar, FiClock } from 'react-icons/fi';
import ExploreClientWrapper from './ExploreClientWrapper';

export const metadata = {
    title: 'استكشاف الكورسات والمنتجات | منصتنا',
    description: 'ابحث عن أفضل الكورسات والمنتجات الرقمية من نخبة صناع المحتوى.',
};

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
    const { q: query = '', category = '', sort = 'newest' } = await searchParams;

    // Fetch Products
    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            ...(query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            } : {}),
            ...(category ? { category } : {})
        },
        include: { user: { select: { name: true, brandColor: true } } },
        orderBy: sort === 'price_asc' ? { price: 'asc' } :
            sort === 'price_desc' ? { price: 'desc' } :
                { createdAt: 'desc' },
        take: 20
    });

    // Fetch Courses
    const courses = await prisma.course.findMany({
        where: {
            isActive: true,
            ...(query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            } : {}),
            ...(category ? { category } : {})
        },
        include: { user: { select: { name: true, brandColor: true } } },
        orderBy: sort === 'price_asc' ? { price: 'asc' } :
            sort === 'price_desc' ? { price: 'desc' } :
                { createdAt: 'desc' },
        take: 20
    });

    // Combine and sort
    const allItems = [
        ...products.map(p => ({ ...p, itemType: 'product' as const })),
        ...courses.map(c => ({ ...c, itemType: 'course' as const }))
    ].sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price;
        if (sort === 'price_desc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-bg-light pt-24 pb-20">
            {/* Header / Search Section */}
            <div className="bg-white border-b border-gray-100 py-12 mb-10">
                <div className="container-custom max-w-5xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-primary-charcoal mb-4">
                        اكتشف أفضل الكورسات والمنتجات
                    </h1>
                    <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
                        آلاف المنتجات الرقمية والدورات التعليمية الموثوقة من صناع محتوى محترفين.
                    </p>

                    <form className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
                        <div className="relative flex-1">
                            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="ابحث عن كورس، قالب، أداة..."
                                className="w-full pl-4 pr-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-action-blue outline-none text-lg"
                            />
                        </div>
                        <select
                            name="sort"
                            defaultValue={sort}
                            className="py-4 px-6 rounded-xl border border-gray-200 focus:ring-2 focus:ring-action-blue outline-none bg-white font-medium"
                        >
                            <option value="newest">الأحدث</option>
                            <option value="price_asc">الأقل سعراً</option>
                            <option value="price_desc">الأعلى سعراً</option>
                        </select>
                        <button type="submit" className="bg-action-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap">
                            بحث
                        </button>
                    </form>
                </div>
            </div>

            {/* Results Grid */}
            <div className="container-custom max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {query ? `نتائج البحث عن "${query}"` : 'أحدث الإضافات'}
                        <span className="text-sm font-normal text-gray-500 mr-2">({allItems.length} نتيجة)</span>
                    </h2>
                </div>

                {allItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiSearch className="text-4xl text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج مطابقة</h3>
                        <p className="text-gray-500">جرب البحث بكلمات مختلفة أو إزالة الفلاتر.</p>
                        <Link href="/explore" className="inline-block mt-6 text-action-blue font-medium hover:underline">
                            عرض كل المنتجات
                        </Link>
                    </div>
                ) : (
                    <ExploreClientWrapper allItems={allItems} />
                )}
            </div>
        </div>
    );
}
