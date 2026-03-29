import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FiSearch, FiLayers, FiTrendingUp, FiStar, FiArrowRight, FiFilter, FiCheckCircle } from 'react-icons/fi';
import ExploreClientWrapper from './ExploreClientWrapper';

export const metadata = {
    title: 'تصفح المتجر والمبدعين | تمالين',
    description: 'اكتشف أفضل المنتجات الرقمية والدورات التدريبية من نخبة صناع المحتوى في الوطن العربي.',
};

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; sort?: string; minPrice?: string; maxPrice?: string }>
}) {
    const { q: query = '', category = '', sort = 'newest', minPrice = '', maxPrice = '' } = await searchParams;

    const minP = minPrice ? parseFloat(minPrice) : undefined;
    const maxP = maxPrice ? parseFloat(maxPrice) : undefined;

    const searchFilter = query ? {
        OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { tags: { has: query } }
        ]
    } : {};

    const priceFilter = (minP !== undefined || maxP !== undefined) ? {
        price: {
            gte: minP,
            lte: maxP
        }
    } : {};

    const showOnlyCourses = category === 'courses';
    const showOnlyProducts = category && !showOnlyCourses;
    const productCategoryFilter = showOnlyProducts ? { category } : {};

    let products: any[] = [];
    let courses: any[] = [];

    try {
        if (!showOnlyCourses) {
            products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    ...searchFilter,
                    ...productCategoryFilter,
                    ...priceFilter
                },
                include: { user: { select: { name: true, brandColor: true, avatar: true, username: true } } },
                orderBy: sort === 'price_asc' ? { price: 'asc' } :
                    sort === 'price_desc' ? { price: 'desc' } :
                        sort === 'popular' ? { soldCount: 'desc' } :
                            { createdAt: 'desc' },
                take: 36
            });
        }

        if (!showOnlyProducts) {
            // @ts-ignore
            courses = await prisma.course.findMany({
                where: {
                    isActive: true,
                    // @ts-ignore
                    status: 'APPROVED',
                    ...searchFilter,
                    ...priceFilter
                },
                include: { user: { select: { name: true, brandColor: true, avatar: true, username: true } } },
                orderBy: sort === 'price_asc' ? { price: 'asc' } :
                    sort === 'price_desc' ? { price: 'desc' } :
                        { createdAt: 'desc' },
                take: 36
            });
        }
    } catch (err) {
        console.error('[ExplorePage] DB error:', err);
        products = [];
        courses = [];
    }

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
        <div className="min-h-screen bg-white pt-20 pb-24 selection:bg-accent/20">

            {/* Premium Corporate Search Header */}
            <div className="relative bg-ink text-white py-24 md:py-32 overflow-hidden border-b border-white/5">
                {/* Refined Accents */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent/10 rounded-xl blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-xl blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

                <div className="max-w-5xl mx-auto relative z-10 text-center px-6">
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] mb-10 text-accent shadow-sm">
                            <FiSearch size={14} /> Explore Knowledge Market
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter leading-[1.1]">
                            اكتشف الإبداع <span className="text-accent">العربي</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-bold leading-relaxed">
                            تصفح آلاف المنتجات الرقمية والدورات التدريبية الموثوقة من نخبة الخبراء والمبدعين.
                        </p>
                    </div>

                    {/* Master Search Form - High Performance UI */}
                    <form className="max-w-4xl mx-auto space-y-4">
                        <div className="flex flex-col md:flex-row gap-2 bg-white/5 p-2 rounded-[2rem] border border-white/10  shadow-sm">
                            <div className="relative flex-1">
                                <FiSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={query}
                                    placeholder="ماذا تود أن تتعلم أو تشاهد اليوم؟"
                                    className="w-full pl-6 pr-16 py-5 rounded-xl bg-white text-ink font-bold placeholder:font-bold placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-accent/20 transition-all border-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    name="category"
                                    defaultValue={category}
                                    className="w-40 bg-white/5 border border-white/10 rounded-xl px-6 py-5 font-bold text-sm text-white focus:bg-white focus:text-ink outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">كل الفئات</option>
                                    <option value="courses">دورات تعليمية</option>
                                    <option value="ebooks">كتب رقمية</option>
                                    <option value="templates">قوالب وأدوات</option>
                                </select>
                                <button type="submit" className="bg-accent text-white px-12 py-5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent-hover transition-all shadow-sm shadow-accent/20 active:scale-95">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Advanced Filters Row */}
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl">
                                <FiFilter className="text-accent" size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Price Range:</span>
                                <input type="number" name="minPrice" placeholder="Min" defaultValue={minPrice} className="w-16 bg-transparent border-none text-xs font-bold text-center p-0 focus:ring-0 text-white placeholder:text-gray-600" />
                                <span className="text-gray-700">|</span>
                                <input type="number" name="maxPrice" placeholder="Max" defaultValue={maxPrice} className="w-16 bg-transparent border-none text-xs font-bold text-center p-0 focus:ring-0 text-white placeholder:text-gray-600" />
                            </div>

                            <select
                                name="sort"
                                defaultValue={sort}
                                className="bg-white/5 border border-white/10 rounded-xl px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white outline-none focus:bg-white focus:text-ink transition-all cursor-pointer"
                            >
                                <option value="newest">Latest First</option>
                                <option value="popular">Best Sellers</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Results Section */}
            <div className="max-w-7xl mx-auto px-6 mt-20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-16 border-r-4 border-ink pr-8">
                    <div>
                        <h2 className="text-3xl font-bold text-ink tracking-tight mb-2">
                            {query ? (
                                <>نتائج البحث عن: <span className="text-accent underline underline-offset-8">"{query}"</span></>
                            ) : category ? (
                                <>تصفح: <span className="text-accent">{category === 'courses' ? 'الأكاديمية' : category === 'ebooks' ? 'المكتبة الرقمية' : category}</span></>
                            ) : (
                                <>أحدث الإضافات <span className="text-accent">للسوق</span></>
                            )}
                        </h2>
                        <p className="text-gray-400 font-bold text-sm">تم العثور على {allItems.length} منتج متاح حالياً.</p>
                    </div>
                </div>

                {allItems.length === 0 ? (
                    <div className="text-center py-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 p-8">
                        <div className="w-24 h-24 bg-white rounded-xl shadow-sm shadow-gray-200/50 flex items-center justify-center mx-auto mb-10 text-gray-200">
                            <FiSearch size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-ink mb-4">للأسف، لم نجد ما يحاكي بحثك</h3>
                        <p className="text-gray-500 font-bold max-w-sm mx-auto mb-12">حاول استخدام كلمات مفتاحية أكثر عمومية أو قم بإعادة ضبط الفلاتر.</p>
                        <Link href="/explore" className="inline-flex py-4 px-10 bg-ink text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm shadow-ink/10">
                            Reset Search
                        </Link>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <ExploreClientWrapper allItems={allItems} />
                    </div>
                )}
            </div>
            
            {/* Professional Bottom CTA */}
            <div className="max-w-7xl mx-auto px-6 mt-32">
                <div className="bg-gray-50 rounded-[3rem] p-12 md:p-20 border border-gray-100 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-accent/5 rounded-xl blur-[100px]"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-5xl font-bold text-ink tracking-tighter mb-8 leading-tight">جاهز لبيع منتجاتك الخاصة؟</h3>
                        <p className="text-gray-400 text-lg font-bold mb-12 max-w-xl mx-auto">انضم لآلاف البائعين في تمالين وافتح متجرك الاحترافي خلال أقل من 5 دقائق.</p>
                        <Link href="/register" className="inline-flex items-center gap-3 py-5 px-12 bg-ink text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-sm shadow-ink/10">
                            Start Selling Now <FiArrowRight className="rotate-180" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
