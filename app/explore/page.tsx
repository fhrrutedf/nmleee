import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FiSearch, FiLayers, FiTrendingUp, FiStar } from 'react-icons/fi';
import ExploreClientWrapper from './ExploreClientWrapper';

export const metadata = {
    title: 'تصفح المتجر والمبدعين | منصتنا',
    description: 'اكتشف أفضل المنتجات الرقمية والدورات التدريبية من نخبة صناع المحتوى في الوطن العربي.',
};

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; sort?: string }>
}) {
    const { q: query = '', category = '', sort = 'newest' } = await searchParams;

    // Build text search filter
    const searchFilter = query ? {
        OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } }
        ]
    } : {};

    // "courses" category means only show courses (not a DB category value)
    const showOnlyCourses = category === 'courses';
    const showOnlyProducts = category && !showOnlyCourses;
    const productCategoryFilter = showOnlyProducts ? { category } : {};

    let products: any[] = [];
    let courses: any[] = [];

    try {
        if (!showOnlyCourses) {
            // Fetch Products
            products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    ...searchFilter,
                    ...productCategoryFilter
                },
                include: { user: { select: { name: true, brandColor: true, avatar: true, username: true } } },
                orderBy: sort === 'price_asc' ? { price: 'asc' } :
                    sort === 'price_desc' ? { price: 'desc' } :
                        sort === 'popular' ? { soldCount: 'desc' } :
                            { createdAt: 'desc' },
                take: 30
            });
        }

        if (!showOnlyProducts) {
            // Fetch Courses (no category filter - courses use Arabic categories)
            courses = await prisma.course.findMany({
                where: {
                    isActive: true,
                    ...searchFilter,
                },
                include: { user: { select: { name: true, brandColor: true, avatar: true, username: true } } },
                orderBy: sort === 'price_asc' ? { price: 'asc' } :
                    sort === 'price_desc' ? { price: 'desc' } :
                        { createdAt: 'desc' },
                take: 30
            });
        }
    } catch (err) {
        console.error('[ExplorePage] DB error:', err);
        // Graceful degradation: show empty state instead of 500
        products = [];
        courses = [];
    }

    // Combine and Sort
    const allItems = [
        ...products.map(p => ({ ...p, itemType: 'product' as const })),
        ...courses.map(c => ({ ...c, itemType: 'course' as const }))
    ].sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price;
        if (sort === 'price_desc') return b.price - a.price;
        if (sort === 'popular') return ((b as any).soldCount || 0) - ((a as any).soldCount || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-20 pb-24">

            {/* Spectacular Cover Search Area */}
            <div className="relative bg-gradient-to-br from-action-blue to-purple-800 text-white overflow-hidden pb-16 pt-20 px-4 sm:px-6">
                <div className="absolute inset-0 pattern-dots text-white/5 mix-blend-overlay"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-500/20 blur-[80px] rounded-full"></div>

                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 drop-shadow-lg leading-tight">
                        اكتشف الإبداع بلا حدود
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-50 dark:text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-sm">
                        آلاف المنتجات الرقمية والدورات التعليمية الموثوقة من نخبة صناع المحتوى والخبراء.
                    </p>

                    <form className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto bg-white/10 dark:bg-black/20 p-2 sm:p-3 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
                        <div className="relative flex-1">
                            <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 text-xl" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="عمّ تبحث اليوم؟ كورس، كتاب، قالب..."
                                className="w-full pl-4 pr-14 py-4 sm:py-5 rounded-2xl bg-white dark:bg-gray-900 border-none focus:ring-4 focus:ring-action-blue/30 outline-none text-lg text-primary-charcoal dark:text-white font-bold placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-inner"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                name="category"
                                defaultValue={category}
                                className="w-full md:w-auto py-4 sm:py-5 px-6 rounded-2xl border-none focus:ring-4 focus:ring-action-blue/30 outline-none bg-white dark:bg-gray-900 text-primary-charcoal dark:text-white font-bold cursor-pointer shadow-inner"
                            >
                                <option value="">كل الأقسام</option>
                                <option value="courses">دورات تعليمية</option>
                                <option value="ebooks">كتب إلكترونية</option>
                                <option value="templates">قوالب وأدوات</option>
                            </select>

                            <select
                                name="sort"
                                defaultValue={sort}
                                className="hidden sm:block py-4 sm:py-5 px-6 rounded-2xl border-none focus:ring-4 focus:ring-action-blue/30 outline-none bg-white dark:bg-gray-900 text-primary-charcoal dark:text-white font-bold cursor-pointer shadow-inner"
                            >
                                <option value="newest">الأحدث</option>
                                <option value="popular">الأكثر مبيعاً</option>
                                <option value="price_asc">الأقل سعراً</option>
                                <option value="price_desc">الأعلى سعراً</option>
                            </select>

                            <button type="submit" className="bg-primary-charcoal dark:bg-action-blue text-white px-8 py-4 sm:py-5 rounded-2xl font-black hover:bg-black dark:hover:bg-blue-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 whitespace-nowrap text-lg flex items-center gap-2">
                                <FiSearch /> <span className="hidden sm:inline">بحث</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 p-4 sm:p-6 rounded-3xl shadow-sm">
                    <h2 className="text-2xl sm:text-3xl font-black text-primary-charcoal dark:text-white flex items-center gap-3">
                        {query ? (
                            <><FiSearch className="text-action-blue" /> نتائج البحث عن "<span className="text-action-blue">{query}</span>"</>
                        ) : category ? (
                            <><FiLayers className="text-action-blue" /> تصفح قسم: <span className="text-action-blue">{category === 'courses' ? 'دورات تعليمية' : category === 'ebooks' ? 'كتب إلكترونية' : category}</span></>
                        ) : sort === 'popular' ? (
                            <><FiTrendingUp className="text-action-blue" /> الأكثر مبيعاً وتقييماً</>
                        ) : (
                            <><FiStar className="text-yellow-400" /> أحدث الإضافات للمتجر</>
                        )}
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm py-1 px-3 rounded-full">{allItems.length} نتيجة</span>
                    </h2>

                    {/* Mobile Sort display */}
                    <div className="sm:hidden w-full">
                        <form>
                            <input type="hidden" name="q" value={query} />
                            <input type="hidden" name="category" value={category} />
                            <select
                                name="sort"
                                defaultValue={sort}
                                onChange={(e) => e.target.form?.submit()}
                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-primary-charcoal dark:text-white font-bold"
                            >
                                <option value="newest">ترتيب לפי: الأحدث</option>
                                <option value="popular">الأكثر مبيعاً</option>
                                <option value="price_asc">الأقل سعراً</option>
                                <option value="price_desc">الأعلى سعراً</option>
                            </select>
                        </form>
                    </div>
                </div>

                {allItems.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-card-white rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm px-4">
                        <div className="w-28 h-28 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-action-blue">
                            <FiSearch className="text-5xl" />
                        </div>
                        <h3 className="text-2xl font-black text-primary-charcoal dark:text-white mb-3">للأسف، لم نجد نتائج مطابقة لبحثك</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
                            جرب استخدام كلمات مفتاحية أخرى، أو قم بتغيير الفلاتر والأقسام للوصول لما تبحث عنه.
                        </p>
                        <Link href="/explore" className="btn btn-primary px-8 py-3 text-lg font-bold shadow-xl shadow-action-blue/20">
                            استكشف المتجر بالكامل
                        </Link>
                    </div>
                ) : (
                    <ExploreClientWrapper allItems={allItems} />
                )}
            </div>
        </div>
    );
}
